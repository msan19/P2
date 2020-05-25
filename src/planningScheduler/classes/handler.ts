// handler.ts
/** A handler for all HTTP requests.
 * Describes how to handle all request 
 * as given in docs/API.yml
 * @packageDocumentation
 * @category PlanningScheduler
 */

import * as ws from "ws";
import { Socket } from "net";
import { IncomingMessage, ServerResponse } from "http";

import { getJson, returnJson, returnNotFound, returnStatus, parseId, returnInvalidJson, returnSuccess } from "../../shared/webUtilities";
import { WebSocket } from "../../shared/webSocket";
import { ForkliftInfo } from "../../shared/forkliftInfo";
import { Route } from "../../shared/route";

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
 * A {@link Handler} handles every API call efter they have been identified.
 * All API calls can be seen described in docs/API.yml
 */
export class Handler {

    /** A {@link DataContainer} for the {@link Handler} to access the shared data on the server */
    data: DataContainer;

    constructor(data: DataContainer) {
        this.data = data;
    }

    /** A dictionary of {@link IController} */
    controllers: { [key: string]: IController; } = {
        warehouse: {
            /**
             * HTTP Get requests to /warehouse
             * Either returns warehouse as JSON if one is set,
             * otherwise retuns a status 500             
             */
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let warehouse = this.data.warehouse;
                if (warehouse != null) {
                    returnJson(response, warehouse);
                } else {
                    returnStatus(response, 500, "Warehouse info not yet received");
                }
            },
            /**
             * HTTP Post requests to /warehouse
             * Sets warehouse of {@link DataContainer} to incoming object 
             * if object is parsed, else gives error status 400, with
             * either invalid warehouse if no graph, or invalid graph
             */
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
            /**
            * HTTP Get requests to /routes
            * Returns routes as JSON
            */
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                returnJson(response, this.data.routes);
            }
        },

        orders: {
            /**
             * HTTP Get requests to /orders
             * Checks if looking for specific order or all orders.
             * If looking for one, checks if valid order id.
             * If yes, returns order as JSOn else returns error 404
             * If looking for all orders, returns all orders as JSON
             */
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = parseId(parsedUrl[2]);
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
            /**
            * HTTP Post requests to /orders
            * Checks if order to be posted is valid.
            * If yes, adds order to {@link DataContainer}
            * Else returns error code
            */
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
            /**
             * HTTP Get requests to /forklifts and /forklifts/id
             * Checks if getting all forklifts, then return all forklifts as JSON
             * Else checks if valid forklift id.
             * If yes, send forklift as JSON, else return error code
             */
            GET: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = parseId(parsedUrl[2]);
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
            /**
            * HTTP Put requests to /forklifts/id
            * Updates data on forklift, and returns success if valid data
            * Else returns invalid data. 
            * If no forklift with id, return error code
            */
            PUT: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = parseId(parsedUrl[2]);

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
            /**
            * HTTP Put requests to /forklifts/{guid}/intiate
            * Initiates forklift with data if valid data and valid id
            * Else returns error codes
            */
            POST: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]): void => {
                let id = parseId(parsedUrl[2]);
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
        /** 
         * Setting up websockets for /forklifts/id/initiate
         * Checks if valid id and initiate.
         * If yes, creates a TCP socket to forklift
         * Else destroys socket
         */
        forklifts: (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void => {
            let id = parseId(parsedUrl[2]) ? parsedUrl[2] : null;
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
        /**
         * Handles subscribe and opens websockets
         * Sets up all different information calls
         * Like sending warehouse (using emit), will send to all 
         * websockets created from subscribe.
         */
        subscribe: (socketServer: ws.Server, request: IncomingMessage, socket: Socket, head: Buffer, parsedUrl: string[]): void => {
            socketServer.handleUpgrade(request, socket, head, (ws: ws) => {
                let webSocket = new WebSocket(ws);
                webSocket.accept();

                const subscribeSocketToDataContainer = <T>(socket: WebSocket, dataEvent: DataContainerEvents, sendData: (obj: T) => any) => {
                    this.data.on(dataEvent, sendData);
                    socket.on("close", () => { this.data.removeListener(dataEvent, sendData); });
                };

                subscribeSocketToDataContainer(webSocket, DataContainer.events.setWarehouse, (item: Warehouse) => webSocket.sendWarehouse(item));
                if (this.data.warehouse !== null) webSocket.sendWarehouse(this.data.warehouse);

                subscribeSocketToDataContainer(webSocket, DataContainer.events.forkliftUpdated, (item: ForkliftInfo) => {
                    return webSocket.sendForkliftInfo(item);
                });
                webSocket.sendForkliftInfos(this.data.forklifts);

                subscribeSocketToDataContainer(webSocket, DataContainer.events.lockRoute, (item: Route) => webSocket.sendRoute(item));
                webSocket.sendRoutes(this.data.routes);

                subscribeSocketToDataContainer(webSocket, DataContainer.events.addOrder, (item: Order) => webSocket.sendOrder(item));
                subscribeSocketToDataContainer(webSocket, DataContainer.events.failedOrder, (item: string) => webSocket.sendOrderFailed(item));
                subscribeSocketToDataContainer(webSocket, DataContainer.events.failedOrders, (items: string[]) => webSocket.sendOrdersFailed(items));
                webSocket.sendOrders(this.data.orders);

            });
        }
    };
};

