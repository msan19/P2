// webSocket.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import * as ws from "ws";
import { Route } from "./route";
import { ForkliftInfo } from "./forkliftInfo";
import { Order } from "./order";
import { Warehouse } from "./warehouse";
import { EventEmitter } from "events";
import { JsonTryParse } from "./webUtilities";
import { stringifyObject } from "./utilities";

/** An enum representing the type of package being sendt and recieved */
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

/**
 * A {@link WebSocket} object implementing functions to manage a socket connection
 */
export class WebSocket extends EventEmitter {

    /** A reference to the entire enum of PackageTypes */
    static packageTypes = PackageTypes;

    /** A socket which the class manages */
    private socket: ws;

    constructor(socket: ws) {
        super();
        this.socket = socket;

        socket.on("error", () => this.emit("close"));
        socket.on("close", () => this.emit("close"));
        socket.on("message", (msg) => {
            // Parse as JSON
            let data = JsonTryParse(String(msg));
            if (data === null) {
                // If body isn't valid json, emit as other
                this.emitAndExpectListeners(WebSocket.packageTypes.other, msg);
                return;
            }

            let type = WebSocket.packageTypes[data["type"]];
            if (type !== null) {
                // If known type, emit that with body
                this.emitAndExpectListeners(type, data["body"]);
            } else {
                // If invalid package, emit as generic json
                this.emitAndExpectListeners(WebSocket.packageTypes.json, data);
            }
        });
    }

    private emitAndExpectListeners(type: PackageTypes, data: any) {
        if (!this.emit(type, data)) {
            // Emit returns true if any listeners were found.
            // Throw error if there were no listeners.
            console.error(`WebSocket: No listeners found for package-type '${type}'`);
        }
    }

    /**
     * Sends the parameter object through the socket
     * @param type A {@link Websocket.packageTypes} enum
     * @param obj An object to be sendt
     */
    private send(type: PackageTypes, obj: any): void {
        this.socket.send(stringifyObject({
            type: type,
            body: obj
        }));
    }

    /**
    * Sends the parameter {@link Route} through the socket
    * @param obj A {@link Route} to be sendt
    */
    sendRoute(route: Route): void {
        this.send(WebSocket.packageTypes.route, route);
    }

    /**
    * Sends the parameter {@link Route} dictionary through the socket
    * @param obj A {@link Route} dictionary to be sendt
    */
    sendRoutes(routes: { [key: string]: Route; }): void {
        this.send(WebSocket.packageTypes.routes, routes);
    }

    /**
    * Sends the parameter {@link ForkliftInfo} through the socket
    * @param obj A {@link ForkliftInfo} to be sendt
    */
    sendForkliftInfo(forkliftInfo: ForkliftInfo): void {
        this.send(WebSocket.packageTypes.forkliftInfo, forkliftInfo);
    }

    /**
    * Sends the parameter {@link ForkliftInfo} dictionary through the socket
    * @param obj A {@link ForkliftInfo} dictionary to be sendt
    */
    sendForkliftInfos(forkliftInfo: { [key: string]: ForkliftInfo; }): void {
        this.send(WebSocket.packageTypes.forkliftInfos, forkliftInfo);
    }

    /**
    * Sends the parameter {@link Order} through the socket
    * @param obj A {@link Order} to be sendt
    */
    sendOrder(order: Order): void {
        this.send(WebSocket.packageTypes.order, order);
    }

    /**
    * Sends the parameter {@link Order} dictionary through the socket
    * @param obj A {@link Order} dictionary to be sendt
    */
    sendOrders(orders: { [key: string]: Order; }): void {
        this.send(WebSocket.packageTypes.orders, orders);
    }

    /**
    * Sends the parameter {@link Warehouse} through the socket
    * @param obj A {@link Warehouse} to be sendt
    */
    sendWarehouse(warehouse: Warehouse): void {
        this.send(WebSocket.packageTypes.warehouse, warehouse);
    }

    /**
     * Sends a messege through the socket accepting initialization
     */
    accept(): void {
        this.socket.send('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
            'Upgrade: WebSocket\r\n' +
            'Connection: Upgrade\r\n' +
            '\r\n');
    }

    /**
     * Closes the socket
     */
    close(): void {
        this.socket.close();
    }

    /**
     * Changes the parameter {@link WebSocket} so that the {@link WebSocket} the function is called on
     * recieves a message of the parameter enum {@link WebSocket.packageTypes} when the parameter {@link WebSocket} does
     * @param socketToListenTo A {@link WebSocket} whose messages are forwarded
     * @param type An enum {@link WebSocket.packageTypes} specifying what messages to forward
     */
    listenToSocket(socketToListenTo: WebSocket, type: PackageTypes): void {
        let self = this;
        let func = (obj: any) => { self.send(type, obj); };
        socketToListenTo.on(type, func);

        socketToListenTo.on("close", () => {
            socketToListenTo.removeListener(type, func);
        });
    }

    async whenPackage<T>(type: PackageTypes): Promise<T> {
        return new Promise((resolve: (result: T) => any) => {
            let event = (result: T) => {
                resolve(result);
                this.removeListener(type, event);
            };
            this.on(type, event);
        });
    }
}
