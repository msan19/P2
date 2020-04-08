import { Vertex } from "./graph";
import { type } from "os";

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
        if (typeof (instruction.instrutionType) !== "number") return null;
        if (typeof (instruction.vertexId) !== "string") return null;
        if (typeof (instruction.palletId) !== "string") return null;
        // Implement checking of valid ids?
        if (typeof (instruction.startTime) !== "number") return null;
        return new Instruction(instruction.instrutionType, instruction.vertexId, instruction.palletId, instruction.startTime);
    }

    static parseMultiple(instructions: any[]): Instruction[] | null {
        instructions.forEach(element => {
            if (typeof (Instruction.parse(element)) === "object") return null;
        });
        let newInstructionSet: Instruction[] = [];
        instructions.forEach(element => {
            newInstructionSet.push(element);
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
    routes: Route[];
    priorities: string[];
    graphVertices: Vertex[];

    constructor(routes: Route[], priorities: string[], graphVertices: Vertex[]) {
        this.routes = routes;
        this.priorities = priorities;
        this.graphVertices = graphVertices;
    }

    static parse(routeSet: any): RouteSet | null {
        if (typeof (Route.parseMultiple(routeSet.routes)) === "object") return null;
        if (typeof (routeSet.priorities) !== null) {
            routeSet.priorities.forEach(element => {
                if (typeof (element) !== "string") return null;
            });
        }
        if (typeof (Vertex.parseMultiple(routeSet.graphVertices)) !== "object") return null;

        return new RouteSet(routeSet.routes, routeSet.priorities, routeSet.graphVertices);
    }
}