// webServer.ts
/**
 * The Webserver class for making a webserver
 * @packageDocumentation
 * @category Shared
 */

import * as http from "http";
import * as WebSocket from "ws";
import * as net from "net";
import { getStaticFile } from "./webUtilities";
import * as mime from "mime-types";

/**
 * A {@link WebServer} object used to set up a server
 */
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

   /**
    * Creates a HTTP web server using Node.js methods.
    * Handles client requests by parsing part of an URL into a controller, and checking whether it is valid (typeof request.method).
    * If a controller is invalid, the server will return to index.html, prompting an error if unsuccessful.
    * When the event request 'upgrade' is triggered, a websocket is established at the given URL (?).
    * @param controllers An array containing the URL of the web server.
    * @param socketControllers An array containing the URL that a websocket has been established at (?).
    * @return nothing is returned, as createServer() simply creates a web server.
    */
    createServer(controllers: any, socketControllers: any): void {
        this.server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse): void => {
            request.method = request.method.toUpperCase();
            let parsedUrl = request.url.split("/");
            console.log(`${request.method}: ${request.url}`);

            let controller = controllers[parsedUrl[1].toLowerCase()];
            if (controller) {
                if (typeof (controller[request.method]) === "function") {
                    controller[request.method](request, response, parsedUrl);
                } else {
                    response.writeHead(404, `Method: '${request.url}' invalid for Url: '${request.url}'`);
                    response.end();
                }
            } else {
                let path = request.url;
                if (path === "" || path === "/") path = "index.html";
                getStaticFile("src/webClient/public", path)
                    .then((fileContents) => {
                        let headers = {};
                        let mimeType = mime.lookup(path);
                        if (mimeType) headers["Content-Type"] = mimeType;

                        response.writeHead(200, `ok`, headers);

                        response.write(fileContents);
                    })
                    .catch(() => {
                        response.writeHead(404, `Url: '${request.url}' not found`);
                        response.write(`Url: '${request.url}' not found`);
                    })
                    .finally(() => {
                        response.end();
                    });
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

    /** 
     * Runs the server and log "hostname:port" 
     */
    run(): void {
        this.server.listen(this.port, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }
}
