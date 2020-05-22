// dataContainer.ts
/**
 * {@link DataContainer} is initialized in {@link PlanningScheduler} and 
 * is used in {@link WebServerPlanningScheduler}
 * @packageDocumentation
 * @category PlanningScheduler
 */

import * as events from "events";
import { Forklift } from "./forklift";
import { Warehouse } from "./warehouse";
import { Order } from "./order";
import { Route } from "../../shared/route";

/**
 * Enumeration type used for events regarding DataContainer.
 * Each enum is equivalent to the name as a string
 */
export enum DataContainerEvents {
    addOrder = "addOrder",
    addForklift = "addForklift",
    setWarehouse = "setWarehouse",
    lockRoute = "lockRoute",
    forkliftInitiated = "forkliftInitiated",
    forkliftUpdated = "forkliftUpdated"
}

export class DataContainer extends events.EventEmitter {
    static events = DataContainerEvents;

    /** Is a dictionary containing {@link Forklift} objects */
    forklifts: { [key: string]: Forklift; } = {};

    /** Is a dictionary containing {@link Order} objects */
    orders: { [key: string]: Order; } = {};

    /** Is an array of all new {@link Order}s added */
    newOrders: string[] = [];

    /** Is a dictionary containing {@link Route} objects */
    routes: { [key: string]: Route; } = {};

    /** Is a model of the warehouse */
    warehouse: Warehouse = null;

    /** Extends {@link EventEmitter} */
    constructor() {
        super();
    }

    /**
     * Adds an {@link Order} object to this.orders.
     * Is used in {@link PlanningScheduler.server.handler.controllers.orders.POST}
     * @param order An {@link Order}
     */
    addOrder(order: Order): boolean {
        if (Object.keys(this.orders).includes(order.id)) return false;
        this.orders[order.id] = order;
        this.newOrders.push(order.id);
        this.emit(DataContainer.events.addOrder, order);
        return true;
    }

    /**
     * Adds a {@link Forklift} to list of forklifts.
     * Adds event-handling to the added forklift.
     * Emits the forklift data to all that subscribes
     * @param forklift The forklift to be added
     */
    addForklift(forklift: Forklift): void {
        this.forklifts[forklift.id] = forklift;
        forklift.on(Forklift.Events.initiated, (forklift) => {
            this.emit(DataContainer.events.forkliftInitiated, forklift);
        });
        forklift.on(Forklift.Events.updated, (forklift) => {
            this.emit(DataContainer.events.forkliftUpdated, forklift);
        });
        this.emit(DataContainer.events.addForklift, forklift);
    }

    /**
     * Sets this.warehouse to warehouse.
     * Is used in {@link Handler.controllers.warehouse.POST}. 
     * The warehouse is sent as a POST request from {@link blackBox/run} 
     * to {@link PlanningScheduler.server}. 
     * In {@link PlanningScheduler.server.handler.controllers.warehouse.POST} 
     * the warehouse is parsed and passed as a parameter to this method.
     * @param warehouse Is a parsed graph
     */
    setWarehouse(warehouse: Warehouse) {
        this.warehouse = warehouse;
        this.emit(DataContainer.events.setWarehouse, warehouse);
    }

    /**
     * Sends {@link Route} to all that subscribes, 
     * when the route is being locked from 
     * {@link PlanningScheduler}
     * @param route The route being locked
     */
    lockRoute(route: Route) {
        this.emit(DataContainer.events.lockRoute, route);
    }

    /**
     * Removes an {@link Order} from list of orders
     * on {@link DataContainer}
     * @param order The order being deleted
     */
    removeOrderFromOrders(order: Order) {
        delete this.orders[order.id];
    }
}