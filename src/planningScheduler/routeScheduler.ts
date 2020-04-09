import { DataContainer } from "./classes/dataContainer";
import { Route, RouteSet } from "../shared/route";
import { Order } from "../shared/order";


export class RouteScheduler {
    data: DataContainer;
    routeSets: RouteSet[];
    bestRouteSet: RouteSet;

    constructor(data: DataContainer) {
        this.data = data;
        this.routeSets = [];
        this.bestRouteSet = null;
    }

    getRoute(orderId: string): Route {
        // TO DO
        return null;
    }

    calculateRoutes(data: DataContainer): RouteSet[] {
        // TO DO
        return null;
    }

    getBestRouteSet(routeSets: RouteSet[]): RouteSet {
        // TO DO
        return null;
    }

    getLastPos(forkliftId: string, routeSet: RouteSet): string {
        //TODO
        return null;
    }

    assignForkliftToOrder(order: Order): string {
        // TODO 
        return null;
    }

    getOptimalRoute(forkliftId: string, routeSets: RouteSet, order: Order): void {
        // TODO
    };

    getStartTime(orderId: string): number {
        // TO DO 
        return null;
    }

    addRouteToGraph(route: Route): void {
        // TO DO 
    };

    update(data: DataContainer): void {
        // TO DO 
    }

}