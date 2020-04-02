import {Forklift} from "./forklift"
import {DataContainer} from "./dataContainer"
import {IncomingMessage, ServerResponse} from "http"

function hasId(element):boolean {
    return typeof(element) === "string" && element.length > 0;
}

export class Handler {
    data:DataContainer;
    constructor(data:DataContainer) {
        this.data = data;
    }

    forklifts(request:IncomingMessage, response:ServerResponse, parsedUrl:string[]): void {
        const id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;

        if (request.method === "GET") {
            if (id !== null) {
                console.log(`METHOD = ${request.method} (GET), id = ${id} (nnull)`);
                response.writeHead(200,"okay");
                response.end();
            } else {
                console.log(`METHOD = ${request.method} (GET), id = ${id} (null)`);
                response.writeHead(500,"error");
                response.end();
            }
        } else if (request.method === "PUT" && id !== null) {
            console.log(`METHOD = ${request.method} (PUT), id = ${id} (nnull)`);
            response.writeHead(200,"okay");
            response.end();
        } else if (request.method === "POST" && id !== null && parsedUrl[3] === "initiate") {
            console.log(`METHOD = ${request.method} (POST), id = ${id} (nnull), initiate = ${parsedUrl[3]} (nnull)`);
            response.writeHead(200,"okay");
            response.end();
        } else {
            console.log("error");
            response.writeHead(500,"error");
            response.end();
        }
    }

    routes(request:IncomingMessage, response:ServerResponse, parsedUrl:string[]): void {
        if (request.method === "GET") {

            response.writeHead(200,"okay");
            response.write(JSON.stringify(this.data.routes));
            response.end();
            
            console.log(`METHOD = ${request.method} (GET)`);
        } else {
            console.log("error");
            response.writeHead(500,"error");
            response.end();
        }
    }

    warehouse(request:IncomingMessage, response:ServerResponse, parsedUrl:string[]): void {
        if (request.method === "GET") {
            console.log(`METHOD = ${request.method} (GET)`);
            response.writeHead(200,"okay");
            response.end();
        } else if (request.method === "POST") {
            console.log(`METHOD = ${request.method} (POST)`);
            response.writeHead(200,"okay");
            response.end();
        } else {
            console.log("error");
            response.writeHead(500,"error");
            response.end();
        }
    }

    orders(request:IncomingMessage, response:ServerResponse, parsedUrl:string[]): void {
        const id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
    
        if (request.method === "GET") {
            if (id !== null) {
                console.log(`METHOD = ${request.method} (GET), id = ${id} (nnull)`);
                response.writeHead(200,"okay");
                response.end();
            } else {
                console.log(`METHOD = ${request.method} (GET), id = ${id} (null)`);
                response.writeHead(500,"error");
                response.end();
            }
        } else if (request.method === "POST") {
            console.log(`METHOD = ${request.method} (POST)`);
            response.writeHead(200,"ok");
            response.end();
        } else {
            console.log("error");
            response.writeHead(500,"error");
            response.end();
        }
    }
}

