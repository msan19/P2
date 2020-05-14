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

/**
 * Enumeration type used for events regarding {@link Forklift} object
 * Each enum is equivalent to its name as a string
 */
enum events {
    initiated = "initiated",
    updated = "updated"
}
export interface Forklift extends EventEmitter, ForkliftInfo { };

/**
 * A {@link Forklift} object representing a real forklift 
 * and used for communication with it
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

        /** Set event-handler on {@link Forklift} */
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
     * Sets the {@link WebSocket} of the {@link Forklift} 
     * by redefining {@link Forklift.getSocket}
     * @param socket A {@link WebSocket} to be set
     */
    private set socket(socket: WebSocket | null) {
        if (this.hasSocket()) this.socket.close();
        this._socket = socket;

        // Set event-handler if valid socket
        if (socket !== null) {
            socket.on(WebSocket.packageTypes.forkliftInfo, (info) => {
                this.emit(WebSocket.packageTypes.forkliftInfo, info);
            });
        }
    }

    /**
     * Returns whether a {@link WebSocket} is assigned to the 
     * {@link Forklift} the function is called on
     * @returns True if a {@link WebSocket} is assigned, false otherwise
     */
    hasSocket(): boolean {
        return typeof (this.socket) === "object" && this.socket !== null;
    }

    /**
     * Sends the parameter {@link Route} through the socket
     * @param route A route to be sent
     */
    sendRoute(route: Route): void {
        this.socket.sendRoute(route);
    }

    /**
     * @note Is not used
     * @param obj  A {@link Forklift} to be parsed
     * @returns null, but should return parsed {@link Forklift} object
     */
    static parse(obj: any): Forklift | null {
        if (typeof (obj) !== "object" || obj === null) return null;
        if (typeof (obj.id) !== "string" || obj.id.length < 1) return null;

        return null;
    }

    /**
     * Adds the content of the paramter object to {@link Forklift} the function is called on
     * @param obj An object, whose data is saved
     * @returns A boolean where true represents succesfull data delivery
     * and false unsuccesfull
     */
    putData(obj: any): boolean {
        // Valid object (not null and type object)
        if (typeof (obj) !== "object" || obj === null) return false;
        if (typeof (obj.id) === "string" && obj.id !== this.id) return false;

        // Get the battery information if valid
        if (typeof (obj.batteryStatus) === "number" && (obj.batteryStatus >= 0 && obj.batteryStatus < 101)) {
            this.batteryStatus = obj.batteryStatus;
        }

        // Get position information if valid
        let parsedPos: Vector2 = Vector2.parse(obj.position);
        if (typeof (obj.position) === "object" && obj.position !== null && parsedPos !== null) {
            this.position = parsedPos;
        }

        // Get state if valid
        if (typeof (Forklift.states[obj.state]) !== "undefined") {
            this.state = obj.state;
        }

        // Get pallet ID if valid
        if (typeof (obj.palletId) === "string" && obj.palletId.length > 0) {
            this.palletId = obj.palletId;
        }

        // Get routes if valid
        if (typeof (obj.routes) === "object" && obj.routes !== null) {
            this.routes = obj.routes;
        }

        // Succesful delivery of data
        return true;
    }
}
applyMixins(Forklift, [EventEmitter, ForkliftInfo]);
