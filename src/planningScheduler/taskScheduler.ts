const http = require("http");
function newGuid() {return ""};

let i = 0;

//import Forklift = require("./classes/Forklift.ts");
import {Forklift} from "./classes/Forklift"
import {DataContainer} from "./classes/DataContainer"

 

let data = new DataContainer();

const handler = require("./handler")(data);
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 3000;

let server = http.createServer((request, response) => {
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
});

function update() {
    let running:boolean = true;


    console.log(`i: ${i++}`);
    // Actual code

    if (running) {
        setImmediate(update);
    }
}

update();

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

/* 
GET 127.12.123.12/forklifts/123908hbsaf/initiate HTTP/1.1

GET 127.12.123.12/ HTTP/1.1

*/







