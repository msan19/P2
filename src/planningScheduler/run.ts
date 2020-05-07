// run.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { PlanningScheduler } from "./planningScheduler";

const SERVER_HOSTNAME = 'localhost';
const SERVER_PORT = 3000;

new PlanningScheduler(SERVER_HOSTNAME, SERVER_PORT);
