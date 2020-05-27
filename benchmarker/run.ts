import * as childProcess from 'child_process';
import { EventEmitter } from "events";
import * as ws from "ws";
import { WebSocket } from "../src/shared/webSocket";
import * as fs from 'fs';
import * as path from 'path';
import { Route } from '../src/shared/route';
import { Order } from '../src/shared/order';

console.log("Benchmarker running");

class Test {
    //planningScheduler = createProcessOnCpu("src\\planningScheduler\\run.ts", 1, ["localhost", "3000"]);
    planningScheduler: childProcess.ChildProcess;
    blackbox: childProcess.ChildProcess;
    forklifts: childProcess.ChildProcess;
    webclient: childProcess.ChildProcess;
    orderSpammer: childProcess.ChildProcess;

    planningCores: number[];
    utilityCores: number[];

    API_HOSTNAME: string;
    API_PORT: string;
    WEB_HOSTNAME: string;
    WEB_PORT: string;

    subscribedSocket: WebSocket;
    routes: { [key: string]: Route; } = {};
    parsedRoutes: { [key: string]: Route; } = {};
    routeCount: number = 0;
    ordersReceived: number = 0;
    failedOrdersCount: number = 0;
    timesteps: number = 0;
    timesUpdatedSinceLast: number = 0;
    timestepsSinceLastLog: number = 0;

    constructor(planningCores: number[], utilityCores: number[], API_HOSTNAME: string, API_PORT: string, WEB_HOSTNAME: string, WEB_PORT: string) {

        this.planningCores = planningCores;
        this.utilityCores = utilityCores;

        this.API_HOSTNAME = API_HOSTNAME;
        this.API_PORT = API_PORT;
        this.WEB_HOSTNAME = WEB_HOSTNAME;
        this.WEB_PORT = WEB_PORT;

        this.planningScheduler = childProcess.fork("src\\planningScheduler\\run.ts", [API_HOSTNAME, API_PORT], { silent: true });
        this.blackbox = childProcess.fork("src\\blackbox\\run.ts", [API_HOSTNAME, API_PORT], { silent: true });
        this.forklifts = childProcess.fork("src\\forklifts\\run.ts", [API_HOSTNAME, API_PORT], { silent: true });
        this.webclient = childProcess.fork("src\\webclient\\run.ts", [WEB_HOSTNAME, WEB_PORT, API_HOSTNAME, API_PORT], { silent: true });
        this.orderSpammer = childProcess.fork("src\\orderSpammer\\run.ts", [API_HOSTNAME, API_PORT], { silent: true });

        setCpuAffinity(this.planningScheduler, this.planningCores);
        setCpuAffinity(this.blackbox, [2]);
        setCpuAffinity(this.forklifts, [2]);
        setCpuAffinity(this.webclient, [2]);
        setCpuAffinity(this.orderSpammer, [2]);
    }

    async subscribe() {
        return new Promise(async resolve => {
            let socket: ws;
            try {
                socket = new ws(`ws:${this.API_HOSTNAME}:${this.API_PORT}/subscribe`);
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

async function main(planningCores: number[], utilityCores: number[], API_HOSTNAME: string, API_PORT: string, WEB_HOSTNAME: string, WEB_PORT: string) {
    while (true) {
        let test = new Test(planningCores, utilityCores, API_HOSTNAME, API_PORT, WEB_HOSTNAME, WEB_PORT);
        let startTime = new Date();

        await Promise.race([
            test.Run(),
            delay(10 * 60 * 1000) // Timeout after 10 minutes
        ]);

        // while (true) {
        //     // Log every 5 minutes
        //     await delay(60 * 1000);
        await logData("benchmarker/log.txt", {
            API_PORT: test.API_PORT,
            start: startTime.toISOString(),
            time: (new Date()).toISOString(),
            ordersReceived: test.ordersReceived,
            routeCount: test.routeCount,
            failedOrdersCount: test.failedOrdersCount,
            timesteps: test.timesteps,
            timestepsSinceLastLog: test.timestepsSinceLastLog,
            timesUpdatedSinceLast: test.timesUpdatedSinceLast,
            planningCores: test.planningCores
        });
        test.timestepsSinceLastLog = 0;
        test.timesUpdatedSinceLast = 0;
        //}

        test.kill();
    }
}
main([1], [0], "localhost", "3000", "localhost", "8080");

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

function setCpuAffinity(proc: childProcess.ChildProcess, cores: number[]): void {
    switch (process.platform) {
        case "win32":
            // https://stackoverflow.com/questions/19187241/change-affinity-of-process-with-windows-script
            let cpuMask = 0;
            for (let coreId of cores) cpuMask += 2 ** coreId;
            childProcess.exec(`PowerShell "$Process = Get-Process -ID ${proc.pid}"; $Process.ProcessorAffinity=${cpuMask}`);
            break;
        default:
            throw `OS ${process.platform} not implemented`;
    }
}

// Prevent automatic shutdown
let eventEmitter = new EventEmitter();
eventEmitter.on("compiled", function () {
    console.log("Compilation successful");
});