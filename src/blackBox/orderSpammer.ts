/**
 * @packageDocumentation
 * @category BlackBox
 */

import * as ws from "ws";
import { WebSocket } from "./../shared/webSocket";
import { ApiCaller } from "./../shared/apiCaller";
import { Order } from "../shared/order";
import { Warehouse } from "../shared/warehouse";
import { randomValue, randomIntegerInRange } from "../shared/utilities";
import { ForkliftInfo } from "../shared/forkliftInfo";
import { OrderTester } from "./ordersTest";
import { Route } from "../shared/route";


export class OrderSpammer {
    private socket: WebSocket;
    private apiCaller: ApiCaller;

    unfinishedOrders: { [key: string]: Order; } = {};
    lockedRoutes: { [key: string]: Route; } = {};
    firstTimeOrderCreated: number;
    ordersSentCount: number = 0;
    totalNumberOfTestOrders: number = 10;
    warehouse: Warehouse = null;
    forklifts: { [key: string]: ForkliftInfo; } = {};
    interval: () => number;

    /**
     * 
     * @param apiPath Base-path for the API e.g. "http://localhost:3000"
     * @param subscribePath Path for websockets to subscribe to changes e.g. "http://localhost:3000/subscribe"
     * @param interval A function that'll be called between each random order, to say how many miliseconds to wait before sending the next
     */
    constructor(apiPath: string, subscribePath: string, interval: () => number) {
        this.apiCaller = new ApiCaller(apiPath);
        this.socket = new WebSocket(new ws(subscribePath));
        this.socket.on(WebSocket.packageTypes.warehouse, (warehouse) => { this.warehouse = warehouse; });
        this.interval = interval;
        this.iterate();
        this.firstTimeOrderCreated = (new Date()).getTime();

        this.socket.on(WebSocket.packageTypes.forkliftInfos, (forklifts: ForkliftInfo[]) => {
            for (let key in forklifts) {
                this.forklifts[forklifts[key].id] = forklifts[key];
            }
        });
        this.socket.on(WebSocket.packageTypes.forkliftInfo, (forklift: ForkliftInfo) => {
            this.forklifts[forklift.id] = forklift;
        });
        this.socket.on(WebSocket.packageTypes.order, (order: Order) => {
            this.saveOrder(order);
        });
        this.socket.on(WebSocket.packageTypes.orders, (orders: Order[]) => {
            for (let orderId in orders) this.saveOrder(orders[orderId]);
        });
        this.socket.on(WebSocket.packageTypes.route, (route: Route) => {
            this.receivedRoute(route);
        });
        this.socket.on(WebSocket.packageTypes.routes, (routes: Route[]) => {
            for (let routeId in routes) this.receivedRoute(routes[routeId]);
        });
        this.socket.on(WebSocket.packageTypes.warehouse, (warehouse: Warehouse) => {

            this.warehouse = Warehouse.parse(warehouse);
        });
    }

    private saveOrder(order: Order) {
        if (this.lockedRoutes[order.id]) {
            return false;
        } else {
            this.unfinishedOrders[order.id] = order;
            return true;
        }
    }
    private sendOrder(order: Order) {
        if (this.saveOrder(order)) this.apiCaller.sendOrder(order);
    }
    private receivedRoute(route: Route) {
        if (this.unfinishedOrders[route.orderId]) {
            delete this.unfinishedOrders[route.orderId];
            this.unfinishedOrders[route.orderId] = undefined;
            delete this.unfinishedOrders[route.orderId];
        }
        this.lockedRoutes[route.orderId] = route;
    }

    private iterate() {
        /*if (this.warehouse !== null) {
            this.apiCaller.sendOrder(this.createRandomOrder());
        }*/

        /*if (this.warehouse !== null && (this.ordersSentCount + this.ordersForF0Sent) < 8) {
            this.apiCaller.sendOrder(this.createPrePlannedOrder());
        }*/

        /*if (this.warehouse !== null && (this.ordersSentCount) < 2) {
            this.apiCaller.sendOrder(this.createAnnoyingOrder());
        }*/

        if (this.warehouse !== null && (this.ordersSentCount) < this.totalNumberOfTestOrders) {
            this.sendOrder(this.createTestingOrder());
        } else {
            if (this.warehouse) {
                let order = this.createRandomOrder();
                if (order) this.sendOrder(order);
            }
        }

        setTimeout(() => { this.iterate(); }, this.interval());
    }

