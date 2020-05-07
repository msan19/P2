// handler.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import * as ws from "ws";
import { Socket } from "net";
import { IncomingMessage, ServerResponse } from "http";

import { getJson, returnJson, returnNotFound, returnStatus, passId, returnInvalidJson, returnSuccess } from "../../shared/webUtilities";
import { WebSocket } from "../../shared/webSocket";

import { DataContainer, DataContainerEvents } from "./dataContainer";
import { Warehouse } from "./warehouse";
import { Forklift } from "./forklift";
import { Graph } from "./graph";
import { Order } from "./order";


/** An interface specifying a function which handles HTTP requests */
interface IHttpMethod { (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void; }

/** An interface specifying a dictionary of {@link IHttpMethod} */
interface IController { [key: string]: IHttpMethod; };

/** An interface specifying a function which handles socket messages */
interface ISocketController { (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void; }

/**
 * A {@link Handler} handles every API call efter they have been identified
 */
export class Handler {

    /** A {@link DataContainer} for the {@link Handler} to acces the shared data on the server */
    data: DataContainer;

    constructor(data: DataContainer) {
        this.data = data;
    }

    /** A dictionary of {@link IController} */
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
                            this.data.setWarehouse(warehouse);
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

    /** A dictionary of {@link ISocketController} */
    socketControllers: { [key: string]: ISocketController; } = {
        // /forklifts/{guid}/intiate
        forklifts: (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void => {
            let id = passId(parsedUrl[2]) ? parsedUrl[2] : null;
            if (id !== null && parsedUrl[3] === "initiate") {
                socketServer.handleUpgrade(request, socket, head, (ws: ws) => {
                    let webSocket = new WebSocket(ws);
                    let forklift = new Forklift(id, webSocket);
                    this.data.addForklift(forklift);
                    webSocket.accept();
                });
            } else {
                // 404
                socket.destroy();
            }
        },
        // /subscribe
        subscribe: (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void => {
            socketServer.handleUpgrade(request, socket, head, (ws: ws) => {
                let webSocket = new WebSocket(ws);
                webSocket.accept();

                let self = this;
                function subscribeSocketToDataContainer<T>(dataEvent: DataContainerEvents, sendData: (obj: T) => any) {
                    self.data.on(dataEvent, sendData);
                    webSocket.on("close", () => { self.data.removeListener(dataEvent, sendData); });
                }

                subscribeSocketToDataContainer(DataContainer.events.setWarehouse, webSocket.sendWarehouse);
                if (this.data.warehouse !== null) webSocket.sendWarehouse(this.data.warehouse);

                subscribeSocketToDataContainer(DataContainer.events.forkliftUpdated, webSocket.sendForkliftInfo);
                webSocket.sendForkliftInfos(this.data.forklifts);

                subscribeSocketToDataContainer(DataContainer.events.lockRoute, webSocket.sendRoute);
                webSocket.sendRoutes(this.data.routes);

                subscribeSocketToDataContainer(DataContainer.events.addOrder, webSocket.sendOrder);
                webSocket.sendOrders(this.data.orders);
            });
        }
    };
};

