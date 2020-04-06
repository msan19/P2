import { Forklift } from "./forklift";
import { Warehouse } from "./warehouse";
import { Order } from "./order";
import { Route } from "./route";

export class DataContainer {

    forklifts: Forklift[];
    orders: { [key: string]: Order; };
    routes: Route[];
    warehouse: Warehouse;

    constructor() {
        this.forklifts = [];
        this.orders = {};
        this.routes = [];
        this.warehouse = null;
    }

    addOrder(order: Order): boolean {
        if (Object.keys(this.orders).includes(order.orderId)) return false;
        this.orders[order.orderId] = order;
        return true;
    }
    ///TODO: Add to diagrams
    addForklift(forklift: Forklift): void {
        this.forklifts[forklift.id] = forklift;
    }

}