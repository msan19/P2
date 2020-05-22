// run.ts
/**
 * @packageDocumentation
 * @category OrderSpammer
 */

import * as ws from "ws";
import { WebSocket } from "./../shared/webSocket";
import { ApiCaller } from "./../shared/apiCaller";

import { OrderSpammer } from "./orderSpammer";
import { randomIntegerInRange } from "../shared/utilities";

const SERVER_HOSTNAME = process.argv[2];
const SERVER_PORT = Number(process.argv[3]);

let apiCaller = new ApiCaller(`http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
let socket = new WebSocket(new ws(`http://${SERVER_HOSTNAME}:${SERVER_PORT}/subscribe`));

setTimeout(() => {
    new OrderSpammer(apiCaller, socket, () => { return randomIntegerInRange(10000, 10000); });
}, 4000);
