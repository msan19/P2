// routeScheduler.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { DataContainer } from "./classes/dataContainer";
import { Route, Instruction } from "../shared/route";
import { RouteSet } from "./classes/routeSet";
import { Order } from "./classes/order";
import { Vertex, ScheduleItem } from "./classes/graph";
import { MinPriorityQueue } from "./classes/minPriorityQueue";
import { randomIntegerInRange, deepCopy } from "../shared/utilities";


/**
 * Object to handle routes.
 * Used for calculations of routes. 
 */
export class RouteScheduler {
    /** Object for data storage */
    data: DataContainer;

    /** Object containing best calculated routes */
    bestRouteSet: RouteSet = null;

    /** Heuristic function for A* implementation */
    heuristic(v1: Vertex, v2: Vertex) { return v1.getDistanceDirect(v2) / this.data.warehouse.maxForkliftSpeed * 1000; };

    /** The index of the permutation in the array of permutations currently being tried */
    permutationCounter: number = 0;

    /** An array of permutations or changes to the priority in which orders are planned*/
    permutations: { index: number, newIndex: number, value: number; }[] = [];

    /** An array of order ids of the orders currently being planned */
    unfinishedOrderIds: string[] = [];

    /** The minimum amount of time between two forklifts crossing the same vertex for a third to cross in the meantime */
    readonly timeIntervalMinimumSize: number = 3000;

    readonly expectedDurationMultiplier: number = 2.0;

    readonly moveForkliftConstant: number = 2.0;

    readonly chargeConstant: number = 2.0;

    readonly permutationConstant: number = 1.0;

    /**
     * Constructor for the object.
     * Contains description of heuristic function, 
     * which can be altered to change the workings
     * of the pathfinding algorithms
     * @param data Data RouteScheduler requires to function
     */
    constructor(data: DataContainer) {
        this.data = data;
    }

    /**
     * Creates the {@link Route} associated with the parameter order id, removes the order from 
     * the list of orders being planned and locks the route as permanent
     * @param orderId A string id for the order to be locked
     * @returns The created {@link Route}
     */
    handleLockOrder(orderId: string): Route {
        let order = this.data.orders[orderId];

        // Get the last scheduleItem for given order, and get forkliftId from this scheduleItem
        let lastScheduleItem = this.getLastScheduleItemForOrder(order);
        let forkliftId = lastScheduleItem.forkliftId;

        // Create route before order is removed from bestRouteSet
        let route: Route = this.getRoute(order, lastScheduleItem, forkliftId);

        // Lock idlePositions from bestRouteSet to this.data.warehouse.graph
        this.data.warehouse.graph.idlePositions[forkliftId] = lastScheduleItem;

        // Splice order from priorities and duration
        this.removeOrderFromBestRouteSet(order);

        // Redo permutations
        this.permute();

        return route;
    }

    /**
     * Looks at the best routeSet and finds a route that matches the orderId.
     * Converts scheduleItems to a route
     * @note Each order Id is unique
     * @param orderId A string that uniquely identifies the given order
     */
    private getRoute(order: Order, lastScheduleItem: ScheduleItem, forkliftId: string): Route {
        // Create a route object for the route of an order on bestRouteSet
        let routeId = "R" + order.id;
        let instructions = this.createInstructions(order);
        let routeStatus = Route.Statuses.queued;

        // Different name, as lastScheduleItem is not fitting for the while loop
        let currentScheduleItem = lastScheduleItem;

        // Inserts all scheduleItems from route of order from bestRouteSet.graph to data.warehouse.graph
        while (currentScheduleItem !== null) {
            this.data.warehouse.graph.vertices[currentScheduleItem.currentVertexId].insertScheduleItem(currentScheduleItem);
            currentScheduleItem = currentScheduleItem.previousScheduleItem;
        }

        return new Route(routeId, order.palletId, forkliftId, order.id, routeStatus, instructions);
    }

    /**
     * Finds the last {@link ScheduleItem} in the route associated with the parameter {@link Order}
     * @param order An orders whose last {@link ScheduleItem} is to be found
     * @returns The found {@link ScheduleItem}
     */
    private getLastScheduleItemForOrder(order: Order): ScheduleItem {
        let endVertex = this.findVertex(order.endVertexId);
        let duration = this.findDuration(order.id);

        return endVertex.getScheduleItem(order.time + duration);
    }

