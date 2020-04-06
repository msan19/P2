import { Forklift } from "./forklift";
import { DataContainer } from "./dataContainer";
import { IncomingMessage, ServerResponse, Server } from "http";
import { Warehouse } from "./warehouse";
import { Graph } from "./graph";
import { Order } from "./order";


function getEntireString(request: IncomingMessage): Promise<string> {
    return new Promise((resolve: (dataString: string) => void, reject: (reason: string) => void) => {
        let body = "";
        request.on("data", (data: Buffer) => {
            body += data;
        });
        request.on("end", () => {
            resolve(body);
        });
    });
}

function getJson(request: IncomingMessage): Promise<object> {
    return getEntireString(request)
        .then((str: string) => {
            return new Promise((resolve: (value: object) => void, reject: () => void) => {
                let data;
                try {
                    data = JSON.parse(str);
                } catch {
                    reject();
                }
                if (typeof (data) === "object") {
                    resolve(data);
                }
            });
        });
}

function hasId(element): boolean {
    return typeof (element) === "string" && element.length > 0;
}

function returnStatus(response: ServerResponse, status: number, message: string) {
    response.writeHead(status, message);
    response.write(message);
    response.end();
}
function returnNotFound(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 404, `Url: '${request.url}' not found`);
}
function returnNotImplemented(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 500, `Url: '${request.url}' not implemented`);
}
function returnJson(response: ServerResponse, obj: any) {
    response.writeHead(200);
    response.write(JSON.stringify(obj));
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
                            returnStatus(response, 200, "Success");
                        } else {
                            if (Graph.parse(obj["graph"]) === null) {
                                returnStatus(response, 401, "Invalid Graph");
                            } else {
                                returnStatus(response, 400, "Invalid Warehouse");
                            }
                        }
                    })
                    .catch(() => {
                        returnStatus(response, 402, "Invalid JSON");
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
                            returnStatus(response, 200, "Success");
                        } else {
                            returnStatus(response, 400, "Invalid Order");
                        }
                    }).catch(() => {
                        returnStatus(response, 402, "Invalid JSON");
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
                        returnStatus(response, 400, "Forklift not found");
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
                            returnStatus(response, 200, "Success");
                        }).catch(() => {
                            returnStatus(response, 402, "Invalid JSON");
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
                                returnStatus(response, 200, "Success");
                            } else {
                                if (this.data.forklifts[forklift.id] === null) {
                                    returnStatus(response, 400, "Invalid forklift");
                                } else {
                                    returnStatus(response, 401, "Forklift already initiated");
                                }
                            }
                        }).catch(() => {
                            returnStatus(response, 402, "Invalid JSON");
                        });
                } else {
                    returnNotFound(request, response);
                }
            }
        }
    };
};

