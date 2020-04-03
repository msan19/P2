import { DataContainer } from "./classes/dataContainer";
import { WebServerPlanningScheduler } from "./classes/WebServerPlanningScheduler";
import { Graph, Vertex } from "./classes/graph";
import { Vector2 } from "./classes/vector2";
import * as fs from "fs";

const hostname = '127.0.0.1';
const port = 3000;

class Main {
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


let main = new Main(port, hostname);