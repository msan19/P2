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
import { Order } from "../shared/order";

const SERVER_HOSTNAME = process.argv[2];
const SERVER_PORT = Number(process.argv[3]);

let apiCaller = new ApiCaller(`http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
let socket = new WebSocket(new ws(`http://${SERVER_HOSTNAME}:${SERVER_PORT}/subscribe`));

setTimeout(() => {
    new OrderSpammer(apiCaller, socket, () => { return randomIntegerInRange(4000, 4000); });
    /*let time: number = new Date().getTime() + 30000;
    this.apiCaller.sendOrder(new Order("O0", Order.types.movePallet, "", "P0", "N2-5", "N6-0", time, Order.timeTypes.start, 0));
    this.apiCaller.sendOrder(new Order("O1", Order.types.movePallet, "", "P1", "N5-1", "N0-7", time, Order.timeTypes.start, 0));
    this.apiCaller.sendOrder(new Order("O2", Order.types.movePallet, "", "P2", "N4-4", "N0-0", time, Order.timeTypes.start, 0));*/

}, 4000);
