import { DataContainer } from "./classes/dataContainer";
import { Route, RouteSet } from "./classes/route";
import { Order } from "./classes/order";


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

    findBestRouteSet(routeSets: RouteSet[]): RouteSet {
        // TO DO
        return null;
    }

    getStartTime(orderId: string): number {
        // TO DO 
        return null;
    }

    addRouteToGraph(route: Route): void {
        // TO DO 
    }

    update(data: DataContainer): void {
        // TO DO 
    }

}