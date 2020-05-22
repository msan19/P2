/**
 * @packageDocumentation
 * @category BlackBox
 */

import * as ws from "ws";
import { WebSocket } from "./../shared/webSocket";
import { ApiCaller } from "./../shared/apiCaller";
import { Order, OrderTypes, TimeType } from "../shared/order";
import { randomValue, randomIntegerInRange } from "../shared/utilities";

import { Forklift as ForkliftUtilities, Vertex as VertexUtilities, VertexTypes } from "./utilities";
import { DataContainer } from "./dataContainer";
import { ForkliftInfo } from "../shared/forkliftInfo";


export class OrderSpammer {
    private socket: WebSocket;
    private apiCaller: ApiCaller;

    private dataContainer;
    private ordersSentCount: number = 0;

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
        this.dataContainer = new DataContainer(this.socket);
        this.interval = interval;

        this.apiCaller.getWarehouse().then(warehouse => {
            this.dataContainer.warehouse = warehouse;
            this.iterate();
        });

        this.socket.on(PackageTypes.forkliftInfo, forklift => this.onRecievedForklift(forklift));
        this.socket.on(PackageTypes.forkliftInfos, forklifts => {
            for (let i in forklifts) this.onRecievedForklift(forklifts[i]);
        });
    }

    private onRecievedForklift(forkliftInfo: ForkliftInfo) {
        let vertexId = VertexUtilities.estimateVertexId(this.dataContainer, forkliftInfo.position);
        if (!vertexId || VertexUtilities.getType(this.dataContainer, vertexId) !== VertexTypes.charge) {
            let order = this.createOrderToSendForkliftHome(forkliftInfo.id);
            if (!order) setTimeout(() => this.onRecievedForklift(forkliftInfo), 5000); // If failed to create order, try again in 5 seconds
            else this.sendOrder(order);
        }
    }

    private saveOrder(order: Order) {
        // Save order if it hasn't already been sent to lockedRoutes
        if (this.dataContainer.lockedRoutes[order.id]) return false;

        this.dataContainer.unfinishedOrders[order.id] = order;
        return true;
    }
    private sendOrder(order: Order) {
        if (this.saveOrder(order)) {
            this.apiCaller.sendOrder(order);
            this.ordersSentCount++;
        }
    }

    private iterate() {
        let order = this.createRandomOrderToMovePallet();
        if (order) this.sendOrder(order);

        setTimeout(() => { this.iterate(); }, this.interval());
    }

    createRandomOrderToMovePallet(): Order {
        let type = randomValue([VertexTypes.dropOff, VertexTypes.pickup]);
        let now = (new Date()).getTime();
        let startTime = now + randomIntegerInRange(20000, 30000);

        let allAvailableVertices = VertexUtilities.getAllAvailable(this.dataContainer, startTime);
        let shelf = randomValue(VertexUtilities.getAllAvailableOfType(this.dataContainer, allAvailableVertices, VertexTypes.shelf));
        let palletVertex: string;
        let endVertex: string;
        switch (type) {
            case VertexTypes.dropOff:
                palletVertex = randomValue(VertexUtilities.getAllAvailableOfType(this.dataContainer, allAvailableVertices, VertexTypes.shelf));
                endVertex = randomValue(VertexUtilities.getAllAvailableOfType(this.dataContainer, allAvailableVertices, VertexTypes.dropOff));
                break;
            case VertexTypes.pickup:
                palletVertex = randomValue(VertexUtilities.getAllAvailableOfType(this.dataContainer, allAvailableVertices, VertexTypes.pickup));
                endVertex = randomValue(VertexUtilities.getAllAvailableOfType(this.dataContainer, allAvailableVertices, VertexTypes.shelf));
                break;
            default:
                throw `Unhandled type: ${type}`;
        }

        // If no vertices were available
        if (!shelf) return;
        if (!palletVertex) return;
        if (!endVertex) return;

        let order = new Order(
            `O${this.ordersSentCount}`, // OrderId
            OrderTypes.movePallet,      // OrderType
            undefined,                  // ForkliftId
            `P${this.ordersSentCount}`, // PalletId
            palletVertex,               // PalletVertexId
            endVertex,                  // OrderEndVertexId
            startTime,
            TimeType.start,
            3                           // DelayMax
        );

        return order;
    }

    createOrderToSendForkliftHome(forkliftId: string): Order {
        let now = (new Date()).getTime();
        let startTime = now + randomIntegerInRange(20000, 30000);
        let endVertex = ForkliftUtilities.getHomeVertexId(this.dataContainer, forkliftId, startTime);

        if (!endVertex) return;

        let order = new Order(
            `O${this.ordersSentCount}`, // OrderId
            OrderTypes.moveForklift,    // OrderType
            forkliftId,                 // ForkliftId
            undefined,                  // PalletId
            undefined,                  // PalletPos
            endVertex,                  // OrderEndVertexId
            startTime,
            TimeType.start,
            3                           // DelayMax
        );
        return order;
    }


}