import { Vertex, Graph } from "./graph";

enum RouteStatus {
    queued = 1,
    inProgress,
    completed,
    failed,
}

enum InstructionType {
    move = 1,
    unloadPallet,
    loadPallet,
    charge,
    wait,
    sendFeedback,
}

export class Instruction {
    static types = InstructionType;
    type: InstructionType;
    vertexId: string;
    palletId: string;
    startTime: number;

    constructor(type: InstructionType, vertexId: string, palletId: string, startTime: number) {
        this.type = type;
        this.vertexId = vertexId;
        this.palletId = palletId;
        this.startTime = startTime;
    }

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

export class Route {
    routeId: string;
    orderId: string;
    status: RouteStatus;
    instructions: Instruction[];

    constructor(routeId: string, orderId: string, status: RouteStatus, instructions: Instruction[]) {
        this.routeId = routeId;
        this.orderId = orderId;
        this.status = status;
        this.instructions = instructions;
    }

    static parse(route: any): Route | null {
        if (typeof (route.routeId) !== "string") return null;
        if (typeof (route.orderId) !== "string") return null;
        // Implement checking of valid ids?
        if (typeof (route.status) !== "number") return null;
        if (typeof (Instruction.parseMultiple(route.instructions)) !== "object") return null;

        return new Route(route.routeId, route.orderId, route.RouteStatus, route.instructions);
    }

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

export class RouteSet {
    priorities: string[];
    graph: Graph;

    constructor(priorities: string[], graph: Graph) {
        this.priorities = priorities;
        this.graph = graph;
    }

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
}