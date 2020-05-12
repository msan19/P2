/**
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

    // O(nm + m) 
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

    printRoute(scheduleItem: ScheduleItem, previousScheduleItem?: ScheduleItem) {
        if (!previousScheduleItem) {
            console.log(scheduleItem.forkliftId, `Vertex: ${scheduleItem.currentVertexId}`, `Time: ${scheduleItem.arrivalTimeCurrentVertex}`);
        } else {
            console.log(scheduleItem.forkliftId, `Vertex: ${scheduleItem.currentVertexId}`, `ΔTime: ${scheduleItem.arrivalTimeCurrentVertex - previousScheduleItem.arrivalTimeCurrentVertex}`);
        }
        if (scheduleItem.nextScheduleItem) {
            this.printRoute(scheduleItem.nextScheduleItem, scheduleItem);
        }
    }
}