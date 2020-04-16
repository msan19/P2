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

let warehouse = new Warehouse(createGraph(), 20);
let graph = JSON.stringify(warehouse, null, 4);
//fs.writeFileSync("./src/blackBox/graph.json", graph);

let api = new ApiCaller("localhost", 3000);

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
}, 2000);