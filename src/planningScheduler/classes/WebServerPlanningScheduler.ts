import { WebServer } from "../../shared/webServer";
import { Handler } from "./handler";
import { DataContainer } from "./dataContainer";
import { Forklift } from "./forklift";
import * as http from "http";

import * as net from "net";
import * as WebSocket from "ws";

export class WebServerPlanningScheduler extends WebServer {
    handler: Handler;
    data: DataContainer;

    constructor(data: DataContainer, hostname: string, port: number) {
        super(hostname, port);
        this.handler = new Handler(data);
        this.data = data;

        this.createServer();
    }

    createServer() {
        this.server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse): void => {
            request.method = request.method.toUpperCase();
            let parsedUrl = request.url.split("/");
            console.log(`${request.method}, METHOD = ${request.method}`);
            // control sequence

            ///TODO: Prevent abuse such as calling "/constructor"
            let controller = this.handler.controllers[parsedUrl[1]];
            if (controller) {
                if (typeof (controller[request.method]) === "function") {
                    controller[request.method](request, response, parsedUrl);
                } else {
                    response.writeHead(404, `Method: '${request.url}' invalid for Url: '${request.url}'`);
                    response.end();
                }
            } else {
                response.writeHead(404, `Url: '${request.url}' not found`);
                response.end();
            }
        });

        this.server.on("upgrade", (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
            console.log("web-socket from: " + request.url);

            let parsedUrl = request.url.split("/");
            let socketController = this.handler.socketControllers[parsedUrl[1]];
            if (socketController) {
                if (typeof (socketController) === "function") {

                    socketController(this.webSocket, request, socket, head, parsedUrl);
                } else {
                    //response.writeHead(404, `Method: '${request.url}' invalid for Url: '${request.url}'`);
                    //response.end();
                }
            } else {
                //response.writeHead(404, `Url: '${request.url}' not found`);
                //response.end();
            }

        });

    }
}
