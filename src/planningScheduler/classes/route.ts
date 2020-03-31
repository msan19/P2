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
    instructions: Instruction;

    constructor(routeId: string, orderId: string, status: RouteStatus, instructions: Instruction) {
        this.routeId = routeId;
        this.orderId = orderId;
        this.status = status;
        this.instructions = instructions;
    }
}

export class RouteSet {
    routes: Route[];
    priorities: string[];
    graphVertices: Vertex[];
    
    constructor(routes: Route[], priorities: string[], graphVertices: Vertex[]){
        this.routes = routes;
        this.priorities = priorities;
        this.graphVertices = graphVertices;
    }
}