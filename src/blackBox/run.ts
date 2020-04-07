import { createGraph } from "./warehouse";
import * as fs from "fs";
import * as http from "http";
import { Warehouse } from "../shared/warehouse";

let warehouse = new Warehouse(createGraph(), 20);
let graph = JSON.stringify(warehouse, null, 4);
console.log(graph);
fs.writeFileSync("./src/blackBox/graph.json", graph);
console.log("Graph is written to file");

const options = {
    hostname: "localhost",
    port: 3000,
    path: "/warehouse",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(graph)
    }
};

setTimeout(() => {
    let req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.write(graph);
    req.end();

    console.log("Graph sent");
}, 2000);