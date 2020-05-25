import * as childProcess from 'child_process';
import { EventEmitter } from "events";
import * as ws from "ws";
import { WebSocket } from "../src/shared/webSocket";
import * as fs from 'fs';
import * as path from 'path';
import { Route } from '../src/shared/route';
import { Order } from '../src/shared/order';


console.log("Benchmarker running");

function createProcessOnCpu(relativePath: string, cpu: number, startupArguments: string[]): childProcess.ChildProcess {
    //let executionPath = path.join(process.argv[1], relativePath);
    switch (process.platform) {
        case "win32":
            return childProcess.exec(
                `c:\\windows\\system32\\cmd.exe /C start /affinity ${cpu} ts-node "${relativePath}" "${startupArguments.join("\" \"")}" > STDOUT`,
                (exception: childProcess.ExecException, stdout: string, stderr: string) => {
                    if (stdout) console.log(stdout);
                }
            );

        default:
            throw `OS ${process.platform} not implemented`;
    }
}

class Test {
    //planningScheduler = createProcessOnCpu("src\\planningScheduler\\run.ts", 1, ["localhost", "3000"]);
    planningScheduler = childProcess.fork("src\\planningScheduler\\run.ts", ["localhost", "3000"], { silent: true });
    blackbox = childProcess.fork("src\\blackbox\\run.ts", ["localhost", "3000"], { silent: true });
    forklifts = childProcess.fork("src\\forklifts\\run.ts", ["localhost", "3000"], { silent: true });
    webclient = childProcess.fork("src\\webclient\\run.ts", ["localhost", "8080", "localhost", "3000"], { silent: true });
    orderSpammer = childProcess.fork("src\\orderSpammer\\run.ts", ["localhost", "3000"], { silent: true });

    subscribedSocket: WebSocket;
    routes: { [key: string]: Route; } = {};
    parsedRoutes: { [key: string]: Route; } = {};
    routeCount: number = 0;
    ordersReceived: number = 0;
    failedOrdersCount: number = 0;
    timesteps: number = 0;
    timesUpdatedSinceLast: number = 0;
    timestepsSinceLastLog: number = 0;

    constructor() {

    }

    async subscribe() {
        return new Promise(async resolve => {
            let socket: ws;
            try {
                socket = new ws("ws:localhost:3000/subscribe");
            }
            finally {
                if (socket) {
                    socket.once("open", () => {
                        this.subscribedSocket = new WebSocket(socket);
                        resolve();
                    });
                    socket.on("error", async () => {
                        await this.subscribe();
                        resolve();
                    });
                }
                else {
                    await this.subscribe();
                    resolve();
                }
            }
        });
    }

    async Run() {
        await this.subscribe();
        this.subscribedSocket.on(WebSocket.packageTypes.route, (route: Route) => {
            this.routeCount++;
            this.routes[route.routeId] = route;
            this.parsedRoutes[route.routeId] = Route.parse(route);
        });
        this.subscribedSocket.on(WebSocket.packageTypes.routes, (routes: Route[]) => {
            this.routeCount += Object.keys(routes).length;
            for (let k in routes) {
                let route = routes[k];
                this.routes[route.routeId] = route;
                this.parsedRoutes[route.routeId] = Route.parse(route);
            }
        });

        this.subscribedSocket.on(WebSocket.packageTypes.order, (order: Order) => {
            this.ordersReceived++;
        });
        this.subscribedSocket.on(WebSocket.packageTypes.orders, (orders: Order[]) => {
            this.ordersReceived += Object.keys(orders).length;
        });

        this.subscribedSocket.on(WebSocket.packageTypes.orderFailed, (orderId: string) => {
            this.failedOrdersCount++;
        });
        this.subscribedSocket.on(WebSocket.packageTypes.ordersFailed, (orders: string[]) => {
            this.failedOrdersCount += orders.length;
        });

        return new Promise((resolve: (numberOfFulfilledOrders: number, timesteps: number) => any) => {
            this.planningScheduler.stdout.on("data", (data) => {
                let str = String(data);
                // Removed trailing newline
                str = str.substr(0, str.length - 1);
                console.log("planningScheduler: ", `"${str}"`);

                let lines = str.split("\n");
                for (let line of lines) {
                    let match;
                    if (line === "No unlocked routes - Suspending") {
                        setTimeout(() => { resolve(this.routeCount, this.timesteps); }, 5000);
                    }
                    else if (match = line.match(/Timesteps: (?<steps>\d+|Infinity)/i)) {
                        let num = Number(match.groups.steps);
                        this.timesteps += num;
                        this.timestepsSinceLastLog += num;
                    } else if (match = line.match(/Updated (?<times>\d+) times within the last 10 seconds/i)) {
                        this.timesUpdatedSinceLast += Number(match.groups.times);
                    }
                }
            });
        });
    }

    kill() {
        this.subscribedSocket.close();
        this.planningScheduler.kill();
        this.blackbox.kill();
        this.forklifts.kill();
        this.webclient.kill();
        this.orderSpammer.kill();
    }
}


async function main() {
    while (true) {
        let test = new Test();
        let startTime = new Date();
        test.Run();

        while (true) {
            // Log every 5 minutes
            await delay(60 * 1000);
            await logData("benchmarker/log.txt", {
                start: startTime.toISOString(),
                time: (new Date()).toISOString(),
                ordersReceived: test.ordersReceived,
                routeCount: test.routeCount,
                failedOrdersCount: test.failedOrdersCount,
                timesteps: test.timesteps,
                timestepsSinceLastLog: test.timestepsSinceLastLog,
                timesUpdatedSinceLast: test.timesUpdatedSinceLast
            });
            test.timestepsSinceLastLog = 0;
            test.timesUpdatedSinceLast = 0;
        }

        test.kill();
    }
}
main();

async function logData(filename: string, data: any) {
    console.log("Logged Data");
    return new Promise((resolve: () => any) => {
        fs.appendFile(filename, JSON.stringify(data) + ",\n", resolve);
    });
}

async function delay(ms: number) {
    return new Promise((resolve: () => any) => {
        setTimeout(resolve, ms);
    });
}


// Prevent automatic shutdown
let eventEmitter = new EventEmitter();
eventEmitter.on("compiled", function () {
    console.log("Compilation successful");
});