    /**
     * Removes the parameter order from the arrays in bestRouteSet
     * @param order An order to be removed
     */
    removeOrderFromBestRouteSet(order: Order): void {
        let indexOfOrder = this.bestRouteSet.priorities.indexOf(order.id);
        this.bestRouteSet.priorities.splice(indexOfOrder, 1);
        this.bestRouteSet.duration.splice(indexOfOrder, 1);
    }

    /**
     * Creates an array of instruction objects
     * @param order Is a specific order which is retrieved from the array of orders in the following way: this.data.orders[orderId]
     */
    private createInstructions(order: Order): Instruction[] {
        let instructions: Instruction[] = [];

        let endVertex = this.findVertex(order.endVertexId);
        let duration = this.findDuration(order.id);
        let lastScheduleItem = endVertex.getScheduleItem(order.time + duration);

        if (order.type === Order.types.movePallet) {
            this.createMovePalletInstructions(instructions, order, lastScheduleItem, order.time + duration);
        } else if (order.type === Order.types.moveForklift || order.type === Order.types.charge) {
            let nextLastScheduleitem = lastScheduleItem.previousScheduleItem;
            if (nextLastScheduleitem !== null) {
                this.createMoveInstructions(instructions, order, nextLastScheduleitem);
            }
            if (order.type === Order.types.charge) {
                instructions.push(new Instruction(Instruction.types.charge, endVertex.id, order.time + duration));
            }
        }

        instructions.push(new Instruction(Instruction.types.sendFeedback, endVertex.id, order.time + duration));

        return instructions;
    }

    /**
     * Creates an array of instructions recursively by pushing an instruction-object to 
     * the array of instructions passed in as first parameter 
     * @param instructions Is outputparameter. Initially an empty array and after termination an array of instruction objects
     * @param order Is a specific order which is retrieved from the array of orders in the following way: this.data.orders[orderId]
     * @param scheduleItem Initially the last scheduleItem in the route, then scheduleItems predecessors are followed recursively until 
     *                     first schedulteItem in route is reached 
     */
    private createMovePalletInstructions(instructions: Instruction[], order: Order, scheduleItem: ScheduleItem, endVertexTime: number): void {
        let instructionType = Instruction.types.move;
        if (scheduleItem.previousScheduleItem !== null) {
            this.createMovePalletInstructions(instructions, order, scheduleItem.previousScheduleItem, endVertexTime);
            if (scheduleItem.currentVertexId === order.endVertexId && scheduleItem.arrivalTimeCurrentVertex === endVertexTime) {
                instructionType = Instruction.types.unloadPallet;
            }
        } else if (scheduleItem.currentVertexId === order.startVertexId) {
            instructionType = Instruction.types.loadPallet;
        }
        let newInstruction = new Instruction(instructionType, scheduleItem.currentVertexId, scheduleItem.arrivalTimeCurrentVertex);
        instructions.push(newInstruction);
    }

    /**
     * Creates instructions for two different order types:
     * - moveForklift
     * - charge
     * 
     * Follows same procedure as {@link createMovePalletInstructions}: Creates an array of instructions recursively by pushing an instruction-object to
     * the array of instructions passed in as first parameter
     * 
     * @param instructions Is outputparameter. Initially an empty array and after termination an array of all instruction objects except the last instruction object  
     * @param order Is a specific order which is retrieved from the array of orders in the following way: this.data.orders[orderId]
     * @param scheduleItem Initially the next last scheduleItem in the route, then scheduleItems predecessors are followed recursively until
     *                     first schedulteItem in route is reached
     */
    private createMoveInstructions(instructions: Instruction[], order: Order, scheduleItem: ScheduleItem): void {
        let instructionType;
        if (scheduleItem.previousScheduleItem !== null) {
            this.createMoveInstructions(instructions, order, scheduleItem.previousScheduleItem);
        }
        instructionType = Instruction.types.move;
        let newInstruction = new Instruction(instructionType, scheduleItem.currentVertexId, scheduleItem.arrivalTimeCurrentVertex);
        instructions.push(newInstruction);
    }

    /**
     * Finds the {@link Vertex} in bestGraph of the parameter id 
     * @param vertexId An id of the {@link Vertex} to be found
     * @return The found {@link Vertex}
     */
    private findVertex(vertexId: string): Vertex {
        return this.bestRouteSet.graph.vertices[vertexId];
    }

