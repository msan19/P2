import * as http from "http";
import * as WebSocket from "ws";
import * as net from "net";

export class WebServer {
    server: http.Server;
    port: number;
    hostname: string;
    webSocket: WebSocket.Server;

    constructor(hostname: string, port: number) {
        this.port = port;
        this.hostname = hostname;
        this.webSocket = new WebSocket.Server({
            noServer: true
        });
    }

    createServer(controllers: any, socketControllers: any): void {
        this.server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse): void => {
            request.method = request.method.toUpperCase();
            let parsedUrl = request.url.split("/");
            console.log(`${request.url}, METHOD = ${request.method}`);

            let controller = controllers[parsedUrl[1]];
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
            let socketController = socketControllers[parsedUrl[1]];
            if (typeof (socketController) === "function") {
                socketController(this.webSocket, request, socket, head, parsedUrl);
            }
        });
    }

    run(): void {
        this.server.listen(this.port, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }
}
