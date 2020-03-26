"use strict";
exports.__esModule = true;
var http = require("http");
function newGuid() { return ""; }
;
var DataContainer_1 = require("./classes/DataContainer");
var data = new DataContainer_1.DataContainer();
var handler = require("./handler")(data);
var fs = require("fs");
var hostname = '127.0.0.1';
var port = 3000;
var server = http.createServer(function (request, response) {
    request.method = request.method.toUpperCase();
    request.parsedUrl = request.url.split("/");
    console.log("" + request.method);
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
server.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});
/*
GET 127.12.123.12/forklifts/123908hbsaf/initiate HTTP/1.1

GET 127.12.123.12/ HTTP/1.1

*/
