// run.ts
/**
 * @packageDocumentation
 * @category BlackBox
 */

import { createGraph, GraphTypes } from "./warehouse";
import { Warehouse } from "../shared/warehouse";
import { ApiCaller } from "../shared/apiCaller";
import { Response } from "node-fetch";
import { OrderSpammer } from "./orderSpammer";
import { randomIntegerInRange } from "../shared/utilities";

const SERVER_HOSTNAME = process.argv[2];
const SERVER_PORT = Number(process.argv[3]);

let warehouse = new Warehouse(createGraph(GraphTypes.transit), 4.17);

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

    // setTimeout(() => {
    //     new OrderSpammer("http://localhost:3000", "http://localhost:3000/subscribe", () => { return randomIntegerInRange(2000, 2000); });
    // }, 2000);
}, 2000);