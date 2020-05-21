import * as childProcess from 'child_process';
import { EventEmitter } from "events";
import * as ws from "ws";
import { WebSocket } from "../src/shared/webSocket";
import * as fs from 'fs';
import { Route } from '../src/shared/route';


console.log("Benchmarker running");

class Test {
    planningScheduler = childProcess.fork("src\\planningScheduler\\run.ts", ["localhost", "3000"], { silent: true });
    blackbox = childProcess.fork("src\\blackbox\\run.ts", ["localhost", "3000"], { silent: true });
    forklifts = childProcess.fork("src\\forklifts\\run.ts", ["localhost", "3000"], { silent: true });
    webclient = childProcess.fork("src\\webclient\\run.ts", ["localhost", "8080", "localhost", "3000"], { silent: true });

    subscribedSocket: WebSocket;
    routes: { [key: string]: Route; } = {};
    parsedRoutes: { [key: string]: Route; } = {};
    routeCount: number = 0;
    timesteps: number = NaN;

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

        return new Promise((resolve: (numberOfFulfilledOrders: number, timesteps: number) => any) => {
            this.planningScheduler.stdout.on("data", (data) => {
                let str = String(data);
                console.log("planningScheduler: ", `"${str}"`);
                if (str === "No unlocked routes - Suspending\n") {
                    setTimeout(() => { resolve(this.routeCount, this.timesteps); }, 5000);
                }
                else if (str.substr(0, "Discrete timesteps:".length) === "Discrete timesteps:") {
                    let timesteps = Number(str.match(/Discrete timesteps: (\d+|Infinity)\n/i)[1]);
                    this.timesteps = timesteps;
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
    }
}


async function main() {

    while (true) {
        let test = new Test();
        let startTime = new Date();
        await test.Run();

        console.log("Routes sent: ", test.routeCount);
        console.log("Timesteps: ", test.timesteps);

        fs.appendFileSync("benchmarker/log.txt", `{Start: "${startTime.toISOString()}", time: "${(new Date()).toISOString()}", routesSent: ${test.routeCount}, timesteps: ${test.timesteps}},\n`);

        test.kill();
    }
}
main();




// Prevent automatic shutdown
let eventEmitter = new EventEmitter();
eventEmitter.on("compiled", function () {
    console.log("Compilation successful");
});