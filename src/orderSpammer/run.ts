// run.ts
/**
 * @packageDocumentation
 * @category OrderSpammer
 */

import { OrderSpammer } from "./orderSpammer";
import { randomIntegerInRange } from "../shared/utilities";

const SERVER_HOSTNAME = process.argv[2];
const SERVER_PORT = Number(process.argv[3]);

setTimeout(() => {
    new OrderSpammer(`http://${SERVER_HOSTNAME}:${SERVER_PORT}`, `http://${SERVER_HOSTNAME}:${SERVER_PORT}/subscribe`, () => { return randomIntegerInRange(2000, 2000); });
}, 4000);
