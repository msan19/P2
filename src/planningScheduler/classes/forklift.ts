// forklift.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { WebSocket } from "../../shared/webSocket";
import { Route } from "../../shared/route";
import { Vector2 } from "../../shared/vector2";
import { ForkliftInfo } from "../../shared/forkliftInfo";

/**
 * A {@link Forklift} object representing a real forklift and used for communication with it
 */
export class Forklift extends ForkliftInfo {

    /** An array of {@link Route} assigned to the {@link Forklift} */
    routes: Route[];

    constructor(id: string, socket: WebSocket) {
        super();
        this.id = id;
        this.routes = [];
        this.state = Forklift.states.initiating;
    }

    /**
     * Returns a {@link WebSocket} between the {@link Forklift} object and the real forklift
     * @note Is redefined in {@link Forklift.setSocket}
     * @returns A socket
     */
    private getSocket(): WebSocket {
        return null;
    }

    /**
     * Sets the {@link WebSocket} of the {@link Forklift} by redefining {@link Forklift.getSocket}
     * @param socket A {@link WebSocket} to be set
     */
    setSocket(socket: WebSocket): void {
        if (this.hasSocket()) this.getSocket().close();

        this.getSocket = () => { return socket; };

        socket.on(WebSocket.packageTypes.forkliftInfo, (forkliftInfo: ForkliftInfo) => {
            console.log(forkliftInfo);
        });
    }

    /**
     * Returns whether a {@link WebSocket} is asigned to the {@link Forklift} the function is called on
     * @returns True if a {@link WebSocket} is asigned, false otherwise
     */
    hasSocket(): boolean {
        return typeof (this.getSocket()) === "object" && this.getSocket() !== null;
    }

    /**
     * Sends the parameter {@link Route} through the socket
     * @param route A route to be sendt
     */
    sendRoute(route: Route): void {
        this.getSocket().sendRoute(route);
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
    putData(obj: any): string {
        // Valid object (not null and type object)
        if (typeof (obj) !== "object" || obj === null) return "not an object";
        if (typeof (obj.id) === "string" && obj.id !== this.id) return "not correct id";

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

        if (typeof (obj.state) === "number" && Object.keys(Forklift.states).includes(obj.type)) {
            this.state = obj.state;
        }

        if (typeof (obj.palletId) === "string" && obj.palletId.length > 0) {
            this.palletId = obj.palletId;
        }

        if (typeof (obj.routes) === "object" && obj.routes !== null) {
            this.routes = obj.routes;
        }

        return "succes";
    }
}
