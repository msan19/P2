import * as ws from "ws";
import { Route } from "./route";
import { ForkliftInfo } from "./forkliftInfo";
import { Order } from "./order";
import { Warehouse } from "./warehouse";
import { EventEmitter } from "events";
import { JsonTryParse } from "./webUtilities";

enum PackageTypes {
    route = "route",
    routes = "routes",
    forkliftInfo = "forkliftInfo",
    forkliftInfos = "forkliftInfos",
    order = "order",
    orders = "orders",
    warehouse = "warehouse",
    json = "json",
    other = "other"
}

export class WebSocket extends EventEmitter {
    static packageTypes = PackageTypes;
    private socket: ws;

    private send(type: PackageTypes, obj: any) {
        this.socket.send(JSON.stringify({
            type: type,
            body: obj
        }));
    }

    constructor(socket: ws) {
        super();
        this.socket = socket;

        socket.on("error", () => this.emit("close"));
        socket.on("close", () => this.emit("close"));
        socket.on("message", (msg) => {
            let data = JsonTryParse(String(msg));
            if (data === null) {
                this.emit(WebSocket.packageTypes.other);
                return;
            }

            let type = WebSocket.packageTypes[data["type"]];
            if (type !== null) this.emit(type, data["body"]);
            else this.emit(WebSocket.packageTypes.json);
        });
    }

    sendRoute(route: Route) {
        this.send(WebSocket.packageTypes.route, route);
    }

    sendRoutes(routes: { [key: string]: Route; }) {
        this.send(WebSocket.packageTypes.routes, routes);
    }

    sendForkliftInfo(forkliftInfo: ForkliftInfo) {
        this.send(WebSocket.packageTypes.forkliftInfo, forkliftInfo);
    }

    sendForkliftInfos(forkliftInfo: { [key: string]: ForkliftInfo; }) {
        this.send(WebSocket.packageTypes.forkliftInfos, forkliftInfo);
    }

    sendOrder(order: Order) {
        this.send(WebSocket.packageTypes.order, order);
    }

    sendOrders(orders: { [key: string]: Order; }) {
        this.send(WebSocket.packageTypes.orders, orders);
    }

    sendWarehouse(warehouse: Warehouse) {
        this.send(WebSocket.packageTypes.warehouse, warehouse);
    }

    accept() {
        this.socket.send('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
            'Upgrade: WebSocket\r\n' +
            'Connection: Upgrade\r\n' +
            '\r\n');
    }
    close() {
        this.socket.close();
    }

    listenToSocket(socketToListenTo: WebSocket, type: PackageTypes) {
        let self = this;
        let func = (obj: any) => { self.send(type, obj); };
        socketToListenTo.on(type, func);

        socketToListenTo.on("close", () => {
            socketToListenTo.removeListener(type, func);
        });
    }

}
