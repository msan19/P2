// routeScheduler.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { DataContainer } from "./classes/dataContainer";
import { Route, RouteSet } from "../shared/route";
import { Order } from "../shared/order";
import { Vertex, ScheduleItem } from "../shared/graph";
import { MinPriorityQueue } from "./classes/minPriorityQueue";

/**
 * Object to handle routes.
 * Used for calculations of routes. 
 */
export class RouteScheduler {
    /** Object for data storage */
    data: DataContainer;

    /** List of objects to save calculations in */
    routeSets: RouteSet[];

    /** Object containing best calculated routes */
    bestRouteSet: RouteSet;

    /** Heuristic function for A* implementation */
    heuristic: (v1: Vertex, v2: Vertex) => number;

    timeIntervalMinimumSize: number;

    /**
     * Constructor for the object.
     * Contains description of heuristic function, 
     * which can be altered to change the workings
     * of the pathfinding algorithms
     * @param data Data RouteScheduler requires to function
     */
    constructor(data: DataContainer) {
        this.data = data;
        this.routeSets = [];
        this.bestRouteSet = null;
        this.heuristic = (v1: Vertex, v2: Vertex) => { return v1.getDistanceDirect(v2) / this.data.warehouse.maxForkliftSpeed * 1000; };
        this.timeIntervalMinimumSize = 30000;
    }

    getRoute(orderId: string): Route {
        // TO DO
        return null;
    }

    calculateRoutes(data: DataContainer, routeSet: RouteSet): void {
        for (let orderId of routeSet.priorities) {
            let order: Order = data.orders[orderId];
            let assignableForklifts: string[] = order.forkliftId == "" ? this.assignForklift(data, routeSet, order) : [order.forkliftId];
            let assignedForklift: string = assignableForklifts[0];  // (WIP)
            this.planOptimalRoute(routeSet, order, assignedForklift);
        }
    }

    assignForklift(data: DataContainer, routeSet: RouteSet, order: Order): string[] {
        let inactiveForklifts: string[] = [];
        let nullScheduleItems: ScheduleItem[] = [];

        // Get all inactive forklifts scheduleItems
        for (let vertexId in routeSet.graph.vertices) {
            for (let scheduleItem of routeSet.graph.vertices[vertexId].scheduleItems) {
                if (scheduleItem.nextScheduleItem === null) {
                    nullScheduleItems.push(scheduleItem);
                }
            }
        }

        // Sort the forklifts
        nullScheduleItems.sort((ele1: ScheduleItem, ele2: ScheduleItem) => {
            let ele1Time = order.time - (ele1.arrivalTimeCurrentVertex +
                2 * this.heuristic(routeSet.graph.vertices[ele1.currentVertexId], routeSet.graph.vertices[order.startVertexId]));
            let ele2Time = order.time - (ele2.arrivalTimeCurrentVertex +
                2 * this.heuristic(routeSet.graph.vertices[ele2.currentVertexId], routeSet.graph.vertices[order.startVertexId]));

            /*
            Tabel:          ele1Time >= 0    ele1Time < 0
            ele2Time >= 0     se (E1)             1              
            ele2Time < 0        -1             se (E2)

            (E1) ele2Time > ele1Time = -1   else 1
            (E2) ele2Time > ele1Time = 1    else -1
            */

            if ((ele1Time >= 0 && ele2Time < 0) ||
                (ele1Time >= 0 && ele2Time >= 0 && ele2Time > ele1Time) ||
                (ele1Time < 0 && ele2Time < 0 && ele1Time > ele2Time)) {
                return -1;
            } else {
                return 1;
            }
        }).forEach((scheduleItem) => {
            inactiveForklifts.push(scheduleItem.forkliftId);
        });


        return inactiveForklifts;
    }


    getBestRouteSet(routeSets: RouteSet[]): RouteSet {
        // TO DO
        return null;
    }

    getLastPos(forkliftId: string, routeSet: RouteSet): string {
        //TODO
        return null;
    }

    assignForkliftToOrder(order: Order): string {
        // TODO 
        return null;
    }

    isCollisionInevitable(startVertexId: string, scheduleItem: ScheduleItem, maxWarp: number, currentTime: number): boolean {
        if (scheduleItem.nextScheduleItem !== null && scheduleItem.nextScheduleItem.currentVertexId === startVertexId) {
            if (scheduleItem.arrivalTimeCurrentVertex > maxWarp || scheduleItem.nextScheduleItem.arrivalTimeCurrentVertex > currentTime) {
                return true;
            }
        } else if (scheduleItem.previousScheduleItem !== null && scheduleItem.previousScheduleItem.currentVertexId === startVertexId) {
            if (scheduleItem.previousScheduleItem.arrivalTimeCurrentVertex > currentTime) {
                return true;
            }
        }
        return false;
    }

