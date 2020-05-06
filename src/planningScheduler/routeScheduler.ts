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
    bestRouteSet: RouteSet;

    /** Heuristic function for A* implementation */
    heuristic: (v1: Vertex, v2: Vertex) => number;

    /** The minimum amount of time between two forklifts crossing the same vertex for a third to cross in the meantime */
    timeIntervalMinimumSize: number;

    /** The index of the mutation in the array of mutations currently being tried */
    mutationCounter: number;

    /** An array of mutations or changes to the priority in which orders are planned*/
    mutations: { index: number, newIndex: number, value: number; }[];

    /** An array of order ids of the orders currently being planned */
    unfinishedOrderIds: string[];

    /**
     * Constructor for the object.
     * Contains description of heuristic function, 
     * which can be altered to change the workings
     * of the pathfinding algorithms
     * @param data Data RouteScheduler requires to function
     */
    constructor(data: DataContainer) {
        this.data = data;
        this.bestRouteSet = null;
        this.heuristic = (v1: Vertex, v2: Vertex) => { return v1.getDistanceDirect(v2) / this.data.warehouse.maxForkliftSpeed * 1000; };
        this.timeIntervalMinimumSize = 30000;
        this.mutationCounter = 0;
        this.mutations = [];
        this.unfinishedOrderIds = [];
    }

    /**
     * Looks at the best routeSet and finds a route that matches the orderId.
     * Converts scheduleItems to a route
     * @note Each order Id is unique
     * @param orderId A string that uniquely identifies the given order
     */
    getRoute(orderId: string): Route {
        let order = this.data.orders[orderId];

        // Create a route object for the route of an order on bestRouteSet
        let routeId = "R" + orderId;
        let instructions = this.createInstructions(order);
        let routeStatus = Route.Statuses.queued;

        // Add the locked route on the graph on this.data.warehouse.graph
        // endVertex and duration are from bestRouteSet
        let endVertex = this.findVertex(order.endVertexId);
        let duration = this.findDuration(order.id);
        // At this point currentScheduleItem is the lastScheduleItem for the given order
        let currentScheduleItem = endVertex.getScheduleItem(order.time + duration);

        let forkliftId = currentScheduleItem.forkliftId;

        // Lock idlePositions from bestRouteSet to this.data.warehouse.graph
        this.data.warehouse.graph.idlePositions[forkliftId] = currentScheduleItem;

        // Inserts all scheduleItems from route of order from bestRouteSet.graph to data.warehouse.graph
        while (currentScheduleItem !== null) {
            this.data.warehouse.graph.vertices[currentScheduleItem.currentVertexId].insertScheduleItem(currentScheduleItem);
            currentScheduleItem = currentScheduleItem.previousScheduleItem;
        }

        // Splice order from priorities and duration
        this.removeOrderFromBestRouteSet(order);

        // Redo mutations
        this.mutate();

        return new Route(routeId, order.palletId, forkliftId, orderId, routeStatus, instructions);
    }

    removeOrderFromBestRouteSet(order: Order) {
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
            this.createMovePalletInstructions(instructions, order, lastScheduleItem);
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
    private createMovePalletInstructions(instructions: Instruction[], order: Order, scheduleItem: ScheduleItem): void {
        let instructionType;
        if (scheduleItem.previousScheduleItem !== null) {
            this.createMovePalletInstructions(instructions, order, scheduleItem.previousScheduleItem);
            if (scheduleItem.currentVertexId === order.endVertexId) {
                instructionType = Instruction.types.unloadPallet;
            } else {
                instructionType = Instruction.types.move;
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
    calculateRoutes(data: DataContainer, routeSet: RouteSet): boolean {
        for (let orderId of routeSet.priorities) {
            let order: Order = data.orders[orderId];
            let assignableForklifts: ScheduleItem[] = [];
            let currentRouteTime: number = Infinity;
            let forkliftId: string = order.forkliftId || "";

            // Handle all order cases     
            if (order.type === Order.types.movePallet) {
                assignableForklifts = this.assignForklift(routeSet, order);
                for (let i = 0; i < assignableForklifts.length && currentRouteTime === Infinity; i++) {
                    currentRouteTime = this.planOptimalRoute(routeSet, assignableForklifts[i].currentVertexId, order.startVertexId,
                        assignableForklifts[i].arrivalTimeCurrentVertex, assignableForklifts[i].forkliftId);
                    if (assignableForklifts[i].arrivalTimeCurrentVertex + currentRouteTime > order.time) {
                        currentRouteTime = Infinity;
                    }
                    if (currentRouteTime != Infinity) {
                        currentRouteTime = this.planOptimalRoute(routeSet, order.startVertexId, order.endVertexId,
                            order.time, assignableForklifts[i].forkliftId);

                        forkliftId = assignableForklifts[i].forkliftId;
                    }
                }
            }

            // Comment
            if (order.type === Order.types.moveForklift || order.type === Order.types.charge) {
                if (routeSet.graph.idlePositions[order.forkliftId].arrivalTimeCurrentVertex <= order.time) {
                    currentRouteTime = this.planOptimalRoute(routeSet, routeSet.graph.idlePositions[order.forkliftId].currentVertexId,
                        order.endVertexId, order.time, order.forkliftId);
                } else currentRouteTime = Infinity;
            }

            if (currentRouteTime != Infinity) {
                if (order.timeType === Order.timeTypes.start) {
                    if (order.type === Order.types.movePallet) {
                        this.upStacking(routeSet.graph.vertices[order.endVertexId], order.startVertexId, forkliftId, null);
                        // Recursively stacking up
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
                    startVertexETA: order.time - (item.arrivalTimeCurrentVertex + 2 * this.heuristic(routeSet.graph.vertices[item.currentVertexId], routeSet.graph.vertices[order.startVertexId]))
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


    getBestRouteSet(routeSets: RouteSet[]): RouteSet {
        // TO DO
        return null;
    }

    setBestRouteSet(newRouteSet): void {
        if (this.bestRouteSet === null || RouteScheduler.evalRouteSet(newRouteSet) < RouteScheduler.evalRouteSet(this.bestRouteSet)) {
            this.bestRouteSet = newRouteSet;
            this.unfinishedOrderIds = this.bestRouteSet.priorities;
            this.mutate();
        }
    }

    mutate(): void {
        let moveForkliftConstant = 2.0;
        let chargeConstant = 2.0;
        let mutationConstant = 2.0;
        let values = [];
        let mutations: { index: number, newIndex: number, value: number; }[] = [];

        // Determine values for all routes in bestRouteSet
        for (let i = 0; i < this.bestRouteSet.duration.length; i++) {
            let order = this.data.orders[this.bestRouteSet.priorities[i]];
            if (order.type === Order.types.movePallet) {
                let startVertex = this.data.warehouse.graph.vertices[order.startVertexId];
                let endVertex = this.data.warehouse.graph.vertices[order.endVertexId];
                values.push(startVertex.getDistanceDirect(endVertex) / this.bestRouteSet.duration[i]);
            } else if (order.type === Order.types.moveForklift) {
                values.push(moveForkliftConstant);
            } else if (order.type === Order.types.charge) {
                values.push(chargeConstant);
            }
        }

        // Create an array of mutated entries for problematic values (values < ?)
        for (let i = 0; i < values.length; i++) {
            let newIndex = i - 1;
            let currentOrder = this.data.orders[this.bestRouteSet.priorities[i]];

            while (newIndex >= 0 && (values[newIndex] + newIndex * mutationConstant) > (values[i] + i * mutationConstant)
                && RouteScheduler.isValidMutation(currentOrder, this.data.orders[this.bestRouteSet.priorities[newIndex]])) {
                newIndex--;
            }
            newIndex++;
            // Produce a mutation
            if (newIndex < i) {
                // Potential error with newIndex: newIndex
                mutations.push({ index: i, newIndex: newIndex, value: values[i] });
            }
        }

        mutations.sort((mut1, mut2) => {
            return mut1.value - mut2.value;
        });

        this.mutations = mutations;
        this.mutationCounter = 0;
    }

    static isValidMutation(currentOrder: Order, newOrder: Order): boolean {
        let oneOrderIsMovePallet: boolean = currentOrder.type === Order.types.movePallet || newOrder.type === Order.types.movePallet;
        let differentForklifts: boolean = currentOrder.forkliftId !== newOrder.forkliftId;
        let timeCurrentOrderIsLower: boolean = currentOrder.time < newOrder.time;

        return oneOrderIsMovePallet || differentForklifts || timeCurrentOrderIsLower;
    }

    generateChronologicalPriorities(): string[] {
        let orders: string[] = [...this.unfinishedOrderIds];

        orders.sort((order1, order2) => {
            return this.data.orders[order1].time - this.data.orders[order2].time;
        });

        return orders;
    }

    generatePriorities(): string[] {
        let priorities = [];

        if (this.bestRouteSet !== null) {
            // Clone of bestRouteSet.priorities
            priorities = [...this.bestRouteSet.priorities];

            // Handle mutationCounter greater than number of mutations
            if (this.mutationCounter >= this.mutations.length && priorities.length > 0) {
                this.priotizeOnePriorityRandomly(priorities);
            } else if (this.mutations.length > 0) {
                // Handle the mutations
                let priority = priorities.splice(this.mutations[this.mutationCounter].index, 1)[0];
                priorities.splice(this.mutations[this.mutationCounter].newIndex, 0, priority);
            }
        } else {
            priorities = this.generateChronologicalPriorities();

            if (this.mutationCounter > 0) {
                this.priotizeOnePriorityRandomly(priorities);
            }
        }

        this.mutationCounter++;
        return priorities;
    }

    priotizeOnePriorityRandomly(priorities): void {
        let ranIndex;
        let ranNewIndex;
        let counter = priorities.length;

        do {
            ranIndex = randomIntegerInRange(0, priorities.length - 1);
            ranNewIndex = randomIntegerInRange(0, ranIndex - 1);

        } while (counter-- > 0 && RouteScheduler.isValidMutation(this.data.orders[priorities[ranIndex]], this.data.orders[priorities[ranNewIndex]]));
    }

    // Lower value is better
    static evalRouteSet(routeSet: RouteSet): number {
        let sum = 0;
        let length: number = routeSet.duration.length;
        for (let i = 0; i < length; i++) {
            sum += routeSet.duration[i];
        }
        return sum;
    }

    isCollisionInevitable(startVertexId: string, scheduleItem: ScheduleItem, maxWarp: number, currentTime: number, isLast: boolean): boolean {
        if (scheduleItem.nextScheduleItem !== null && scheduleItem.nextScheduleItem.currentVertexId === startVertexId) {
            if (scheduleItem.arrivalTimeCurrentVertex > maxWarp || scheduleItem.nextScheduleItem.arrivalTimeCurrentVertex > currentTime) {
                return true;
            }
        } else if (scheduleItem.previousScheduleItem !== null && scheduleItem.previousScheduleItem.currentVertexId === startVertexId) {
            if (scheduleItem.previousScheduleItem.arrivalTimeCurrentVertex > currentTime) {
                return true;
            }
        }

        if (scheduleItem.nextScheduleItem === null && isLast) {
            return true;
        }
        return false;
    }

    getArrivalTime(currentVertex: Vertex, destinationVertex: Vertex, currentTime: number, isEndVertex: boolean): number {
        let time: number;
        let interval: number;
        let maxWarp: number;

        if (destinationVertex.scheduleItems.length <= 0) {
            return this.computeMaxWarp(currentVertex, destinationVertex, currentTime);
        }

        /** Find earliest possible reference to destinationVertex */
        let indexOfDestinationVertex = this.findReferenceToVertex(currentVertex, destinationVertex, currentTime);
        // 1588321483297 - 1588321468280
        interval = 0;
        time = 0;
        maxWarp = this.computeMaxWarp(currentVertex, destinationVertex, currentTime);
        while ((interval < this.timeIntervalMinimumSize || time <= maxWarp) && indexOfDestinationVertex < destinationVertex.scheduleItems.length) {
            if (this.isCollisionInevitable(currentVertex.id, destinationVertex.scheduleItems[indexOfDestinationVertex], maxWarp, currentTime,
                indexOfDestinationVertex === destinationVertex.scheduleItems.length - 1)) {
                return Infinity;
            }
            time = destinationVertex.scheduleItems[indexOfDestinationVertex].arrivalTimeCurrentVertex;
            interval = indexOfDestinationVertex + 1 >= destinationVertex.scheduleItems.length ? Infinity
                : destinationVertex.scheduleItems[indexOfDestinationVertex + 1].arrivalTimeCurrentVertex - time;
            indexOfDestinationVertex++;
        }

        if (time < maxWarp) {
            return maxWarp;
        }

        // If it blocks another route on its last vertex
        if (isEndVertex && indexOfDestinationVertex < destinationVertex.scheduleItems.length) {
            return Infinity;
        }

        return destinationVertex.scheduleItems[indexOfDestinationVertex - 1].arrivalTimeCurrentVertex + (this.timeIntervalMinimumSize / 2);
    }

    findReferenceToVertex(currentVertex: Vertex, destinationVertex: Vertex, currentTime: number) {
        let previousVertexId: string = "";
        let nextVertexId: string = "";
        let i: number;
        let time: number;

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

        if (previousVertexId === destinationVertex.id && currentVertex.scheduleItems[i].previousScheduleItem !== null) {
            time = currentVertex.scheduleItems[i].previousScheduleItem.arrivalTimeCurrentVertex;
        } else if (nextVertexId === destinationVertex.id && currentVertex.scheduleItems[i].nextScheduleItem !== null) {
            time = currentVertex.scheduleItems[i].nextScheduleItem.arrivalTimeCurrentVertex;
        } else {
            time = 0;
        }

        return destinationVertex.getScheduleItemIndex(time);
    }

    /**
     * Computes the earliest possible time for when the forklift can arrive at destinationVertex
     */
    computeMaxWarp(currentVertex: Vertex, destinationVertex: Vertex, time: number): number {
        return (1000 * currentVertex.getDistanceDirect(destinationVertex) / this.data.warehouse.maxForkliftSpeed) + time;
    }

    /**
     * Implementation of A*. Further description look at https://thisneedstobeadded.org/astar
     * @param routeSet Routeset where route is added. Assumes RouteSet.graph is full
     * @param order Order to be calculated route for
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
                    adjacentVertex.visitTime = this.getArrivalTime(currentVertex, adjacentVertex, currentVertex.visitTime, true);
                    if (adjacentVertex.visitTime < Infinity) {
                        adjacentVertex.isVisited = true;
                        adjacentVertex.previousVertex = currentVertex;
                        return endVertex.visitTime - orderTime;
                    }
                } else if (!adjacentVertex.isVisited) {
                    adjacentVertex.visitTime = this.getArrivalTime(currentVertex, adjacentVertex, currentVertex.visitTime, false);
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

    printRoute(startVertex: Vertex, endVertex: Vertex) {
        if (endVertex !== startVertex && endVertex !== null) {
            this.printRoute(startVertex, endVertex.previousVertex);
        }
        endVertex.scheduleItems.forEach((scheduleItem) => {
            console.log(`Forklift: ${scheduleItem.forkliftId}`);
            console.log(`Vertex:   ${scheduleItem.currentVertexId}`);
            console.log(`Time:     ${scheduleItem.arrivalTimeCurrentVertex}\n`);
        });
    }

    /**
     * Used in the situation where the orders has a start time
     * @param vertex 
     * @param order 
     * @param forkliftId 
     * @param nextItem 
     */
    upStacking(vertex: Vertex, startVertexId: string, forkliftId: string, nextItem: ScheduleItem | null): void {
        let i = vertex.insertScheduleItem(new ScheduleItem(forkliftId, vertex.visitTime, vertex.id));
        if (nextItem !== null) nextItem.linkPrevious(vertex.scheduleItems[i]);
        if (vertex.id !== startVertexId) {
            this.upStacking(vertex.previousVertex, startVertexId, forkliftId, vertex.scheduleItems[i]);
        }
    }

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

    insertOrderInPrioritiesAppropriately(orderId: string): void {
        let indexForNewOrder = this.bestRouteSet.priorities.length;

        while (indexForNewOrder > 0
            && this.data.orders[orderId].time < this.data.orders[this.bestRouteSet.priorities[indexForNewOrder - 1]].time) {
            indexForNewOrder--;
        }

        this.bestRouteSet.priorities.splice(indexForNewOrder, 0, orderId);
        this.bestRouteSet.duration.splice(indexForNewOrder, 0, Infinity);
    }
}