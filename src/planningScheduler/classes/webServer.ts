import http = require("http");
import fs = require("fs");
import { Handler } from "./handler";
import { DataContainer } from "./dataContainer";

export class WebServer {
    server: http.Server;
    port: number;
    hostname: string;
    handler: Handler;

    constructor(data: DataContainer, port: number, hostname: string) {
        this.port = port;
        this.hostname = hostname;
        this.handler = new Handler(data);
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
            }
        });
    }

    run(): void {
        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }

}