    getArrivalTime(currentVertex: Vertex, destinationVertex: Vertex, currentTime: number): number {
        let previousVertexId: string = "";
        let nextVertexId: string = "";
        let i: number;
        let time: number;
        let interval: number;
        let maxWarp: number;

        if (destinationVertex.scheduleItems.length <= 0) {
            return this.computeMaxWarp(currentVertex, destinationVertex, currentTime);
        }

        /** Find earliest possible reference to destinationVertex */
        for (i = currentVertex.getScheduleItemIndex(currentTime); i >= 0
            && i < currentVertex.scheduleItems.length
            && previousVertexId !== destinationVertex.id
            && nextVertexId !== destinationVertex.id; i--) {
            if (currentVertex.scheduleItems[i].previousScheduleItem !== null) {
                previousVertexId = currentVertex.scheduleItems[i].previousScheduleItem.currentVertexId;
            }
            if (currentVertex.scheduleItems[i].nextScheduleItem !== null) {
                nextVertexId = currentVertex.scheduleItems[i].nextScheduleItem.currentVertexId;
            }
        }
        i = i === -1 ? 0 : i;
        ////////////////////////////
        if (previousVertexId === destinationVertex.id && currentVertex.scheduleItems[i].previousScheduleItem !== null) {
            time = currentVertex.scheduleItems[i].previousScheduleItem.arrivalTimeCurrentVertex;
        } else if (nextVertexId === destinationVertex.id && currentVertex.scheduleItems[i].nextScheduleItem !== null) {
            time = currentVertex.scheduleItems[i].nextScheduleItem.arrivalTimeCurrentVertex;
        } else {
            time = 0;
        }
        i = destinationVertex.getScheduleItemIndex(time);
        time = 0;
        ////////////////////////////

        interval = 0;
        maxWarp = this.computeMaxWarp(currentVertex, destinationVertex, currentTime);
        while ((interval < this.timeIntervalMinimumSize || time <= maxWarp) && i < destinationVertex.scheduleItems.length) {
            if (this.isCollisionInevitable(currentVertex.id, destinationVertex.scheduleItems[i], maxWarp, currentTime)) {
                return Infinity;
            }
            time = destinationVertex.scheduleItems[i].arrivalTimeCurrentVertex;
            interval = i + 1 >= destinationVertex.scheduleItems.length ? Infinity
                : destinationVertex.scheduleItems[i + 1].arrivalTimeCurrentVertex - time;
            i++;
        }

        return destinationVertex.scheduleItems[i - 1].arrivalTimeCurrentVertex + (this.timeIntervalMinimumSize / 2);
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
    planOptimalRoute(routeSet: RouteSet, order: Order, forkliftId: string): void {
        let endVertex: Vertex = routeSet.graph.vertices[order.endVertexId];
        let startVertex: Vertex = routeSet.graph.vertices[order.startVertexId];
        let getEstimate = (currentVertex: Vertex): number => {
            return this.heuristic(currentVertex, endVertex) + routeSet.graph.vertices[currentVertex.id].visitTime;
        };

        let queue = new MinPriorityQueue(getEstimate);
        queue.insert(startVertex);
        routeSet.graph.reset();
        startVertex.isVisited = true;
        startVertex.visitTime = order.time;
        let flag: boolean = false;

        while (queue.array.length > 0 && !flag) {
            let currentVertex: Vertex = queue.extractMin();
            for (let u = 0; u < currentVertex.adjacentVertexIds.length; u++) {
                let adjacentVertex: Vertex = routeSet.graph.vertices[currentVertex.adjacentVertexIds[u]];
                if (adjacentVertex.id === endVertex.id) {
                    adjacentVertex.visitTime = this.getArrivalTime(currentVertex, adjacentVertex, currentVertex.visitTime);
                    adjacentVertex.isVisited = true;
                    adjacentVertex.previousVertex = currentVertex;
                    flag = true;
                } else if (!adjacentVertex.isVisited) {
                    adjacentVertex.visitTime = this.getArrivalTime(currentVertex, adjacentVertex, currentVertex.visitTime);
                    if (adjacentVertex.visitTime < Infinity) {
                        queue.insert(adjacentVertex);
                        adjacentVertex.isVisited = true;
                        adjacentVertex.previousVertex = currentVertex;
                    }
                }
            }
        }

        /// TO DO
        if (order.timeType === Order.timeTypes.start) {
            this.upStacking(endVertex, order, forkliftId, null);
            // Recursively stacking up
        } else if (order.timeType === Order.timeTypes.end) {
            // this.downStacking(endVertex, order, order.time, "", this.data.warehouse.maxForkliftSpeed);
            // Recursively stacking down
        }

        this.printRoute(startVertex, endVertex);
        console.log("\n");
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
    upStacking(vertex: Vertex, order: Order, forkliftId: string, nextItem: ScheduleItem | null): void {
        let i = vertex.insertScheduleItem(new ScheduleItem(forkliftId, vertex.visitTime, vertex.id));
        if (nextItem !== null) nextItem.linkPrevious(vertex.scheduleItems[i]);
        if (vertex.id !== order.startVertexId) {
            this.upStacking(vertex.previousVertex, order, forkliftId, vertex.scheduleItems[i]);
        }
    }

    /// TO DO
    /** 
     * Adds scheduleItems to all vertices the sorting algorithm pathed through.
     * As end time is known the algorithm appends from the last element (end vertex)
     * to the first (start vertex), using the time of the next vertex (not Vertex.previousVertex).
     * Thus is appends scheduleItems while creating the stack, and not while resolving it.
     * @param vertex Initially the end vertex. After it is the previous vertex in the path
     * @param order The order for which the route was created
     * @param time The time of the next vertex (as in opposite Vertex.previousVertex)
     * @param nextVertexId The ID of the next vertex (as in opposite Vertex.previousVertex)
     * @returns Nothing as the recursion uses the creation of the stack and not the resolution
     */
    downStacking(vertex: Vertex, order: Order, time: number, nextVertexId: string, forkliftSpeed: number): void {
        let fulfillTime: number = vertex.getDistanceDirect(vertex.previousVertex) / forkliftSpeed;
        let timeOnPrev: number = time - fulfillTime;

        //vertex.scheduleItems.push(new ScheduleItem(order.forkliftId, time, nextVertexId));
        if (vertex.id !== order.startVertexId) {
            this.downStacking(vertex.previousVertex, order, timeOnPrev, vertex.id, forkliftSpeed);
        }
    }

    getStartTime(orderId: string): number {
        // TO DO 
        return null;
    }

    addRouteToGraph(route: Route): void {
        // TO DO 
    }

    update(data: DataContainer): void {
        // TO DO 
    }

}