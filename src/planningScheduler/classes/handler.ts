import { Forklift } from "./forklift";
import { DataContainer } from "./dataContainer";
import { IncomingMessage, ServerResponse, Server } from "http";
import * as WebSocket from "ws";
import { Socket } from "net";
import { Warehouse } from "./warehouse";
import { Graph } from "./graph";
import { Order } from "./order";

import { getJson } from "../../shared/webUtilities";



function hasId(element): boolean {
    return typeof (element) === "string" && element.length > 0;
}

function returnStatus(response: ServerResponse, status: number, message: string) {
    response.writeHead(status, message);
    response.write(message);
    response.end();
}
function returnSuccess(response: ServerResponse) {
    returnStatus(response, 200, "Success");
}
function returnNotFound(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 404, `Url: '${request.url}' not found`);
}
function returnNotImplemented(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 500, `Url: '${request.url}' not implemented`);
}
function returnInvalidJSON(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 400, `Invalid JSON`);
}
function returnJson(response: ServerResponse, obj: any) {
    response.writeHead(200);
    response.write(JSON.stringify(obj));
    response.end();
}


interface IHttpMethod { (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void; }
interface IController { [key: string]: IHttpMethod; };

//interface IHttpUpgrade { (request: IncomingMessage, webSocket: WebSocket, parsedUrl: string[]): void; }
//interface IHttpUpgrade { (request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void; }
interface ISocketController { (socketServer: WebSocket.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void; }


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
                    returnJson(response, warehouse);
                } else {
                    returnStatus(response, 500, "Warehouse info not yet received");
                }
            },
            // /warehouse
            POST: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                getJson(request)
                    .then((obj) => {
                        let warehouse = Warehouse.parse(obj);
                        if (warehouse !== null) {
                            this.data.warehouse = warehouse;
                            returnSuccess(response);
                        } else {
                            if (Graph.parse(obj["graph"]) === null) {
                                returnStatus(response, 401, "Invalid Graph");
                            } else {
                                returnStatus(response, 400, "Invalid Warehouse");
                            }
                        }
                    })
                    .catch(() => {
                        returnInvalidJSON(request, response);
                    });
            }
        },
        routes: {
            // /routes
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                returnJson(response, this.data.routes);
            }
        },

        orders: {
            // /orders
            // /orders/id
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
                if (typeof (id) === "string") {
                    let order = this.data.orders[id];
                    if (order != null) {
                        returnJson(response, this.data.orders[id]);
                    } else {
                        returnStatus(response, 404, "Order not found");
                    }
                } else {
                    returnJson(response, this.data.orders);
                }
            },
            // /orders
            POST: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                getJson(request)
                    .then((obj) => {
                        let order = Order.parse(obj, this.data);
                        if (order !== null) {
                            this.data.addOrder(order);
                            returnSuccess(response);
                        } else {
                            returnStatus(response, 400, "Invalid Order");
                        }
                    }).catch(() => {
                        returnInvalidJSON(request, response);
                    });
            }
        },
        forklifts: {
            // /forklifts
            // /forklifts/id
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
                if (typeof (id) === "string") {
                    let forklift = this.data.orders[id];
                    if (forklift != null) {
                        returnJson(response, this.data.forklifts[id]);
                    } else {
                        returnStatus(response, 404, "Forklift not found");
                    }
                } else {
                    returnJson(response, this.data.forklifts);
                }
            },
            // /forklifts/{guid}
            PUT: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;

                if (id !== null) {
                    getJson(request)
                        .then((obj) => {
                            this.data.forklifts[id].putData(obj);
                            returnSuccess(response);
                        }).catch(() => {
                            returnInvalidJSON(request, response);
                        });
                }
                else {
                    returnNotFound(request, response);
                }
            },
            // /forklifts/{guid}/intiate
            POST: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
                if (id !== null && parsedUrl[3] === "initiate") {
                    getJson(request)
                        .then((obj) => {
                            let forklift = Forklift.parse(obj);
                            if (forklift !== null) {
                                this.data.addForklift(forklift);
                                returnSuccess(response);
                            } else {
                                if (this.data.forklifts[forklift.id] === null) {
                                    returnStatus(response, 400, "Invalid forklift");
                                } else {
                                    returnStatus(response, 401, "Forklift already initiated");
                                }
                            }
                        }).catch(() => {
                            returnInvalidJSON(request, response);
                        });
                } else {
                    returnNotFound(request, response);
                }
            }
        }
    };
    socketControllers: { [key: string]: ISocketController; } = {
        // /forklifts/{guid}/intiate
        forklifts: (socketServer: WebSocket.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void => {
            let id = hasId(parsedUrl[2]) ? parsedUrl[2] : null;
            if (id !== null && parsedUrl[3] === "initiate") {
                socketServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
                    let forklift = new Forklift(id, ws);
                    this.data.addForklift(forklift);
                    ws.send('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                        'Upgrade: WebSocket\r\n' +
                        'Connection: Upgrade\r\n' +
                        '\r\n');
                });
            } else {
                // 404
                socket.destroy();
            }
        }
    };
};

