import {Forklift} from "./forklift";
import {Warehouse} from "./warehouse";
import {Order} from "./order";
import {Route} from "./route";

export class DataContainer {

    forklifts: Forklift[];
    orders: Order[];
    routes: Route[];
    warehouse: Warehouse;
    
    constructor() {
        this.forklifts = [];
        this.orders = [];
        this.routes = [];
        this.warehouse = null;
    }

    addOrder(order: Order): void {
        this.orders.push(order);
    }

}