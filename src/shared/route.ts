// route.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import { Vertex, Graph, ScheduleItem } from "./graph";

/** An enum of possible states used to describe a route */
enum RouteStatus {
    queued = 1,
    inProgress,
    completed,
    failed,
}

/** An enum of possible types of {@link Instruction} */
enum InstructionType {
    move = 1,
    unloadPallet,
    loadPallet,
    charge,
    wait,
    sendFeedback,
}

/** An instruction for a forklift */
export class Instruction {

    /** Static types of instructions */
    static types = InstructionType;

    /** The type of the instruction */
    type: InstructionType;

    /** The id of the end Vertex */
    vertexId: string;

    /** The id of the pallet that the instruction may involve*/
    palletId: string;

    /** The starting time of the instruction */
    startTime: number;

    constructor(type: InstructionType, vertexId: string, palletId: string, startTime: number) {
        this.type = type;
        this.vertexId = vertexId;
        this.palletId = palletId;
        this.startTime = startTime;
    }

    /** 
     * Parses into Instruction
     * @param instruction Object that should be parsed to Instruction
     * @returns An Instruction if possible else null
     */
    static parse(instruction: any): Instruction | null {

        if (typeof (Instruction.types[instruction.type]) === "undefined") return null;

        if (instruction.type === Instruction.types.loadPallet) {
            if (typeof (instruction.palletId) !== "string" || instruction.palletId.length === 0) return null;
        }

        if (typeof (instruction.vertexId) !== "string" || instruction.vertexId.length === 0) return null;

        // Implement checking of valid ids?
        if (typeof (instruction.startTime) !== "number") return null;
        return new Instruction(instruction.type, instruction.vertexId, instruction.palletId, instruction.startTime);
    }

    /** 
     * Parses into an array of Instructions 
     * @param instructions What should be parsed
     * @returns An array of Instructions if possible else null
     */
    static parseMultiple(instructions: any): Instruction[] | null {
        if (!Array.isArray(instructions)) return null;
        instructions = <any[]>instructions; // Typescript-specific casting to array

        let newInstructionSet: Instruction[] = [];

        instructions.forEach(element => {
            let newInstruction = Instruction.parse(element);
            if (newInstruction === null) return null;
            newInstructionSet.push(newInstruction);
        });

        return newInstructionSet;
    }
}

/** A route containing an array of Instructions */
export class Route {
    /** An id for the route */
    routeId: string;

    /** An id for the order */
    orderId: string;

    /** The status of the route */
    status: RouteStatus;

    /** An array of instructions */
    instructions: Instruction[];

    constructor(routeId: string, orderId: string, status: RouteStatus, instructions: Instruction[]) {
        this.routeId = routeId;
        this.orderId = orderId;
        this.status = status;
        this.instructions = instructions;
    }

    /** 
     * Parses into a Route
     * @param route What should be parsed
     * @returns A Route if possible else null
     */
    static parse(route: any): Route | null {
        if (typeof (route.routeId) !== "string") return null;
        if (typeof (route.orderId) !== "string") return null;
        // Implement checking of valid ids?
        if (typeof (route.status) !== "number") return null;
        if (typeof (Instruction.parseMultiple(route.instructions)) !== "object") return null;

        return new Route(route.routeId, route.orderId, route.RouteStatus, route.instructions);
    }

    /** 
     * Parses into an array of Routes
    * @param routes What should be parsed
    * @returns An array of Routes if possible else null
    */
    static parseMultiple(routes: any[]): Route[] | null {
        routes.forEach(element => {
            if (typeof (Route.parse(element)) === "object") return null;
        });
        let newRouteSet: Route[] = [];
        routes.forEach(element => {
            newRouteSet.push(element);
        });

        return newRouteSet;
    }

}


/** A set of Routes containing priorities and a graph */
export class RouteSet {
    priorities: string[];
    graph: Graph;
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