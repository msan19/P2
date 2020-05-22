// run.ts
/**
 * This is the doc comment for run.ts
 * @packageDocumentation
 * @category Forklifts
 */

import { Forklift } from "./forklift";
import { randomIntegerInRange, randomKey } from "../shared/utilities";
import { ApiCaller } from "../shared/apiCaller";
import { Warehouse } from "../shared/warehouse";
import { Vector2 } from "../shared/vector2";

const SERVER_HOSTNAME = process.argv[2];
const SERVER_PORT = Number(process.argv[3]);

var forklifts = [];

let apiCaller = new ApiCaller(`http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
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
    let counter = 0;
    let x = 5, y = 0;

    while (counter < 140) {
        if (y > 21) {
            y = 0;
            x++;
        }

        if (y % 3 !== 0) {
            forklifts.push(new Forklift("F" + counter, SERVER_HOSTNAME, SERVER_PORT, randomIntegerInRange(5, 100), Forklift.states.idle, new Vector2((9 - x) * 10, y * 10)));
            forklifts.push(new Forklift("F" + (counter + 1), SERVER_HOSTNAME, SERVER_PORT, randomIntegerInRange(5, 100), Forklift.states.idle, new Vector2((x + 53) * 10, y * 10)));
            counter += 2;
        }
        y++;
    }

    /*for (let i = 0; i < 150; i++) {
        if (Object.keys(verticeIds).length <= 0) break; // empty spaces in array still counts in length, but not in keys

        let randomId = randomKey(verticeIds);
        let vertex = warehouse.graph.vertices[verticeIds[randomId]];
        delete verticeIds[randomId];


        forklifts.push(new Forklift("F" + i, SERVER_HOSTNAME, SERVER_PORT, randomIntegerInRange(5, 100), Forklift.states.idle, vertex.position));
    }*/
    /*
    for (let i = 0; i < 10; i++) {
        forklifts.push(new Forklift("F" + i, SERVER_HOSTNAME, SERVER_PORT, randomIntegerInRange(5, 100), Forklift.states.idle,
            new Vector2(i, 9 - i).scale(10)));
    }
    */
});