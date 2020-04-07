import { Forklift } from "./forklift";
import { Warehouse } from "../../shared/warehouse";
import { Order } from "../../shared/order";
import { Route } from "../../shared/route";

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
        if (Object.keys(this.orders).includes(order.id)) return false;
        this.orders[order.id] = order;
        return true;
    }
    ///TODO: Add to diagrams
    addForklift(forklift: Forklift): void {
        this.forklifts[forklift.id] = forklift;
    }

}