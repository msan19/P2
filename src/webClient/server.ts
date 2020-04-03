// TO DO 

import { WebServer } from "../shared/webServer";
import { WebClientHandler } from "./webClientHandler";
import * as http from "http";
import * as fs from "fs";

export class WebServerClient extends WebServer { // RENAME!!! 
    handler: WebClientHandler;

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