    //#region getAvailableForklifts
    private isForkliftOccupied(forkliftId: string, time: number) {
        for (let i in this.unfinishedOrders) {
            let order = this.unfinishedOrders[i];
            if (order.forkliftId && order.forkliftId === forkliftId) {
                return true;
            }
        }
        for (let i in this.lockedRoutes) {
            let route = this.lockedRoutes[i];
            if (route.forkliftId && route.forkliftId === forkliftId) { // If same forklift
                let instructions = route.instructions;
                if ((instructions[0].startTime < time) && (instructions[instructions.length - 1].startTime > time)) {
                    // If time is within timespan of route
                    return true;
                }
            }
        }
        return false;
    }
    private getAvailableForkliftIds(time: number) {
        let output = [];
        for (let id in this.forklifts) {
            if (!this.isForkliftOccupied(id, time)) {
                output.push(id);
            }
        }
        return output;
    }
    //#endregion

    //#region getAvailableVertices 
    private isVertexOccupied(vertexId: string, time: number) {
        for (let i in this.unfinishedOrders) {
            let order = this.unfinishedOrders[i];
            if (order.endVertexId && order.endVertexId === vertexId) {
                return true;
            }
        }

        for (let i in this.lockedRoutes) {
            let route = this.lockedRoutes[i];
            let lastInstruction = route.instructions[route.instructions.length - 1];

            if ((lastInstruction.vertexId === vertexId) && lastInstruction.startTime > time) {
                // If same endVertex
                return true;
            }
        }

        for (let i in this.forklifts) {
            if (this.warehouse.graph.vertices[vertexId].position.getDistanceTo(this.forklifts[i].position) < 1)
                return true;
        }

        return false;
    }
    private getAvailableVertexIds(time: number) {
        let output = [];
        for (let id in this.warehouse.graph.vertices) {
            if (!this.isVertexOccupied(id, time)) {
                output.push(id);
            }
        }
        return output;
    }
    //#endregion

    createRandomOrder() {
        let type = randomValue(Order.types);
        let now = (new Date()).getTime();
        let startTime = now + randomIntegerInRange(20000, 30000);
        let availableForkliftIds = this.getAvailableForkliftIds(startTime);
        let availableVertexIds = this.getAvailableVertexIds(startTime);

        if (availableForkliftIds.length < 1) return;
        if (availableVertexIds.length < 2) return;

        this.ordersSentCount++;

        let order: Order;
        switch (type) {
            case Order.types.charge:
                order = new Order(
                    `O${this.ordersSentCount}`,
                    type,
                    randomValue(availableForkliftIds),
                    undefined,
                    undefined,
                    randomValue(availableVertexIds),
                    startTime,
                    Order.timeTypes.start,
                    3);
                break;
            case Order.types.moveForklift:
                order = new Order(
                    `O${this.ordersSentCount}`,
                    type,
                    randomValue(availableForkliftIds),
                    undefined,
                    undefined,
                    randomValue(availableVertexIds),
                    startTime,
                    Order.timeTypes.start,
                    3);
                break;
            case Order.types.movePallet:
                order = new Order(
                    `O${this.ordersSentCount}`,
                    type,
                    undefined,
                    `P${this.ordersSentCount}`,
                    randomValue(availableVertexIds),
                    randomValue(availableVertexIds),
                    startTime,
                    Order.timeTypes.start,
                    3);
                break;
        }
        return order;
    }

    // Should be deleted when program works (semi)
    createAnnoyingOrder() {
        let time = 40000;

        let list = [
            new Order(
                `0`,
                Order.types.movePallet,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                `N8-8`,
                `N1-1`,
                this.firstTimeOrderCreated + time,
                Order.timeTypes.start,
                0
            )
        ];

        return list[this.ordersSentCount++];
    }

    createTestingOrder(): Order {
        let delayStartTime: number = 40000;
        let timeOffset: number = 40000;
        let orderTester = new OrderTester(this.firstTimeOrderCreated + delayStartTime, timeOffset);
        let orderToSend = orderTester.generateOrder(this.ordersSentCount % 10, Math.floor(this.ordersSentCount / 10));

        this.ordersSentCount++;
        return orderToSend;
    }
}