    /**
     * Finds the duration of the parameter order
     * @param orderId An id of an order whose duration is to be found
     * @return The duration of the given order
     */
    private findDuration(orderId: string): number {
        for (let i = 0; i < this.bestRouteSet.duration.length; i++) {
            if (orderId === this.bestRouteSet.priorities[i]) {
                return this.bestRouteSet.duration[i];
            }
        }
        return Infinity;
    }

    /**
     * Calculates all routes of the parameter {@link RouteSet} and creates the associated
     * {@link ScheduleItem} on each {@link Vertex} on the route
     * @param data A {@link DataContainer} givin acces to a dictionary of orders
     * @param routeSet A {@link RouteSet} on which to calculate routes
     */
    private calculateRoutes(data: DataContainer, routeSet: RouteSet): boolean {
        for (let orderId of routeSet.priorities) {
            let order: Order = data.orders[orderId];
            let assignableForklifts: ScheduleItem[] = [];
            let currentRouteTime: number = Infinity;
            let forkliftId: string = order.forkliftId || "";
            let moveForkliftScheduleItems: ScheduleItem[] = [];

            // Handles orders of the movePallet type     
            if (order.type === Order.types.movePallet) {
                assignableForklifts = this.assignForklift(routeSet, order);
                for (let i = 0; i < assignableForklifts.length && currentRouteTime === Infinity; i++) {
                    let expectedStartTimeOfForklift = order.time - this.expectedDurationMultiplier * this.heuristic(routeSet.graph.vertices[assignableForklifts[i].currentVertexId], routeSet.graph.vertices[order.startVertexId]);
                    currentRouteTime = this.planOptimalRoute(routeSet, assignableForklifts[i].currentVertexId, order.startVertexId,
                        expectedStartTimeOfForklift, assignableForklifts[i].forkliftId);
                    if (expectedStartTimeOfForklift + currentRouteTime > order.time) {
                        currentRouteTime = Infinity;
                    }
                    if (currentRouteTime != Infinity) {
                        this.upStackingToArray(routeSet.graph.vertices[order.startVertexId], assignableForklifts[i].currentVertexId,
                            forkliftId, null, moveForkliftScheduleItems);
                        //routeSet.graph.vertices[order.startVertexId].previousVertex = null;
                        currentRouteTime = this.planOptimalRoute(routeSet, order.startVertexId, order.endVertexId,
                            order.time, assignableForklifts[i].forkliftId);

                        forkliftId = assignableForklifts[i].forkliftId;
                    }
                }
            }

            // Handles orders of the moveForklift and charge types
            if (order.type === Order.types.moveForklift || order.type === Order.types.charge) {
                if (routeSet.graph.idlePositions[order.forkliftId].arrivalTimeCurrentVertex <= order.time) {
                    currentRouteTime = this.planOptimalRoute(routeSet, routeSet.graph.idlePositions[order.forkliftId].currentVertexId,
                        order.endVertexId, order.time, order.forkliftId);
                } else currentRouteTime = Infinity;
            }

            // Converts the temporary references on each Vertex to linked ScheduleItems
            if (currentRouteTime != Infinity) {
                if (order.timeType === Order.timeTypes.start) {
                    if (order.type === Order.types.movePallet) {
                        this.insertScheduleItemsArray(routeSet, moveForkliftScheduleItems);
                        this.upStacking(routeSet.graph.vertices[order.endVertexId], order.startVertexId, forkliftId, null);
                        let scheduleItemOfStartVertex = routeSet.graph.vertices[order.startVertexId].getScheduleItem(order.time);
                        scheduleItemOfStartVertex.setPrevious(moveForkliftScheduleItems[0]);
                    } else {
                        let startVertexId = routeSet.graph.idlePositions[order.forkliftId].currentVertexId;
                        this.upStacking(routeSet.graph.vertices[order.endVertexId], startVertexId, forkliftId, null);
                    }
                }
                routeSet.duration.push(currentRouteTime);
                routeSet.graph.idlePositions[forkliftId] = routeSet.graph.vertices[order.endVertexId].getScheduleItem(order.time + currentRouteTime);
            } else {
                return false;
            }
        }
        return true;
    }

