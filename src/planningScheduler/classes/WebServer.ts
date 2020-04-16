// WebServer.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { WebServer } from "../../shared/webServer";
import { Handler } from "./handler";
import { DataContainer } from "./dataContainer";

export class WebServerPlanningScheduler extends WebServer {
    handler: Handler;
    data: DataContainer;

    constructor(data: DataContainer, hostname: string, port: number) {
        super(hostname, port);
        this.handler = new Handler(data);
        this.data = data;

        this.createServer(this.handler.controllers, this.handler.socketControllers);
    }
}
