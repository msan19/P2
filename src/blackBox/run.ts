// run.ts
/**
 * @packageDocumentation
 * @category BlackBox
 */

import { createGraph } from "./warehouse";
import * as fs from "fs";
import { Warehouse } from "../shared/warehouse";
import { ApiCaller } from "../shared/apiCaller";
import { Response } from "node-fetch";
import { OrderSpammer } from "./orderSpammer";
import { randomIntegerInRange } from "../shared/utilities";

let warehouse = new Warehouse(createGraph(), 4.17);
let graph = JSON.stringify(warehouse, null, 4);
//fs.writeFileSync("./src/blackBox/graph.json", graph);

let api = new ApiCaller("http://localhost:3000");

setTimeout(() => {
    api.sendWarehouse(warehouse).then((response: Response) => {
        if (response.status === 200) {
            console.log("Warehouse set");
        } else {
            console.log(`Error(${response.status}): ${response.body}`);
        }
    }).catch(() => {
        console.log("Failed to set warehouse");
    });

    new OrderSpammer("http://localhost:3000", "http://localhost:3000/subscribe", () => { return randomIntegerInRange(5000, 10000); });
}, 2000);