    /**
     * Makes an array of idlepositions and estimates for when the forklifts can arrive at the startVertex of the order.
     * Sorts them by when the forklift can be at the startpos
     * Strips the estimates from the array
     * Returns the sorted scheduleitems containing forklifts
     * 
     * @param routeSet 
     * @param order 
     * @returns An array of ScheduleItems based on idleForklifts, sorted by the time at which the forklift can arrive at the startVertex of the order
     */
    assignForklift(routeSet: RouteSet, order: Order): ScheduleItem[] {

        return Object.values(routeSet.graph.idlePositions) // Get array of values
            .map((item) => { // Wrap them in object, containing EstimatedTimeOfArrival at startVertex of the order
                return {
                    scheduleItem: item,
                    startVertexETA: order.time - (item.arrivalTimeCurrentVertex + this.expectedDurationMultiplier * this.heuristic(routeSet.graph.vertices[item.currentVertexId], routeSet.graph.vertices[order.startVertexId]))
                };
            })
            .sort((item1, item2) => { // Sort by ETA
                if (item1.startVertexETA >= 0 && item2.startVertexETA < 0) return -1;
                if (item1.startVertexETA >= 0 && item2.startVertexETA >= 0 && item1.startVertexETA < item2.startVertexETA) return -1;
                if (item1.startVertexETA < 0 && item2.startVertexETA < 0 && item1.startVertexETA > item2.startVertexETA) return -1;
                return 1;
            })
            .map(item => item.scheduleItem); // Unwrap 
    }

    /**
     * Changes bestRouteSet if the parameter newRouteSet has a smaller duration
     * @param newRouteSet A {@link RouteSet} to be compared to bestRouteSet
     */
    private setBestRouteSet(newRouteSet: RouteSet): void {
        if (this.bestRouteSet === null || RouteScheduler.evalRouteSet(newRouteSet) < RouteScheduler.evalRouteSet(this.bestRouteSet)) {
            this.bestRouteSet = newRouteSet;
            this.unfinishedOrderIds = this.bestRouteSet.priorities;
            this.permute();
        }
    }

    /**
     * Sets the permutations array to a new array with permutations for bestRouteSet.
     * The new array is sorted by the least efficient routes first
     */
    private permute(): void {
        let permutations: { index: number, newIndex: number, value: number; }[] = [];

        // Determine values for all routes in bestRouteSet
        let values = this.getRouteAppraisals();

        // Create an array of permuted entries for problematic values (values < ?)
        for (let i = 0; i < values.length; i++) {
            let newIndex = i - 1;
            let currentOrder = this.data.orders[this.bestRouteSet.priorities[i]];

            while (newIndex >= 0 && (values[newIndex] + newIndex * this.permutationConstant) > (values[i] + i * this.permutationConstant)
                && RouteScheduler.isValidMutation(currentOrder, this.data.orders[this.bestRouteSet.priorities[newIndex]])) {
                newIndex--;
            }
            newIndex++;
            // Produce a permutation
            if (newIndex < i) {
                // Potential error with newIndex: newIndex
                permutations.push({ index: i, newIndex: newIndex, value: values[i] });
            }
        }

        permutations.sort((p1, p2) => {
            return p1.value - p2.value;
        });

        this.permutations = permutations;
        this.permutationCounter = 0;
    }

    /**
     * Appraises each route in the current best route-set.
     * movePallet is appraised by 
     * @returns An array of estimates for how good each route is
     */
    private getRouteAppraisals() {
        return this.bestRouteSet.priorities.map((priority, index) => {
            let order = this.data.orders[priority];
            let duration = this.bestRouteSet.duration[index];
            switch (order.type) {
                case Order.types.movePallet:
                    let startVertex = this.data.warehouse.graph.vertices[order.startVertexId];
                    let endVertex = this.data.warehouse.graph.vertices[order.endVertexId];
                    return startVertex.getDistanceDirect(endVertex) / duration;
                case Order.types.moveForklift:
                    return this.moveForkliftConstant;
                case Order.types.charge:
                    return this.chargeConstant;
                default:
                    throw `unhandled order-type ${order.type}`;
            }
        });
    }

    /**
     * Checks whether it is valid to plan the parameter currentOrder before the parameter newOrder
     * @param currentOrder An {@link Order} to be checked
     * @param newOrder An {@link Order} to be checked
     * @returns True if currentOrder can be planned before newOrder
     */
    private static isValidPermutation(currentOrder: Order, newOrder: Order): boolean {
        let oneOrderIsMovePallet: boolean = currentOrder.type === Order.types.movePallet || newOrder.type === Order.types.movePallet;
        let differentForklifts: boolean = currentOrder.forkliftId !== newOrder.forkliftId;
        let timeCurrentOrderIsLower: boolean = currentOrder.time < newOrder.time;

        return oneOrderIsMovePallet || differentForklifts || timeCurrentOrderIsLower;
    }

