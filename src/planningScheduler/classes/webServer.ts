import http = require("http");
import fs = require("fs");
/* Handler til klasse
import handler = require("./handler");
const handler = handler;
*/
export class WebServer {
    server
    port
    hostname
    constructor(data, port, hostname) {
        this.port = port;
        this.hostname = hostname;
        this.server = http.createServer(this.serverSetup);
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
                handler.forkliftsHandler(request, response);
                break;
            case "routes":
                handler.routesHandler(request, response);
                break;
            case "warehouse":
                handler.warehouseHandler(request, response);
                break;
            case "orders":
                handler.ordersHandler(request, response);
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
