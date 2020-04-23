// forklifts.ts
/**
 * This is the doc comment for forklifts.ts
 * @packageDocumentation
 * @category Forklifts
 */

import * as WebSocket from "ws";
import { Route, Instruction } from "../shared/route";
import { ForkliftInfo, ForkliftStates } from "./../shared/forkliftInfo";
import { JsonTryParse } from "../shared/webUtilities";
import { Vector2 } from "../shared/vector2";

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

    constructor(id: string, hostname: string, port: number, batteryStatus: number, state: ForkliftStates, position: Vector2) {
        super();
        this.id = id;
        this.batteryStatus = batteryStatus;
        this.state = state;
        this.position = position;

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
                        this.addRoute(obj["body"]);
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
            "id": this.id,
            "batteryStatus": this.batteryStatus,
            "palletId": this.palletId,
            "state": this.state,
            "position": this.position
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

    unshiftFirstInstruction() {
        // Current route has instructions to process
        if (this.currentRoute && this.currentRoute.instructions.length > 0) {
            return this.currentRoute.instructions.shift();
        }
        // No instructions in current route, try next route
        else if (this.routes.length > 0) {
            this.currentRoute = this.routes.shift();
            return this.unshiftFirstInstruction();
        }
        // No more routes to try, return null
        else {
            return null;
        }
    }
    getNextInstruction() {
        for (let route of this.routes) {
            for (let instruction of route.instructions) {
                return instruction;
            }
        }
        return null;
    }

    processRoutes() {
        let nextInstruction = this.unshiftFirstInstruction();
        if (nextInstruction !== null) {
            this.processInstruction(nextInstruction)
                .then(this.processRoutes);
        }
    }

    processInstruction(instruction: Instruction): Promise<void> {
        return new Promise((resolve: () => void) => {

            switch (instruction.type) {
                case Instruction.types.charge:
                    break;
                case Instruction.types.loadPallet:
                    break;
                case Instruction.types.move:
                    break;
                case Instruction.types.sendFeedback:
                    this.sendStatus();
                    break;
                case Instruction.types.unloadPallet:
                    break;
                case Instruction.types.wait:
                    break;
            }

            setTimeout(() => { resolve(); }, this.estimateInstructionDuration(instruction));
        });
    }

    estimateInstructionDuration(instruction: Instruction) {
        let next = this.getNextInstruction();
        if (next !== null) {
            return next.startTime - instruction.startTime;
        }
        else return 0;
    }
}

