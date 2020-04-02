import { Forklift } from "./forklift";
import { DataContainer } from "./dataContainer";
import { IncomingMessage, ServerResponse } from "http";


function getEntireString(request: IncomingMessage): Promise<string> {
    let socket = request.connection;

    return new Promise((resolve: (dataString: string) => void, reject: (reason: string) => void) => {
        let body = "";
        socket.on("close", () => {
            reject("Connection Closed");
        });
        socket.on("data", (data: Buffer) => {
            body += data;
        });
        socket.on("end", () => {
            resolve(body);
        });
    });
}

function getJson(request: IncomingMessage): Promise<object> {
    return getEntireString(request)
        .then((str: string) => {
            return new Promise((resolve: (value: object) => void) => {
                resolve(JSON.parse(str));
            });
        });
}

function hasId(element): boolean {
    return typeof (element) === "string" && element.length > 0;
}

function send404(request: IncomingMessage, response: ServerResponse) {
    response.writeHead(404, `Url: '${request.url}' not found`);
    response.end();
}
function sendNotImplemented(request: IncomingMessage, response: ServerResponse) {
    response.writeHead(404, `Url: '${request.url}' not implemented`);
    response.end();
}


interface IController { [key: string]: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]) => void; };


export class Handler {
    data: DataContainer;
    constructor(data: DataContainer) {
        this.data = data;
    }

    controllers: { [key: string]: IController; } = {
        warehouse: {
            // /warehouse
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let warehouse = this.data.warehouse;
                if (warehouse != null) {
                    response.writeHead(200);
                    response.write(JSON.stringify(warehouse));
                    response.end();
                } else {
                    response.writeHead(500, "Warehouse not yet recieved");
                    response.end();
                }
            },
            // /warehouse
            POST: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                getJson(request)
                    .then(() => {
                        response.writeHead(200, "okay");
                        response.end();
                    });
            }
        },
        routes: {
            // /routes
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                response.writeHead(200);
                response.write(JSON.stringify(this.data.routes));
                response.end();
            }
        },

        orders: {
            // /orders
            // /orders/id
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
                if (id === null) {
                    response.writeHead(200, "okay");
                    response.end();
                }
                else {
                    // return specific
                    sendNotImplemented(request, response);
                }
            },
            // /orders
            POST: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                response.writeHead(200, "ok");
                response.end();
            }
        },
        forklifts: {
            // /forklifts
            // /forklifts/id
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
                if (id === null) {
                    response.writeHead(200);
                    response.write(JSON.stringify(this.data.forklifts));
                    response.end();
                }
                else {
                    //let forklift = this.data.forklifts.find(parsedUrl[2]);
                    response.writeHead(200);
                    response.write(JSON.stringify(this.data.routes));
                    response.end();
                    // return specific
                    sendNotImplemented(request, response);
                }
            },
            // /forklifts/{guid}
            PUT: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
                if (id !== null) {
                    response.writeHead(200, "okay");
                    response.end();
                }
                else {
                    send404(request, response);
                }
            },
            // /forklifts/{guid}/intiate
            POST: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
                if (id !== null && parsedUrl[3] === "initiate") {
                    response.writeHead(200, "okay");
                    response.end();
                }
            }
        }
    };
};

