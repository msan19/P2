import { Forklift } from "./forklift";
import { DataContainer } from "./dataContainer";
import { IncomingMessage, ServerResponse, Server } from "http";
import * as WebSocket from "ws";
import { Socket } from "net";
import { Warehouse } from "./warehouse";
import { Graph } from "./graph";
import { Order } from "./order";

import { getJson, returnJson, returnNotFound, returnStatus, passId, returnInvalidJson, returnSuccess } from "../../shared/webUtilities";


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
                                returnStatus(response, 400, "Invalid Graph");
                            } else {
                                returnStatus(response, 400, "Invalid Warehouse");
                            }
                        }
                    })
                    .catch(() => {
                        returnInvalidJson(response);
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
                let id = passId(parsedUrl[2]);
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
                        returnInvalidJson(response);
                    });
            }
        },
        forklifts: {
            // /forklifts
            // /forklifts/id
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = passId(parsedUrl[2]);
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
                let id = passId(parsedUrl[2]);

                if (id !== null) {
                    getJson(request)
                        .then((obj) => {
                            this.data.forklifts[id].putData(obj);
                            returnSuccess(response);
                        }).catch(() => {
                            returnInvalidJson(response);
                        });
                }
                else {
                    returnNotFound(request, response);
                }
            },
            // /forklifts/{guid}/intiate
            POST: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = passId(parsedUrl[2]);
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
                                    returnStatus(response, 400, "Forklift already initiated");
                                }
                            }
                        }).catch(() => {
                            returnInvalidJson(response);
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
            let id = passId(parsedUrl[2]) ? parsedUrl[2] : null;
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

