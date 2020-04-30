// planningScheduler.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { DataContainer } from "./classes/dataContainer";
import { WebServerPlanningScheduler } from "./classes/WebServer";
import { RouteScheduler } from "./routeScheduler";

/**
 * Object to handle event loop of main server.
 * Object where main server is run from.
 */
export class PlanningScheduler {
    /** Server object to run the server from */
    server: WebServerPlanningScheduler;
    /** Object to store data regarding warehouse, forklifts and orders */
    data: DataContainer;
    /**  */
    routeScheduler: RouteScheduler;

    /**
     * Constructor for object.
     * Initializes the server and starts the event loop using this.update() 
     * @param port The port number associated with the server
     * @param hostname The host name associated with the server
     */
    constructor(port: number, hostname: string) {
        this.data = new DataContainer();
        this.routeScheduler = new RouteScheduler(this.data);
        this.server = new WebServerPlanningScheduler(this.data, hostname, port);
        this.server.run();
        this.update();
    }


    update() {
        // Check if data.warehouse.graph is non-empty and data.orders is non-empty (length greater than 0)
        if (this.data.warehouse.graph !== null && Object.keys(this.data.orders).length > 0) {
            // Get route(s)
            let currentTime = (new Date()).getTime(); // 1588233898230
            let timeOffset = 10000;

            for (let orderId in this.data.orders) {
                if (this.routeScheduler.bestRouteSet !== null) {
                    if (this.routeScheduler.bestRouteSet.priorities.indexOf(orderId) !== -1) {
                        if (this.routeScheduler.getStartTime(orderId) < currentTime + timeOffset) {
                            this.data.lockRoute(this.routeScheduler.getRoute(orderId));
                        }
                    }
                } else if (this.data.orders[orderId].time < currentTime + timeOffset) {
                    // Throw error: order could not be planned in time
                }

            }


            // Update routeScheduler
            this.routeScheduler.update();
        }

        // Appends itself to the event loop, but it does not block other events
        let self = this;
        setImmediate(function () {
            self.update();
        });
    }
}
