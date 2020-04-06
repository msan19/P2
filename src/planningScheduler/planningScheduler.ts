import { DataContainer } from "./classes/dataContainer";
import { WebServerPlanningScheduler } from "./classes/WebServer";

export class PlanningScheduler {
    server: WebServerPlanningScheduler;
    data: DataContainer;

    constructor(port: number, hostname: string) {
        this.data = new DataContainer();
        this.server = new WebServerPlanningScheduler(this.data, hostname, port);
        this.server.run();
        this.update();
    }

    update() {
        let self = this;
        setImmediate(function () {
            self.update();
        });
    }
}
