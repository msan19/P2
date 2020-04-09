import { IncomingMessage, ServerResponse } from "http";
import * as ws from "ws";
import { Socket } from "net";
import { WebSocket } from "../shared/webSocket";


interface IController { [key: string]: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]) => void; };
interface ISocketController { (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void; }


export class WebClientHandler {
    webSocket: WebSocket;
    constructor(webSocket: WebSocket, maxClients: number) {
        this.webSocket = webSocket;
        this.webSocket.setMaxListeners(maxClients * Object.keys(WebSocket.packageTypes).length);
    }

    controllers: { [key: string]: IController; } = {

    };
    socketControllers: { [key: string]: ISocketController; } = {
        subscribe: (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void => {

            socketServer.handleUpgrade(request, socket, head, (ws: ws) => {
                let webSocket = new WebSocket(ws);
                webSocket.accept();
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.forkliftInfo);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.forkliftInfos);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.route);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.routes);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.order);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.orders);
                webSocket.listenToSocket(this.webSocket, WebSocket.packageTypes.warehouse);
            });

        }
    };
};

