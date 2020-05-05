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

        if (this.warehouse !== null && this.ordersSentCount < 4) {
            this.apiCaller.sendOrder(this.createPrePlannedOrder());
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
            randomValue(this.warehouse.graph.vertices).id
        );
        order.time = (new Date()).getTime() + randomIntegerInRange(20000, 21000);
        order.timeType = Order.timeTypes.start;
        this.ordersSentCount++;
        return order;
    }

    createPrePlannedOrder() {
        let listOfPrePlannedOrders = [
            new Order(
                `0`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N4-6`
            ),
            new Order(
                `1`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N9-7`
            ),
            new Order(
                `2`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N3-2`
            ),
            new Order(
                `3`,
                Order.types.moveForklift,
                `F0`,
                `pallet-${this.ordersSentCount}`,
                randomValue(this.warehouse.graph.vertices).id,
                `N9-1`
            )
        ];

        let times = [20000, 120000, 220000, 320000];

        listOfPrePlannedOrders.forEach((order) => {
            order.time = this.firstTimeOrderCreated + times[listOfPrePlannedOrders.indexOf(order)];
            order.timeType = Order.timeTypes.start;
        });

        return listOfPrePlannedOrders[this.ordersSentCount++] || null;


    }

}