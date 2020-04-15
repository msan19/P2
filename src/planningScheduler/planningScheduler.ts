import { DataContainer } from "./classes/dataContainer";
import { WebServerPlanningScheduler } from "./classes/WebServer";

/**
 * Object to handle event loop of main server.
 * Object where main server is run from.
 */
export class PlanningScheduler {
    /** Server object to run the server from */
    server: WebServerPlanningScheduler;
    /** Object to store data regarding warehouse, forklifts and orders */
    data: DataContainer;

    /**
     * Constructor for object.
     * Initializes the server and starts the event loop using this.update() 
     * @param port The port number associated with the server
     * @param hostname The host name associated with the server
     */
    constructor(port: number, hostname: string) {
        this.data = new DataContainer();
        this.server = new WebServerPlanningScheduler(this.data, hostname, port);
        this.server.run();
        this.update();
    }

    /**
     * Adds itself to the event loop, but it does not block other events.
     */
    update() {
        let self = this;
        setImmediate(function () {
            self.update();
        });
    }
}