    /**
     * Generates a new array of order ids in the sequence they are to be executed.
     * @returns A string array of order ids
     */
    private generateChronologicalPriorities(): string[] {
        let orders: string[] = [...this.unfinishedOrderIds];

        orders.sort((order1, order2) => {
            return this.data.orders[order1].time - this.data.orders[order2].time;
        });

        return orders;
    }

    /**
     * Generates a new array of order ids in the sequence they are to be planned based mostly on 
     * bestRouteSet or chronological order, but makes changes based on permutations or randomness
     * @returns The new priorities in a string array of order ids
     */
    private generatePriorities(): string[] {
        let priorities: string[] = [];

        //Checks if the new priorities are to be based on bestRouteSet or on chronological order
        if (this.bestRouteSet !== null) {

            // Clone of bestRouteSet.priorities
            priorities = [...this.bestRouteSet.priorities];

            // Handle permutationCounter greater than number of permutations
            if (this.permutationCounter >= this.permutations.length && priorities.length > 0) {
                this.priotizeOnePriorityRandomly(priorities);

            } else if (this.permutations.length > 0) {

                // Handle the permutations
                let priority = priorities.splice(this.permutations[this.permutationCounter].index, 1)[0];
                priorities.splice(this.permutations[this.permutationCounter].newIndex, 0, priority);
            }
        } else {
            priorities = this.generateChronologicalPriorities();

            if (this.permutationCounter > 0) {
                this.priotizeOnePriorityRandomly(priorities);
            }
        }

        this.permutationCounter++;
        return priorities;
    }

    /**
     * Looks through as many random permutations as there are strings in the parameter array, 
     * until a valid permutation is found
     * @param priorities A string array with order ids in the order they are to be planned
     */
    private priotizeOnePriorityRandomly(priorities: string[]): void {
        let ranIndex: number = randomIntegerInRange(0, priorities.length - 1);
        let ranNewIndex: number = ranIndex - 1;

        // Increases ranNewIndex until the permutation is no longer valid
        while (ranNewIndex >= 0 && RouteScheduler.isValidPermutation(this.data.orders[priorities[ranIndex]], this.data.orders[priorities[ranNewIndex]])) {
            ranNewIndex--;
        }
        ranNewIndex++;

        // Performs the permutation
        if (ranNewIndex < ranIndex) {
            let priority = priorities.splice(ranIndex, 1)[0];
            priorities.splice(ranNewIndex, 0, priority);
        }
    }

    /**
     * Finds the sum of the durations of all routes in a {@link RouteSet}
     * @param routeSet A {@link RouteSet} whose durations sum is to be found
     * @returns The sum of the durations
     */
    private static evalRouteSet(routeSet: RouteSet): number {
        let sum = 0;
        for (let i = 0; i < routeSet.duration.length; i++) {
            sum += routeSet.duration[i];
        }
        return sum;
    }

    /**
     * Finds out whether the parameter {@link ScheduleItem} makes it imposible for the parameter foklift to cross an edge 
     * of the graph based on the path specified by the parameter {@link ScheduleItem}
     * @param startVertexId A string id of the {@link Vertex} which the forklift is coming from
     * @param scheduleItem A {@link ScheduleItem} for collisions to be checked against
     * @param earliestArrivalTime A number specifieing the time when the forklift arrives if it travels at max speed
     * @param currentTime A number specifieing the time when the forklift leaves startVertex
     * @param isLast A boolean for whether the parameter {@link ScheduleItem} is the {@link ScheduleItem} on its {@link Vertex}
     * @param forkliftId A string for the forklift who is crossing from the startVertex 
     * to the {@link Vertex} with the parameter scheduleItem on it
     * @returns True if crossing the edge at this time is not possible, false otherwise
     */
    private isCollisionInevitable(startVertexId: string, scheduleItem: ScheduleItem, earliestArrivalTime: number, currentTime: number, isLast: boolean, forkliftId: string): boolean {
        // Checks if the parameter scheduleItem is part of a route from the other Vertex to the startVertex in the
        // first case, or from the startVertex to the other Vertex in the second case
        if (scheduleItem.nextScheduleItem !== null && scheduleItem.nextScheduleItem.currentVertexId === startVertexId) {

            // Checks for a frontal collision
            if (scheduleItem.arrivalTimeCurrentVertex > earliestArrivalTime || scheduleItem.nextScheduleItem.arrivalTimeCurrentVertex > currentTime) {
                return true;
            }
        } else if (scheduleItem.previousScheduleItem !== null && scheduleItem.previousScheduleItem.currentVertexId === startVertexId) {

            // Checks for a rear-end collision
            if (scheduleItem.previousScheduleItem.arrivalTimeCurrentVertex > currentTime) {
                return true;
            }
        }

        // Checks whether the ScheduleItem marks an idle forklift other than itself
        if (scheduleItem.nextScheduleItem === null && isLast && scheduleItem.forkliftId !== forkliftId) {
            return true;
        }

        return false;
    }

