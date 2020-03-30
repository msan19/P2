import http = require("http");
import fs = require("fs");
import {Handler} from "./handler";
import {DataContainer} from "./dataContainer";

export class WebServer {
    server:http.Server;
    port:number;
    hostname:string;
    handler:Handler;
    constructor(data:DataContainer, port:number, hostname:string) {
        this.port = port;
        this.hostname = hostname;
        this.server = http.createServer(this.serverSetup);
        this.handler = new Handler(data);
    }

    serverSetup(request:http.IncomingMessage, response:http.ServerResponse) {
        request.method = request.method.toUpperCase();
        let parsedUrl = request.url.split("/");
        console.log(`${request.method}`);
        // control sequence
        switch (parsedUrl[1]) {
            case "":
                response.writeHead(200);
                response.end(fs.readFileSync("tester.html"));
            case "forklifts":
                this.handler.forklifts(request, response, parsedUrl);
                break;
            case "routes":
                this.handler.routes(request, response, parsedUrl);
                break;
            case "warehouse":
                this.handler.warehouse(request, response, parsedUrl);
                break;
            case "orders":
                this.handler.orders(request, response, parsedUrl);
                break;
            default:
                response.writeHead(404);
                response.end();
                // Error handling
        }
    }

    run():void {
        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }

}
