import * as WebSocket from "ws";
import { Route } from "./route";

export class Forklift {
    id: string;
    private _socket: WebSocket;
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

    constructor(id: string, socket: WebSocket) {
        this.id = id;
        this.socket = socket;
    }


    send(route: Route): void {


    }
    static parse(obj: any): Forklift | null {
        return null;
    }
    putData(obj: any): void {

    }
}
