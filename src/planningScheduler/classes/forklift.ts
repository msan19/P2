import * as WebSocket from "ws";
import { Route } from "./route";
import { Vector2 } from "./vector2";
import { Order } from "./order";
import { type } from "os";

export enum ForkliftStates {
    idle = 1,
    hasOrder,
    charging,
    initiating
}

export class Forklift {
    static states = ForkliftStates;
    id: string;
    batteryStatus: number;
    position: Vector2;
    state: ForkliftStates;
    palletId: string;
    routes: Route[];
    orders: Order[];
    private _socket: WebSocket;

    constructor(id: string, socket: WebSocket) {
        this.id = id;
        this.socket = socket;
        this.state = ForkliftStates.initiating;
    }

    set socket(socket: WebSocket) {

        if (this.hasSocket()) this._socket.close();
        this._socket = socket;
        this._socket.on("message", (data: WebSocket.Data) => {
            console.log(data);
        });
    }

    get socket() {
        return this._socket;
    }

    hasSocket() {
        return typeof (this._socket) === "object" && this._socket !== null;
    }

    isValid() {
        return this.hasSocket();
    }

    private sendStr(str: string): void {
        this._socket.send(str);
    }

    private sendObj(obj: any): void {
        this.sendStr(JSON.stringify(obj));
    }

    sendRoute(route: Route): void {
        this.sendObj(route);
    }

    static parse(obj: any): Forklift | null {
        if (typeof (obj) !== "object" || obj === null) return null;
        if (typeof (obj.id) !== "string" || obj.id.length < 1) return null;

        return null;
    }

    // Data can be: batteryStatus, position, state, palletId, orders, routes
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

        if (typeof (obj.state) === "number" && Object.keys(Forklift.).includes(obj.type)) {

        }

        // Update the forklift

        return "hello";
    }
}
