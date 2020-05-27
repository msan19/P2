/**
 * Contains the logic for physical forklifts.
 * Uses websockets for communication.
 * @packageDocumentation
 * @category Forklifts
 */

import * as ws from "ws";
import { Route, Instruction } from "../shared/route";
import { ForkliftInfo, ForkliftStates } from "./../shared/forkliftInfo";
import { Vector2 } from "../shared/vector2";
import { WebSocket } from "../shared/webSocket";


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
        let baseSocket = new ws(`ws://${hostname}:${port}/forklifts/${this.id}/initiate`);
        this.socket = new WebSocket(baseSocket);
        baseSocket.on("open", () => {
            this.sendStatus();
        });

        this.socket.on(WebSocket.packageTypes.route, (route: Route) => {
            this.addRoute(route);
        });
        this.socket.on(WebSocket.packageTypes.routes, (routes: Route[]) => {
            for (let route of routes) this.addRoute(route);
        });
    }

    sendStatus() {
        this.socket.sendForkliftInfo(this);
    }

    addRoute(route: Route) {
        this.routes.push(route);
        if (this.currentRoute === null) {
            this.processRoutes();
        }
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

