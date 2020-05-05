// forklift.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { WebSocket } from "../../shared/webSocket";
import { Route } from "../../shared/route";
import { Vector2 } from "../../shared/vector2";
import { ForkliftInfo, ForkliftStates } from "../../shared/forkliftInfo";
import { EventEmitter } from "events";
import { applyMixins } from "../../shared/utilities";


enum events {
    initiated = "initiated",
    updated = "updated"
}
export interface Forklift extends EventEmitter, ForkliftInfo { };

/**
 * A {@link Forklift} object representing a real forklift and used for communication with it
 */
export class Forklift extends ForkliftInfo {
    static Events = events;

    /** An array of {@link Route} assigned to the {@link Forklift} */
    routes: Route[];

    constructor(id: string, socket: WebSocket) {
        super();
        this.id = id;
        this.routes = [];
        this.state = Forklift.states.initiating;

        this.socket = socket;

        this.on(WebSocket.packageTypes.forkliftInfo, (forkliftInfo: ForkliftInfo) => {
            let initated = this.state === ForkliftStates.initiating;
            if (!this.putData(forkliftInfo)) return;
            if (initated) this.emit(Forklift.Events.initiated, this);
            this.emit(Forklift.Events.updated, this);
        });
    }


    private _socket: WebSocket;
    /**
     * Returns a {@link WebSocket} between the {@link Forklift} object and the real forklift
     * @note Is redefined in {@link Forklift.setSocket}
     * @returns A socket
     */
    private get socket(): WebSocket {
        return this._socket;
    }

    /**
     * Sets the {@link WebSocket} of the {@link Forklift} by redefining {@link Forklift.getSocket}
     * @param socket A {@link WebSocket} to be set
     */
    private set socket(socket: WebSocket | null) {
        if (this.hasSocket()) this.socket.close();
        this._socket = socket;

        if (socket !== null) {
            socket.on(WebSocket.packageTypes.forkliftInfo, (info) => {
                this.emit(WebSocket.packageTypes.forkliftInfo, info);
            });
        }
    }

    /**
     * Returns whether a {@link WebSocket} is asigned to the {@link Forklift} the function is called on
     * @returns True if a {@link WebSocket} is asigned, false otherwise
     */
    hasSocket(): boolean {
        return typeof (this.socket) === "object" && this.socket !== null;
    }

    /**
     * Sends the parameter {@link Route} through the socket
     * @param route A route to be sendt
     */
    sendRoute(route: Route): void {
        this.socket.sendRoute(route);
    }

    /**
     * @note Is not used
     * @param obj  A {@link Forklift} to be parsed
     * @returns null
     */
    static parse(obj: any): Forklift | null {
        if (typeof (obj) !== "object" || obj === null) return null;
        if (typeof (obj.id) !== "string" || obj.id.length < 1) return null;

        return null;
    }

    /**
     * Adds the content of the paramter object to {@link Forklift} the function is called on
     * @param obj An object, whose data is saved
     * @returns A string with a message explaining whether the content of the parameter was accepted
     * or an explenation if it was not
     */
    putData(obj: any): boolean {
        // Valid object (not null and type object)
        if (typeof (obj) !== "object" || obj === null) return false;
        if (typeof (obj.id) === "string" && obj.id !== this.id) return false;

        // Get all field names
        let keys: string[] = Object.keys(obj);

        // Get the info
        if (typeof (obj.batteryStatus) === "number" && (obj.batteryStatus >= 0 && obj.batteryStatus < 101)) {
            this.batteryStatus = obj.batteryStatus;
        }

        let parsedPos: Vector2 = Vector2.parse(obj.position);
        if (typeof (obj.position) === "object" && obj.position !== null && parsedPos !== null) {
            this.position = parsedPos;
        }

        if (typeof (Forklift.states[obj.state]) !== "undefined") {
            this.state = obj.state;
        }

        if (typeof (obj.palletId) === "string" && obj.palletId.length > 0) {
            this.palletId = obj.palletId;
        }

        if (typeof (obj.routes) === "object" && obj.routes !== null) {
            this.routes = obj.routes;
        }

        return true;
    }
}
applyMixins(Forklift, [EventEmitter, ForkliftInfo]);
