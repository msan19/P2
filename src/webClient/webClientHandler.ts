// webClientHandler.ts
/**
 * @packageDocumentation
 * @category WebClient
 */

import { IncomingMessage, ServerResponse } from "http";
import * as ws from "ws";
import * as fs from "fs";
import { Socket } from "net";
import { WebSocket } from "../shared/webSocket";
import { Warehouse } from "../shared/warehouse";
import { ForkliftInfo } from "../shared/forkliftInfo";
import { Order } from "../shared/order";
import { Route } from "../shared/route";
import { getStaticFile, sanitizePath, getContentsHTML } from "../shared/webUtilities";


interface IController { [key: string]: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]) => void; };
interface ISocketController { (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void; }


export class WebClientHandler {
    webSocket: WebSocket;

    warehouse: Warehouse;
    forklifts: { [key: string]: ForkliftInfo; };
    orders: { [key: string]: Order; };
    routes: { [key: string]: Route; };

    constructor(webSocket: WebSocket, maxClients: number) {
        this.webSocket = webSocket;
        this.webSocket.setMaxListeners(maxClients * Object.keys(WebSocket.packageTypes).length);

        this.webSocket.on(WebSocket.packageTypes.warehouse, (warehouse: Warehouse) => { this.warehouse = warehouse; });

        this.webSocket.on(WebSocket.packageTypes.forkliftInfo, (forklift: ForkliftInfo) => { this.forklifts[forklift.id] = forklift; });
        this.webSocket.on(WebSocket.packageTypes.forkliftInfos, (forklifts: { [key: string]: ForkliftInfo; }) => { this.forklifts = forklifts; });

        this.webSocket.on(WebSocket.packageTypes.order, (order: Order) => { this.orders[order.id] = order; });
        this.webSocket.on(WebSocket.packageTypes.orders, (orders: { [key: string]: Order; }) => { this.orders = orders; });

        this.webSocket.on(WebSocket.packageTypes.route, (route: Route) => { this.routes[route.routeId] = route; });
        this.webSocket.on(WebSocket.packageTypes.routes, (routes: { [key: string]: Route; }) => { this.routes = routes; });
    }

    controllers: { [key: string]: IController; } = {
        home: {
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                response.writeHead(200, `ok`);

                let fileContents = getContentsHTML("src/webClient/ressources", "index.html");

                response.write(fileContents);
                response.end();
            }
        }
    };

    socketControllers: { [key: string]: ISocketController; } = {
        subscribe: (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void => {

            socketServer.handleUpgrade(request, socket, head, (ws: ws) => {
                let webSocket = new WebSocket(ws);
                webSocket.accept();
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.forkliftInfo);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.forkliftInfos);
                webSocket.sendForkliftInfos(this.forklifts);

                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.route);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.routes);
                webSocket.sendRoutes(this.routes);

                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.order);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.orders);
                webSocket.sendOrders(this.orders);

                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.warehouse);
                webSocket.sendWarehouse(this.warehouse);

            });

        }
    };
};

