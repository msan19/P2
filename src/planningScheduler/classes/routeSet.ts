/**
 * Contains the object RouteSet to manage a set of routes on a {@link Graph}
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { Route } from "../../shared/route";
import { Graph, Vertex, ScheduleItem } from "./graph";


/** A set of Routes containing priorities and a graph */
export class RouteSet {
    graph: Graph;

    /** 
     * priorities and duration are associative
     */
    priorities: string[];
    duration: number[];

    constructor(priorities: string[], graph: Graph) {
        this.priorities = priorities;
        this.graph = graph;
        this.duration = [];
    }

    /** 
     * Parses into a RouteSet
     * @param routeSet What should be parsed
     * @returns a RouteSet if possible else null
     */
    static parse(routeSet: any): RouteSet | null {
        if (Route.parseMultiple(routeSet.routes) === null) return null;
        if (routeSet.priorities === null) return null;

        for (let priority in routeSet.priorities) {
            if (typeof (priority !== "string")) return null;
        }
        if (Vertex.parseMultiple(routeSet.graphVertices) === null) return null;

        return new RouteSet(routeSet.priorities, routeSet.graphVertices);
    }

    /**
     * Finds the first {@link ScheduleItem} of a forklift
     * runs in O(nm + m)
     * @param forkliftId The id of the wanted forklift
     * @returns The first {@link ScheduleItem}
     */
    getFirstScheduleItemForForklift(forkliftId: string) {
        for (let verticeId in this.graph.vertices) {
            for (let scheduleItem of this.graph.vertices[verticeId].scheduleItems) {
                if (scheduleItem.forkliftId === forkliftId) {
                    while (scheduleItem.previousScheduleItem) scheduleItem = scheduleItem.previousScheduleItem;
                    return scheduleItem;
                }
            }
        }
    }

    /**
     * Recursively prints the forkliftId, VertexId and time or Δtime for all ScheduleItems in a route
     * @param scheduleItem The scheduleItem to print
     * @param previousScheduleItem The previosScheduleItem if there is one
     */
    printRoute(scheduleItem: ScheduleItem, previousScheduleItem?: ScheduleItem) {
        if (previousScheduleItem) {
            console.log(scheduleItem.forkliftId, `Vertex: ${scheduleItem.currentVertexId}`, `ΔTime: ${scheduleItem.arrivalTimeCurrentVertex - previousScheduleItem.arrivalTimeCurrentVertex}`);
        } else {
            console.log(scheduleItem.forkliftId, `Vertex: ${scheduleItem.currentVertexId}`, `Time: ${scheduleItem.arrivalTimeCurrentVertex}`);
        }
        if (scheduleItem.nextScheduleItem) {
            this.printRoute(scheduleItem.nextScheduleItem, scheduleItem);
        }
    }
}