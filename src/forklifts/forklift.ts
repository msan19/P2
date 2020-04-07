import * as WebSocket from "ws";
import { Route, Instruction } from "../shared/route";
import { ForkliftInfo } from "./../shared/forkliftInfo";
import { JsonTryParse } from "../shared/webUtilities";

enum ForkliftMessageType {
    getInfo = "getInfo",
    getRoutes = "getRoutes",
    addRoute = "addRoute"
}

export class ForkliftMessage {
    static Types = ForkliftMessageType;
    type: ForkliftMessageType;

    body: ForkliftInfo | Route | null;
}


export class Forklift extends ForkliftInfo {
    socket: WebSocket;
    currentRoute: Route;
    routes: Route[];

    constructor(id: string, hostname: string, port: number) {
        super();
        this.id = id;

        this.connect(hostname, port);
    }

    connect(hostname: string, port: number) {
        this.socket = new WebSocket(`ws://${hostname}:${port}/forklifts/${this.id}/initiate`);
        this.socket.on("open", () => { this.sendStatus(); });
        this.socket.on("message", (data) => {
            /// TODO: Handle incoming messages
            let obj = JsonTryParse(String(data));
            if (obj !== null) {
                switch (obj["type"]) {
                    case ForkliftMessage.Types.getInfo:
                        this.sendStatus();
                        break;
                    case ForkliftMessage.Types.addRoute:
                        this.routes.push(obj["body"]);
                        break;
                    case ForkliftMessage.Types.getRoutes:
                        this.sendRoutes();
                        break;
                    default:
                        console.error("Invalid package");
                        break;
                }
            }

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
    sendRoutes() {
        this.socket.send(JSON.stringify(this.routes));
    }

    getNextInstruction() {
        // Current route has instructions to process
        if (this.currentRoute && this.currentRoute.instructions.length > 0) {
            return this.currentRoute.instructions.shift();
        }
        // No instructions in current route, try next route
        else if (this.routes.length > 0) {
            this.currentRoute = this.routes.shift();
            return this.getNextInstruction();
        }
        // No more routes to try, return null
        else {
            return null;
        }
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

