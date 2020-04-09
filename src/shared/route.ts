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
}

export class RouteSet {
    routes: Route[];
    priorities: string[];
    graph: Graph;

    constructor(routes: Route[], priorities: string[], graph: Graph) {
        this.routes = routes;
        this.priorities = priorities;
        this.graph = graph;
    }
}