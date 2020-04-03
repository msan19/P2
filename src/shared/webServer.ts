import * as http from "http";
import { Handler } from "../planningScheduler/classes/handler";
import { DataContainer } from "../planningScheduler/classes/dataContainer";
import * as WebSocket from "ws";
import * as net from "net";
import { Forklift } from "../planningScheduler/classes/forklift";
import { WebClientHandler } from "../webClient/webClientHandler";


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

    createServer(): void {
        this.server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse): void => {
        });

    }

    run(): void {
        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }
}


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
    }
}


export class WebServerClient extends WebServer { // RENAME!!! 
    handler: WebClientHandler;
    webSocket: WebSocket.Server;


    constructor(hostname: string, port: number) {
        super(hostname, port);
        this.handler = new WebClientHandler();

        this.createServer();
    }

    createServer() { // TO DO: rewrite
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
    }
}


// export class WebServer {
//     server: http.Server;
//     port: number;
//     hostname: string;
//     handler: Handler;
//     webSocket: WebSocket.Server;


//     constructor(data: DataContainer, hostname: string, port: number) {
//         this.port = port;
//         this.hostname = hostname;
//         this.handler = new Handler(data);
//         this.webSocket = new WebSocket.Server({
//             noServer: true
//         });

//         this.server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse): void => {
//             request.method = request.method.toUpperCase();
//             let parsedUrl = request.url.split("/");
//             console.log(`${request.method}, METHOD = ${request.method}`);
//             // control sequence

//             ///TODO: Prevent abuse such as calling "/constructor"
//             let controller = this.handler.controllers[parsedUrl[1]];
//             if (controller) {
//                 if (typeof (controller[request.method]) === "function") {
//                     controller[request.method](request, response, parsedUrl);
//                 } else {
//                     response.writeHead(404, `Method: '${request.url}' invalid for Url: '${request.url}'`);
//                     response.end();
//                 }
//             } else {
//                 response.writeHead(404, `Url: '${request.url}' not found`);
//                 response.end();
//             }
//         });


//         this.server.on("upgrade", (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
//             console.log("web-socket from: " + request.url);

//             if (true /* isForklift */) {
//                 let id = "sfgsdafgdfs";


//                 this.webSocket.handleUpgrade(request, socket, head, (ws: WebSocket) => {
//                     if (!data.forklifts[id]) {
//                         data.forklifts[id] = new Forklift(id);
//                     }
//                     data.forklifts[id].socket = ws;
//                     // ws.on('message', (message:WebSocket.Data) => {
//                     //   console.log('received: %s', message);
//                     // });

//                     ws.send('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
//                         'Upgrade: WebSocket\r\n' +
//                         'Connection: Upgrade\r\n' +
//                         '\r\n');
//                 });
//             }
//         });

//     }

//     run(): void {
//         this.server.listen(this.port, this.hostname, () => {
//             console.log(`Server running at http://${this.hostname}:${this.port}/`);
//         });
//     };

// }
