// run.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { PlanningScheduler } from "./planningScheduler";

const SERVER_HOSTNAME = process.argv[2];
const SERVER_PORT = Number(process.argv[3]);

new PlanningScheduler(SERVER_HOSTNAME, SERVER_PORT);
