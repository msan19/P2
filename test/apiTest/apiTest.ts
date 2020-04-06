import * as http from "http";
import { getJson, getEntireString } from "./../../src/shared/webUtilities";

export function callApi(host: string, port: number, path: string, method: string, json: string) {
    const options = {
        hostname: host,
        port: port,
        path: path,
        method: method.toUpperCase(),
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(json)
        }
    };

    let req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        getEntireString(res).then((str) => {
            console.log("BEFORE IF", str);
            if (res.statusCode === 200 && str !== "Success") {
                let obj = JSON.parse(str);
                console.log(obj);
            } else {
                console.log(str);
            }
        }).catch((err) => {
            console.log(err);
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    if (options.method !== "GET") {
        req.write(json);
    }
    req.end();

    console.log(path, "\n");
};
