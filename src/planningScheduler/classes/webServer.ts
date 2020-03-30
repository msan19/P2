import http = require("http");
import fs = require("fs");
import {Handler} from "./handler";

export class WebServer {
    server
    port
    hostname
    handler:Handler;
    constructor(data, port, hostname) {
        this.port = port;
        this.hostname = hostname;
        this.server = http.createServer(this.serverSetup);
        this.handler = new Handler(data);
    }

    serverSetup(request, response) {
        
        request.method = request.method.toUpperCase();
        request.parsedUrl = request.url.split("/");
        console.log(`${request.method}`);
        // control sequence
        switch (request.parsedUrl[1]) {
            case "":
                response.writeHead(200);
                response.end(fs.readFileSync("tester.html"));
            case "forklifts":
                this.handler.forklifts(request, response);
                break;
            case "routes":
                this.handler.routes(request, response);
                break;
            case "warehouse":
                this.handler.warehouse(request, response);
                break;
            case "orders":
                this.handler.orders(request, response);
                break;
            default:
                response.writeHead(404);
                response.end();
                // Error handling
        }
    
    }

    run() {
        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }

}
