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

const SERVER_HOSTNAME = 'localhost';
const SERVER_PORT = 3000;

let warehouse = new Warehouse(createGraph(), 4.17);

let api = new ApiCaller(`http://${SERVER_HOSTNAME}:${SERVER_PORT}`);

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

    setTimeout(() => {
        new OrderSpammer("http://localhost:3000", "http://localhost:3000/subscribe", () => { return randomIntegerInRange(100, 500); });
    }, 1000);
}, 2000);