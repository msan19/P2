// WebServer.ts
/**
 * Used in {@link PlanningScheduler} to create a webserver,
 * using specific handler from {@link Handler}
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { WebServer } from "../../shared/webServer";
import { Handler } from "./handler";
import { DataContainer } from "./dataContainer";

export class WebServerPlanningScheduler extends WebServer {
    /** Is a {@link Handler} object used to handle server events */
    handler: Handler;

    /** Is a {@link DataContainer} object used to store information */
    data: DataContainer;

    constructor(data: DataContainer, hostname: string, port: number) {
        super(hostname, port);
        this.handler = new Handler(data);
        this.data = data;

        // Creates a server using the extended WebServer function
        this.createServer(this.handler.controllers, this.handler.socketControllers);
    }
}