    /**
     * Finds the earliest possible time which the parameter forklift can arrive at the parameter {@link Vertex} without colliding
     * with previously planned routes
     * @param currentVertex A {@link Vertex} at which the forklift is arriving from
     * @param destinationVertex A {@link Vertex} at which the forklift is arriving
     * @param currentTime A time where the forklift leaves the current {@link Vertex}
     * @param isEndVertex A boolean specifiyng if the parameter destination {@link Vertex} is the last {@link Vertex} of the route
     * @param forkliftId A string id for the forklift whose arrival time is to be calculated
     * @returns The found time of arrival
     */
    getArrivalTime(currentVertex: Vertex, destinationVertex: Vertex, currentTime: number, isEndVertex: boolean, forkliftId: string): number {
        let time: number;
        let interval: number;
        let earliestArrivalTime: number;

        if (destinationVertex.scheduleItems.length <= 0) {
            return this.computeEarliestArrivalTime(currentVertex, destinationVertex, currentTime);
        }

        // Find earliest possible reference to destinationVertex
        let indexOfDestinationVertex = this.findReferenceToVertex(currentVertex, destinationVertex, currentTime);
        interval = 0;
        time = 0;
        earliestArrivalTime = this.computeEarliestArrivalTime(currentVertex, destinationVertex, currentTime);
        while ((interval < this.timeIntervalMinimumSize || time + this.timeIntervalMinimumSize / 2 <= earliestArrivalTime)
            && indexOfDestinationVertex < destinationVertex.scheduleItems.length) {
            if (this.isCollisionInevitable(currentVertex.id, destinationVertex.scheduleItems[indexOfDestinationVertex], earliestArrivalTime, currentTime,
                indexOfDestinationVertex === destinationVertex.scheduleItems.length - 1, forkliftId)) {
                return Infinity;
            }
            time = destinationVertex.scheduleItems[indexOfDestinationVertex].arrivalTimeCurrentVertex;
            interval = indexOfDestinationVertex + 1 >= destinationVertex.scheduleItems.length ? Infinity
                : destinationVertex.scheduleItems[indexOfDestinationVertex + 1].arrivalTimeCurrentVertex - time;
            indexOfDestinationVertex++;
        }

        if (time + this.timeIntervalMinimumSize / 2 < earliestArrivalTime) {
            return earliestArrivalTime;
        }

        // If it blocks another route on its last vertex
        if (isEndVertex && indexOfDestinationVertex < destinationVertex.scheduleItems.length) {
            return Infinity;
        }

        return destinationVertex.scheduleItems[indexOfDestinationVertex - 1].arrivalTimeCurrentVertex + (this.timeIntervalMinimumSize / 2);
    }

    /**
     * Goes through the each {@link ScheduleItem} on the parameter currentVertex starting at currentTime backwards in time,
     * until the earliest reference to the parameter destinationVertex occurs. A reference is here the previousScheduleItem
     * and the nextScheduleItem references that form a doubly linked list on a graph
     * @param currentVertex A {@link Vertex} whose {@link ScheduleItem} array is searched
     * @param destinationVertex A {@link Vertex} to find a reference to, and to find the returned index on
     * @param currentTime A time for when to begin the search on the parameter currentVertex
     * @returns The index of the {@link ScheduleItem} on the parameter destinationVertex first referenced on the parameter currentVertex
     */
    private findReferenceToVertex(currentVertex: Vertex, destinationVertex: Vertex, currentTime: number): number {
        let previousVertexId: string = "";
        let nextVertexId: string = "";
        let i: number;
        let time: number;

        //Searches linearly through the ScheduleItems for a reference
        for (i = currentVertex.getScheduleItemIndex(currentTime); i >= 0
            && previousVertexId !== destinationVertex.id
            && nextVertexId !== destinationVertex.id
            && currentVertex.scheduleItems.length > 0; i--) {
            if (i >= currentVertex.scheduleItems.length) {
                i = currentVertex.scheduleItems.length - 1;
            }
            if (currentVertex.scheduleItems[i].previousScheduleItem !== null) {
                previousVertexId = currentVertex.scheduleItems[i].previousScheduleItem.currentVertexId;
            }
            if (currentVertex.scheduleItems[i].nextScheduleItem !== null) {
                nextVertexId = currentVertex.scheduleItems[i].nextScheduleItem.currentVertexId;
            }
        }
        if (i === -1) i = 0;

        //Finds the time of the ScheduleItem on the destinationVertex
        if (previousVertexId === destinationVertex.id && currentVertex.scheduleItems[i].previousScheduleItem !== null) {
            time = currentVertex.scheduleItems[i].previousScheduleItem.arrivalTimeCurrentVertex;
        } else if (nextVertexId === destinationVertex.id && currentVertex.scheduleItems[i].nextScheduleItem !== null) {
            time = currentVertex.scheduleItems[i].nextScheduleItem.arrivalTimeCurrentVertex;
        } else {
            time = 0;
        }

        //Returns the index of the ScheduleItem
        return destinationVertex.getScheduleItemIndex(time);
    }

