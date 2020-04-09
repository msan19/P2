import * as ws from "ws";
import { WebServer } from "../shared/webServer";
import { WebSocket } from "../shared/webSocket";
import { WebClientHandler } from "./webClientHandler";

export class WebServerClient extends WebServer {
    handler: WebClientHandler;
    apiSocket: WebSocket;

    constructor(hostname: string, port: number, apiHostname: string, apiPort: number) {
        super(hostname, port);

        let socket = new ws(`ws://${apiHostname}:${apiPort}/subscribe`);
        socket.on("open", () => {
            this.apiSocket = new WebSocket(socket);
            this.handler = new WebClientHandler(this.apiSocket);
            this.createServer(this.handler.controllers, this.handler.socketControllers);
            this.run();
        });
    }
}
