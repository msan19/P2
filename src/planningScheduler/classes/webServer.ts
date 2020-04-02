import * as http from "http";
import { Handler } from "./handler";
import { DataContainer } from "./dataContainer";
import * as WebSocket from "ws";
import * as net from "net";
import { Forklift } from "./forklift";

export class WebServer {
    server: http.Server;
    port: number;
    hostname: string;
    handler: Handler;
    webSocket: WebSocket.Server;


    constructor(data: DataContainer, port: number, hostname: string) {
        this.port = port;
        this.hostname = hostname;
        this.handler = new Handler(data);
        this.webSocket = new WebSocket.Server({
            noServer: true
        });

        this.server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse): void => {
            request.method = request.method.toUpperCase();
            let parsedUrl = request.url.split("/");
            console.log(`${request.method}`);
            // control sequence

            ///TODO: Prevent abuse such as calling "/constructor"
            let handler = this.handler[parsedUrl[1]];
            if (typeof (handler) === "function") {
                handler(request, response, parsedUrl);
            } else {
                response.writeHead(404);
                response.end();
            }
        });


        this.server.on("upgrade", (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
            console.log("web-socket from: " + request.url)

            if (true /* isForklift */) {
                let id = "sfgsdafgdfs";


                this.webSocket.handleUpgrade(request, socket, head, (ws: WebSocket) => {
                    if (!data.forklifts[id]) {
                        data.forklifts[id] = new Forklift(id);
                    }
                    data.forklifts[id].socket = ws;
                    // ws.on('message', (message:WebSocket.Data) => {
                    //   console.log('received: %s', message);
                    // });

                    ws.send('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                        'Upgrade: WebSocket\r\n' +
                        'Connection: Upgrade\r\n' +
                        '\r\n');
                });
            }
        });

    }

    run(): void {
        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }

}
