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
        this.heuristic = (v1: Vertex, v2: Vertex) => { return v1.getDistanceDirect(v2); };
    }

    getRoute(orderId: string): Route {
        // TO DO
        return null;
    }

    calculateRoutes(data: DataContainer): RouteSet[] {
        // TO DO
        return null;
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

    /**
     * Implementation of A*. Further description look at https://thisneedstobeadded.org/astar
     * @param routeSet Routeset where route is added. Assumes RouteSet.graph is full
     * @param order Order to be calculated route for
     */
    planOptimalRoute(routeSet: RouteSet, order: Order): void {
        let endVertex: Vertex = routeSet.graph.vertices[order.endVertexId];
        let startVertex: Vertex = routeSet.graph.vertices[order.startVertexId];
        let f = (currentVertex: Vertex): number => {
            return this.heuristic(currentVertex, endVertex) + routeSet.graph.vertices[currentVertex.id].g(order.startVertexId);
        };

        let queue = new MinPriorityQueue(f);
        queue.insert(startVertex);
        let pathLength = Infinity;
        routeSet.graph.reset();
        startVertex.isVisited = true;

        while (queue.array.length > 0) {
            let v: Vertex = queue.extractMin();
            for (let u = 0; u < v.adjacentVertexIds.length; u++) {
                let currentVertex: Vertex = routeSet.graph.vertices[v.adjacentVertexIds[u]];
                if (currentVertex.id === endVertex.id) {
                    pathLength = f(currentVertex);
                    currentVertex.isVisited = true;
                    currentVertex.previousVertex = v;
                } else if (!currentVertex.isVisited) {
                    let tempLength: number = f(currentVertex);
                    if (tempLength < pathLength) {
                        queue.insert(currentVertex);
                        currentVertex.isVisited = true;
                        currentVertex.previousVertex = v;
                    }
                }
            }
        }

        if (order.timeType === Order.timeTypes.start) {
            this.upStacking(endVertex, order, "", this.data.warehouse.forkliftSpeed);
            // Recursively stacking up
        } else if (order.timeType === Order.timeTypes.end) {
            this.downStacking(endVertex, order, order.time, "", this.data.warehouse.forkliftSpeed);
            // Recursively stacking down
        }

        this.printRoute(startVertex, endVertex);
        console.log("\n");
    }

    printRoute(startVertex: Vertex, endVertex: Vertex) {
        if (endVertex !== startVertex && endVertex !== null) {
            this.printRoute(startVertex, endVertex.previousVertex);
        }
        console.log(endVertex.scheduleItems);
    }

    /**
     * Adds scheduleItems to all vertices the sorting algorithm pathed through.
     * As start time is known it goes from the end element to the start element,
     * whereafter, as it resolves the stack, it appends the scheduleItem,
     * using the time from the vertex before it (in the stack), ending at the end vertex
     * @param vertex Initially the end vertex, later in the recursion it will be the vertices,
     *               which were added to the path (using Vertex.previousVertex) 
     * @param order The order the route was planned for. Used for start/end time,
     *              as well as start and end vertex
     * @param nextVertexId Used to point to the next vertex in the path,
     *                     as only previous is part of the object,
     *                     and the recursion requires pointer to next object as well.
     * @returns The time at which the vertex's scheduleItem was calculated.
     *          Only used by the recursion.
     */
    upStacking(vertex: Vertex, order: Order, nextVertexId: string, forkliftSpeed: number): number {
        let fulfillTime: number = vertex.getDistanceDirect(vertex.previousVertex) / forkliftSpeed;
        let time: number = (vertex.id === order.startVertexId)
            ? order.time
            : fulfillTime + this.upStacking(vertex.previousVertex, order, vertex.id, forkliftSpeed);
        vertex.scheduleItems.push(new ScheduleItem(order.forkliftId, time, nextVertexId));
        return time;
    }

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

        vertex.scheduleItems.push(new ScheduleItem(order.forkliftId, time, nextVertexId));
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