import { DataContainer } from "./classes/dataContainer";
import { Route, RouteSet } from "../shared/route";
import { Order } from "../shared/order";
import { Vertex, ScheduleItem } from "../shared/graph";
import { MinPriorityQueue } from "./classes/minPriorityQueue";
import { getHeapCodeStatistics } from "v8";


export class RouteScheduler {
    data: DataContainer;
    routeSets: RouteSet[];
    bestRouteSet: RouteSet;
    heuristic: (v1: Vertex, v2: Vertex) => number;

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

    // assumes RouteSet.graph is full
    // implements A*
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
            this.upStacking(endVertex, order, "");
            // Recursively stacking up
        } else if (order.timeType === Order.timeTypes.end) {
            this.downStacking(endVertex, order, order.time, "");
            // Recursively stacking down
        }
    }

    upStacking(vertex: Vertex, order: Order, nextVertexId: string): number {
        let fullfillTime: number = vertex.getDistanceDirect(vertex.previousVertex) / this.data.warehouse.forkliftSpeed;
        let time: number = (vertex.id === order.startVertexId)
            ? order.time
            : fullfillTime + this.upStacking(vertex.previousVertex, order, vertex.id);
        vertex.scheduleItems.push(new ScheduleItem(order.forkliftId, time, nextVertexId));
        return time;
    }

    downStacking(vertex: Vertex, order: Order, time: number, nextVertexId: string): void {
        let fullfillTime: number = vertex.getDistanceDirect(vertex.previousVertex) / this.data.warehouse.forkliftSpeed;
        let timeOnPrev: number = time - fullfillTime;

        vertex.scheduleItems.push(new ScheduleItem(order.forkliftId, time, nextVertexId));
        if (vertex.id !== order.startVertexId) {
            this.downStacking(vertex.previousVertex, order, timeOnPrev, vertex.id);
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