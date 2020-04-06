import * as WebSocket from "ws";
import { Route, Instruction } from "./../planningScheduler/classes/route";
import { Forklift as ForkliftInfo } from "./../planningScheduler/classes/forklift";

enum ForkliftMessageType {
    getInfo = "getInfo",
    getRoutes = "getRoutes",
    addRoute = "addRoute"
}
enum ForkliftStates {
    idle = "idle",
    hasOrder = "hasOrder",
    charging = "charging"
}

export class ForkliftMessage {
    static Types = ForkliftMessageType;
    type: ForkliftMessageType;

    body: ForkliftInfo | Route | null;
}


export class Forklift {
    id: string;
    socket: WebSocket;
    routes: Route[];
    state: ForkliftStates;
    batteryStatus: number;
    currentRoute: Route;

    constructor(id: string, hostname: string, port: number) {
        this.id = id;

        this.connect(hostname, port);
    }

    connect(hostname: string, port: number) {
        this.socket = new WebSocket(`ws://${hostname}:${port}/forklifts/${this.id}/initiate`);
        this.socket.on("open", this.sendStatus);
        this.socket.on("message", (data) => {
            /// TODO: Handle incoming messages
        });
    }

    sendStatus() {
        this.socket.send(JSON.stringify({
            "id": this.id
        }));
    }

    addRoute(route: Route) {
        this.routes.push(route);
        if (this.currentRoute === null) {
            this.processRoutes();
        }
    }

    getNextInstruction() {
        // while no current route, or current route is empty instructions
        while (this.currentRoute === null || this.currentRoute && this.currentRoute.instructions.length === 0) {
            if (this.routes.length === 0) return null;
            this.currentRoute = this.routes.shift();
        }
        return this.currentRoute.instructions.shift();
    }

    processRoutes() {
        let nextInstruction = this.getNextInstruction();
        if (nextInstruction !== null) {
            setTimeout(this.processRoutes, this.estimateInstructionDuration(nextInstruction));
        }
    }

    estimateInstructionDuration(instruction: Instruction) {
        return 2000;
    }
}