    /**
     * Computes the earliest possible time for when the forklift can arrive at destinationVertex
     * @returns The computed time
     */
    private computeEarliestArrivalTime(currentVertex: Vertex, destinationVertex: Vertex, time: number): number {
        return (1000 * currentVertex.getDistanceDirect(destinationVertex) / this.data.warehouse.maxForkliftSpeed) + time;
    }

    /**
     * Finds the fastest route between the parameter startVertex and the parameter endVertex for the parameter forklift.
     * The route is stored in temporary variables on the verticies of the parameter {@link RouteSet}
     * @param routeSet A {@link RouteSet} which the route is stored on
     * @param startVertexId A string id of the start {@link Vertex}
     * @param endVertexId A string id of the end {@link Vertex}
     * @param orderTime A time for when the route begins
     * @param forkliftId A string id specifying the forklift which the route is planned for 
     * @returns The amount of time the route takes
     */
    planOptimalRoute(routeSet: RouteSet, startVertexId: string, endVertexId: string, orderTime: number, forkliftId: string): number {
        let endVertex: Vertex = routeSet.graph.vertices[endVertexId];
        let startVertex: Vertex = routeSet.graph.vertices[startVertexId];
        let getEstimate = (currentVertex: Vertex): number => {
            return this.heuristic(currentVertex, endVertex) + routeSet.graph.vertices[currentVertex.id].visitTime;
        };

        let queue = new MinPriorityQueue(getEstimate);
        queue.insert(startVertex);
        routeSet.graph.reset();
        startVertex.isVisited = true;
        startVertex.visitTime = orderTime;

        while (queue.array.length > 0) {
            let currentVertex: Vertex = queue.extractMin();
            for (let u = 0; u < currentVertex.adjacentVertexIds.length; u++) {
                let adjacentVertex: Vertex = routeSet.graph.vertices[currentVertex.adjacentVertexIds[u]];
                if (adjacentVertex.id === endVertex.id) {
                    adjacentVertex.visitTime = this.getArrivalTime(currentVertex, adjacentVertex, currentVertex.visitTime, true, forkliftId);
                    if (adjacentVertex.visitTime < Infinity) {
                        adjacentVertex.isVisited = true;
                        adjacentVertex.previousVertex = currentVertex;
                        return endVertex.visitTime - orderTime;
                    }
                } else if (!adjacentVertex.isVisited) {
                    adjacentVertex.visitTime = this.getArrivalTime(currentVertex, adjacentVertex, currentVertex.visitTime, false, forkliftId);
                    if (adjacentVertex.visitTime < Infinity) {
                        queue.insert(adjacentVertex);
                        adjacentVertex.isVisited = true;
                        adjacentVertex.previousVertex = currentVertex;
                    }
                }
            }
        }
        return Infinity;
    }

    /**
     * Inserts a new {@link ScheduleItem} recursivly for each {@link Vertex} linked by previousVertex
     * @param vertex A {@link Vertex} which the {@link ScheduleItem} is to be inserted on
     * @param startVertexId A string id for the {@link Vertex} where the recursion stops
     * @param forkliftId A string id for the forklift following the route
     * @param nextItem A {@link ScheduleItem} which the new {@link ScheduleItem} is to be linked to
     */
    private upStacking(vertex: Vertex, startVertexId: string, forkliftId: string, nextItem: ScheduleItem | null): void {
        let i = vertex.insertScheduleItem(new ScheduleItem(forkliftId, vertex.visitTime, vertex.id));
        if (nextItem !== null) nextItem.setPrevious(vertex.scheduleItems[i]);
        if (vertex.id !== startVertexId) {
            this.upStacking(vertex.previousVertex, startVertexId, forkliftId, vertex.scheduleItems[i]);
        }
    }

