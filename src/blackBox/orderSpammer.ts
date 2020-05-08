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


export class OrderSpammer {
    private socket: WebSocket;
    private apiCaller: ApiCaller;

    firstTimeOrderCreated: number;
    ordersSentCount: number = 0;
    totalNumberOfTestOrders: number = 10;
    warehouse: Warehouse = null;
    forkliftIds: { [key: string]: string; };
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
            this.forkliftIds = {};
            for (let key in forklifts) {
                this.forkliftIds[forklifts[key].id] = forklifts[key].id;
            }
        });
        this.socket.on(WebSocket.packageTypes.forkliftInfo, (forklift: ForkliftInfo) => {
            this.forkliftIds[forklift.id] = forklift.id;
        });
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
            this.apiCaller.sendOrder(this.createTestingOrder());
        }

        setTimeout(() => { this.iterate(); }, this.interval());
    }

    createRandomOrder() {
        let order = new Order(
            `${this.ordersSentCount}`,
            randomValue([Order.types.moveForklift]),
            randomValue(this.forkliftIds),
            `pallet-${this.ordersSentCount}`,
            randomValue(this.warehouse.graph.vertices).id,
            randomValue(this.warehouse.graph.vertices).id,
            (new Date()).getTime() + randomIntegerInRange(20000, 21000),
            Order.timeTypes.start,
            3);
        this.ordersSentCount++;
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