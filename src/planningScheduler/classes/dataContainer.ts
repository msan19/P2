// dataContainer.ts
/**
 * {@link DataContainer} is initialized in {@link PlanningScheduler} and 
 * is used in {@link WebServerPlanningScheduler}
 * @packageDocumentation
 * @category PlanningScheduler
 */

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

    /** Is a dictionary containing {@link Forklift} objects */
    forklifts: { [key: string]: Forklift; };

    /** Is a dictionary containing {@link Order} objects */
    orders: { [key: string]: Order; };

    /** Is a dictionary containing {@link Route} objects */
    routes: { [key: string]: Route; };

    /** Is a model of the warehouse */
    warehouse: Warehouse;

    constructor() {
        super();
        this.forklifts = {};
        this.orders = {};
        this.routes = {};
        this.warehouse = null;
    }

    /**
     * Adds an {@link Order} object to this.orders.
     * Is used in {@link PlanningScheduler.server.handler.controllers.orders.POST}
     * 
     * @param order An order 
     */
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

    /**
     * Sets this.warehouse to warehouse.
     * Is used in {@link Handler.controllers.warehouse.POST}. 
     * 
     * The warehouse is sent as a POST request from {@link bĺackBox/run} 
     * to {@link PlanningScheduler.server}. 
     * In {@link PlanningScheduler.server.handler.controllers.warehouse.POST} 
     * the warehouse is parsed and passed as a parameter to this method.
     * 
     * @param warehouse Is a parsed graph
     */
    setWarehouse(warehouse: Warehouse) {
        this.warehouse = warehouse;
        this.emit(DataContainer.events.setWarehouse, warehouse);
    }

    lockRoute(route: Route) {
        this.emit(DataContainer.events.lockRoute, route);
    }

}