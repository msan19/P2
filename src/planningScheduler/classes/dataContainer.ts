import * as events from "events";

import { Forklift } from "./forklift";
import { Warehouse } from "../../shared/warehouse";
import { Order } from "../../shared/order";
import { Route } from "../../shared/route";


enum eventsEnum {
    addOrder = "addOrder",
    addForklift = "addForklift",
    setWarehouse = "setWarehouse",
    lockRoute = "lockRoute"
}

export class DataContainer extends events.EventEmitter {
    static events = eventsEnum;

    forklifts: { [key: string]: Forklift; };
    orders: { [key: string]: Order; };
    routes: { [key: string]: Route; };
    warehouse: Warehouse;

    constructor() {
        super();
        this.forklifts = {};
        this.orders = {};
        this.routes = {};
        this.warehouse = null;
    }

    addOrder(order: Order): boolean {
        if (Object.keys(this.orders).includes(order.id)) return false;
        this.orders[order.id] = order;
        this.emit(DataContainer.events.addOrder, order);
        return true;
    }

    ///TODO: Add to diagrams
    addForklift(forklift: Forklift): void {
        this.forklifts[forklift.id] = forklift;
        this.emit(DataContainer.events.addForklift, forklift);
    }

    setWarehouse(warehouse: Warehouse) {
        this.warehouse = warehouse;
        this.emit(DataContainer.events.setWarehouse, warehouse);
    }

    lockRoute(route: Route) {
        this.emit(DataContainer.events.lockRoute, route);
    }

}