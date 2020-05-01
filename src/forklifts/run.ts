// run.ts
/**
 * This is the doc comment for run.ts
 * @packageDocumentation
 * @category Forklifts
 */

import { Forklift } from "./forklift";
import { randomIntegerInRange, randomValue } from "../shared/utilities";
import { ApiCaller } from "../shared/apiCaller";
import { Warehouse } from "../shared/warehouse";

const SERVER_HOSTNAME = '127.0.0.1';
const SERVER_PORT = 3000;

var forklifts = [];

let apiCaller = new ApiCaller("http://localhost:3000");
function getWarehouse() {
    return new Promise((resolve) => {
        apiCaller.getWarehouse().then((warehouse) => {
            if (warehouse !== null) {
                console.log("Warehouse received");
                resolve(warehouse);
            }
            else {
                console.log("Failed to get warehouse, waiting 2 seconds, then retrying");
                setTimeout(() => { getWarehouse().then(resolve); }, 2000);
            }
        }).catch(() => {
            console.log("Failed to get warehouse, waiting 2 seconds, then retrying");
            setTimeout(() => { getWarehouse().then(resolve); }, 2000);
        });
    });
}



getWarehouse().then((warehouse: Warehouse) => {
    for (let i = 0; i < 10; i++) {
        forklifts.push(new Forklift("F" + i, SERVER_HOSTNAME, SERVER_PORT, randomIntegerInRange(5, 100), Forklift.states.idle, randomValue(warehouse.graph.vertices).position));
    }
});