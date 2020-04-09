import { WebSocket } from "../../shared/webSocket";
import { Route } from "../../shared/route";
import { Vector2 } from "../../shared/vector2";
import { ForkliftInfo } from "../../shared/forkliftInfo";

export class Forklift extends ForkliftInfo {
    routes: Route[];
    private _socket: WebSocket;

    constructor(id: string, socket: WebSocket) {
        super();
        this.id = id;
        this.socket = socket;
        this.routes = [];
        this.state = Forklift.states.initiating;
    }

    set socket(socket: WebSocket) {
        if (this.hasSocket()) this._socket.close();

        this._socket = socket;
        this._socket.on(WebSocket.packageTypes.forkliftInfo, (forkliftInfo: ForkliftInfo) => {
            console.log(forkliftInfo);
        });
    }

    hasSocket() {
        return typeof (this._socket) === "object" && this._socket !== null;
    }

    isValid() {
        return this.hasSocket();
    }


    sendRoute(route: Route): void {
        this._socket.sendRoute(route);
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
