const http = require("http");
const handler = require("./handler");
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
            // Error handling
    }
});


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

/* 
GET 127.12.123.12/forklifts/123908hbsaf/initiate HTTP/1.1

GET 127.12.123.12/ HTTP/1.1

*/







