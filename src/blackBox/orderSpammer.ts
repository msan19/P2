import * as ws from "ws";
import { WebSocket } from "./../shared/webSocket";
import { ApiCaller } from "./../shared/apiCaller";
import { Order } from "../shared/order";
import { Warehouse } from "../shared/warehouse";
import { randomValue, randomIntegerInRange } from "../shared/utilities";
import { ForkliftInfo } from "../shared/forkliftInfo";


export class OrderSpammer {
    private socket: WebSocket;
    private apiCaller: ApiCaller;

    firstTimeOrderCreated: number;
    ordersSentCount: number = 0;
    ordersForF0Sent: number = 0;
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

        if (this.warehouse !== null && (this.ordersSentCount) < 2) {
            this.apiCaller.sendOrder(this.createAnnoyingOrder());
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
        let time = 20000;

        let list = [
            new Order(
                `0`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N9-2`,
                this.firstTimeOrderCreated + time,
                Order.timeTypes.start,
                0
            ),
            new Order(
                `1`,
                Order.types.moveForklift,
                `F9`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N9-3`,
                this.firstTimeOrderCreated + time,
                Order.timeTypes.start,
                0
            )
        ];

        return list[this.ordersSentCount++];
    }

    createPrePlannedOrder() {
        let times = [20000, 80000, 140000, 200000];
        let debounce = 0;

        let listOfPrePlannedOrdersForF0 = [
            new Order(
                `0`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N4-6`,
                this.firstTimeOrderCreated + times[0],
                Order.timeTypes.start,
                debounce
            ),
            new Order(
                `1`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N4-2`,
                this.firstTimeOrderCreated + times[1],
                Order.timeTypes.start,
                debounce
            ),
            new Order(
                `2`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N3-2`,
                this.firstTimeOrderCreated + times[2],
                Order.timeTypes.start,
                debounce
            ),
            new Order(
                `3`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N9-1`,
                this.firstTimeOrderCreated + times[3],
                Order.timeTypes.start,
                debounce
            )
        ];

        let listOfPrePlannedOrdersForF1 = [
            new Order(
                `4`,
                Order.types.moveForklift,
                `F1`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N4-0`,
                this.firstTimeOrderCreated + times[0],
                Order.timeTypes.start,
                debounce
            ),
            new Order(
                `5`,
                Order.types.moveForklift,
                `F1`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N4-9`,
                this.firstTimeOrderCreated + times[1],
                Order.timeTypes.start,
                debounce
            ),
            new Order(
                `6`,
                Order.types.moveForklift,
                `F1`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N3-3`,
                this.firstTimeOrderCreated + times[2],
                Order.timeTypes.start,
                debounce
            ),
            new Order(
                `7`,
                Order.types.moveForklift,
                `F1`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N9-2`,
                this.firstTimeOrderCreated + times[3],
                Order.timeTypes.start,
                debounce
            )
        ];


        listOfPrePlannedOrdersForF0.forEach((order) => {
            order.time = this.firstTimeOrderCreated + times[listOfPrePlannedOrdersForF0.indexOf(order)];
            order.timeType = Order.timeTypes.start;
        });
        listOfPrePlannedOrdersForF1.forEach((order) => {
            order.time = this.firstTimeOrderCreated + times[listOfPrePlannedOrdersForF1.indexOf(order)];
            order.timeType = Order.timeTypes.start;
        });

        return (this.ordersSentCount + this.ordersForF0Sent) % 2 === 1 ? listOfPrePlannedOrdersForF1[this.ordersSentCount++] : listOfPrePlannedOrdersForF0[this.ordersForF0Sent++];
    }
}