    /**
     * Inserts a new {@link ScheduleItem} recursivly for each {@link Vertex} linked by previousVertex to the parameter array
     * @param vertex A {@link Vertex} denoting the step of the recursing through the chain
     * @param startVertexId A string id for the {@link Vertex} where the recursion stops
     * @param forkliftId A string id for the forklift following the route
     * @param nextItem A {@link ScheduleItem} which the new {@link ScheduleItem} is to be linked to
     * @param outputArray A {@link ScheduleItem} array to store the output
     */
    private upStackingToArray(vertex: Vertex, startVertexId: string, forkliftId: string, nextItem: ScheduleItem | null, outputArray: ScheduleItem[]): void {
        outputArray.push(new ScheduleItem(forkliftId, vertex.visitTime, vertex.id));
        if (nextItem !== null) nextItem.setPrevious(outputArray[outputArray.length - 1]);
        if (vertex.id !== startVertexId) {
            this.upStackingToArray(vertex.previousVertex, startVertexId, forkliftId, outputArray[outputArray.length - 1], outputArray);
        }
    }

    /**
     * Inserts each {@link ScheduleItem} in the parameter scheduleItemsArray on each predetermined vertex
     * @param routeSet A {@link RouteSet} for each {@link ScheduleItem} to be inserted on
     * @param scheduleItemsArray A {@link ScheduleItem} array to be inserted
     */
    private insertScheduleItemsArray(routeSet: RouteSet, scheduleItemsArray: ScheduleItem[]) {
        for (let scheduleItem of scheduleItemsArray) {
            let tempVertex = routeSet.graph.vertices[scheduleItem.currentVertexId];
            tempVertex.insertScheduleItem(scheduleItem);
        }
    }

    /**
     * Finds the time when the route associated with the parameter order starts
     * @param orderId A string id specifying the order to find the start time for
     * @returns The start time
     */
    getStartTime(orderId: string): number {
        let order: Order = this.data.orders[orderId];
        if (order.type === Order.types.movePallet) {
            let startItem: ScheduleItem = this.bestRouteSet.graph.vertices[order.startVertexId].getScheduleItem(order.time);
            while (startItem.previousScheduleItem !== null) {
                startItem = startItem.previousScheduleItem;
            }
            return startItem.arrivalTimeCurrentVertex;
        }

        return order.time;
    }

    /**
     * Updates the routeScheduler by adding new orders and calculating a new {@link RouteSet} and compares it to bestRouteSet
     */
    update(): void {
        // Find appropriate place in priorities and insert
        if (this.bestRouteSet !== null) {
            for (let newOrderId of this.data.newOrders) {
                this.insertOrderInPrioritiesAppropriately(newOrderId);
            }
        } else {
            this.data.newOrders.forEach((newOrder) => {
                this.unfinishedOrderIds.push(newOrder);
            });
        }

        this.data.newOrders = [];

        // Generate a new RouteSet
        if (this.bestRouteSet === null || this.bestRouteSet.priorities.length > 0) {
            let priorities = this.generatePriorities();
            let routeSet = new RouteSet(priorities, deepCopy(this.data.warehouse.graph));
            if (Object.keys(this.data.orders).length > 0 && this.calculateRoutes(this.data, routeSet)) {
                this.setBestRouteSet(routeSet);
            }
        }

    }

    /**
     * Inserts a new order the prioritized list of orders on the bestRouteSet in a chronologial manner
     * @param orderId A string id for the order to be inserted
     */
    private insertOrderInPrioritiesAppropriately(orderId: string): void {
        let indexForNewOrder = this.bestRouteSet.priorities.length;

        while (indexForNewOrder > 0
            && this.data.orders[orderId].time < this.data.orders[this.bestRouteSet.priorities[indexForNewOrder - 1]].time) {
            indexForNewOrder--;
        }

        this.bestRouteSet.priorities.splice(indexForNewOrder, 0, orderId);
        this.bestRouteSet.duration.splice(indexForNewOrder, 0, Infinity);
    }
}
