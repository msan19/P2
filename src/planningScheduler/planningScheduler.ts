// planningScheduler.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { DataContainer } from "./classes/dataContainer";
import { WebServerPlanningScheduler } from "./classes/WebServer";
import { RouteScheduler } from "./routeScheduler";
import { ScheduleItem } from "./classes/graph";

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
    updater: NodeJS.Immediate;
    timesUpdatedInTheLast10Seconds: number = 0;

    /**
     * Constructor for object.
     * Initializes the server and starts the event loop using this.update() 
     * @param port The port number associated with the server
     * @param hostname The host name associated with the server
     */
    constructor(hostname: string, port: number) {
        this.data = new DataContainer();


        this.data.on(DataContainer.events.forkliftInitiated, (forklift) => {
            let acceptableDistance = 0.5;
            for (let vertex in this.data.warehouse.graph.vertices) {
                if (forklift.position !== undefined && this.data.warehouse.graph.vertices[vertex].position.subtract(forklift.position).getLength() < acceptableDistance) {
                    this.data.warehouse.graph.idlePositions[forklift.id] =
                        new ScheduleItem(forklift.id, (new Date()).getTime(), this.data.warehouse.graph.vertices[vertex].id);
                    this.data.warehouse.graph.vertices[vertex].insertScheduleItem(this.data.warehouse.graph.idlePositions[forklift.id]);
                    return;
                }
            }
        });


        this.routeScheduler = new RouteScheduler(this.data);
        this.server = new WebServerPlanningScheduler(this.data, hostname, port);
        this.server.run();
        this.data.on(DataContainer.events.addOrder, (order) => { this.update(); });
        setInterval(() => {
            console.log(`Updated ${this.timesUpdatedInTheLast10Seconds} times within the last 10 seconds`);
            this.timesUpdatedInTheLast10Seconds = 0;
        }, 10000);
    }


    update() {
        // Check if data.warehouse.graph is non-empty and data.orders is non-empty (length greater than 0)
        if (this.data !== null && this.data.warehouse !== null && this.data.warehouse.graph !== null && Object.keys(this.data.orders).length > 0) {
            // Get route(s)
            let currentTime = (new Date()).getTime(); // 1588233898230
            let timeOffset = 1000;
            let timeToPush = 10000;
            let delayedSinceLastSucces = 0;
            let flushThreshhold = 100;
            let consecutiveFailedOrders = 0;
            let consecutiveFailedOrdersThreshold = 5;

            for (let orderId in this.data.orders) {
                if (this.routeScheduler.unfinishedOrderIds.indexOf(orderId) !== -1) {
                    let indexOfOrderId = this.routeScheduler.bestRouteSet !== null
                        ? this.routeScheduler.bestRouteSet.priorities.indexOf(orderId)
                        : -1;
                    if (indexOfOrderId !== -1 && this.routeScheduler.bestRouteSet.duration[indexOfOrderId] < Infinity) {
                        if (currentTime + timeOffset > this.routeScheduler.getStartTime(orderId)) {
                            console.log(`Timesteps: ${Math.floor(this.routeScheduler.bestRouteSet.duration[indexOfOrderId] / ((1000 * 3) / (this.data.warehouse.maxForkliftSpeed)))}`);
                            this.data.lockRoute(this.routeScheduler.handleLockOrder(orderId));
                            delayedSinceLastSucces = 0;
                            consecutiveFailedOrders = 0;
                        }
                    } else if (this.data.orders[orderId].time < currentTime + timeOffset && indexOfOrderId !== -1) {
                        let tempOrder = this.data.orders[orderId];
                        delayedSinceLastSucces++;
                        if (delayedSinceLastSucces > flushThreshhold) {
                            this.data.failAllOrders();
                            delayedSinceLastSucces = 0;
                        } else if (!tempOrder.delayStartTime(timeToPush)) {
                            // delayCounter is 0. Order must be deleted
                            if (consecutiveFailedOrders > consecutiveFailedOrdersThreshold) {
                                this.data.failOrders(this.routeScheduler.bestRouteSet.priorities.filter((priority, index) => {
                                    return this.routeScheduler.bestRouteSet.duration[index] !== Infinity;
                                }), this.routeScheduler);
                            } else {
                                consecutiveFailedOrders++;
                                this.data.failOrder(tempOrder, this.routeScheduler);
                                // Throw error to client, order dumped
                            }
                        }

                    }
                } else {
                    // Handle forklift feedback for orders. If positive, remove
                }
            }

            // Update routeScheduler
            this.routeScheduler.update();
            this.timesUpdatedInTheLast10Seconds++;
        }

        // Appends itself to the event loop, but it does not block other events
        let self = this;
        let updater = setImmediate(() => {
            if (updater !== this.updater) return;
            if (this.routeScheduler.unfinishedOrderIds.length === 0) {
                console.log("No unlocked routes - Suspending");
                return;
            }
            self.update();
        });
        this.updater = updater;
    }
}
