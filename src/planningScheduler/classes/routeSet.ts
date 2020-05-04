import { Route } from "../../shared/route";
import { Graph, Vertex, ScheduleItem } from "../../shared/graph";


/** A set of Routes containing priorities and a graph */
export class RouteSet {
    graph: Graph;

    /** 
     * priorities and duration are associative arrays
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
        if (typeof (Route.parseMultiple(routeSet.routes)) === "object") return null;
        if (typeof (routeSet.priorities) !== null) {
            routeSet.priorities.forEach(element => {
                if (typeof (element) !== "string") return null;
            });
        }
        if (typeof (Vertex.parseMultiple(routeSet.graphVertices)) !== "object") return null;

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