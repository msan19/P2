import * as childProcess from 'child_process';
import { EventEmitter } from 'events';

const API_HOSTNAME = "localhost";
const API_PORT = "3000";
const WEB_HOSTNAME = "localhost";
const WEB_PORT = "8080";

let planningScheduler = childProcess.fork("src\\planningScheduler\\run.ts", [API_HOSTNAME, API_PORT], { silent: true });
childProcess.fork("src\\blackbox\\run.ts", [API_HOSTNAME, API_PORT], { silent: true });
childProcess.fork("src\\forklifts\\run.ts", [API_HOSTNAME, API_PORT], { silent: true });
childProcess.fork("src\\webclient\\run.ts", [WEB_HOSTNAME, WEB_PORT, API_HOSTNAME, API_PORT], { silent: true });
childProcess.fork("src\\orderSpammer\\run.ts", [API_HOSTNAME, API_PORT], { silent: true });


// Pipe STDOUT from planningScheduler
planningScheduler.stdout.on("data", (data) => {
    let str = String(data);
    // Removed trailing newline
    str = str.substr(0, str.length - 1);

    console.log(str);
});

// Prevent automatic shutdown
let eventEmitter = new EventEmitter();
eventEmitter.on("preventAutomaticShutdown", function () { });