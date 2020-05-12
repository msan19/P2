/**
 * Test of webSocket
 * @packageDocumentation
 * @category Test
 */

import { expect } from 'chai';
import 'mocha';
import "chai-as-promised";

import * as ws from "ws";

import { WebSocket } from "../../src/shared/webSocket";
import { ForkliftInfo } from '../../src/shared/forkliftInfo';
import { Vector2 } from '../../src/shared/vector2';

export async function createSocketPairs(count: number = 1): Promise<{ server: WebSocket, client: WebSocket; }[]> {
    return new Promise((resolve) => {
        let socketServer = new ws.Server({ port: 5000, host: "localhost" });

        let socketPairs: { server: WebSocket, client: WebSocket; }[] = [];
        let next: { server: WebSocket, client: WebSocket; };

        socketServer.on("connection", (socket: ws) => {
            next.server = new WebSocket(socket);
            socketPairs.push(next);

            if (socketPairs.length < count) {
                next = {
                    server: null,
                    client: new WebSocket(new ws("ws:localhost:5000"))
                };
            }
            else {
                resolve(socketPairs);
                socketServer.close();
            }
        });

        // Start recursive call
        next = {
            server: null,
            client: new WebSocket(new ws("ws:localhost:5000"))
        };

    });
}
export async function createSocketPair() {
    return (await createSocketPairs(1))[0];
}

// describe("WebSocket", () => {
//     // it("Initiate sockets", async () => {
//     //     let sockets = await createSocketPairs(2);
//     //     expect(sockets).to.exist;
//     //     expect(sockets).to.be.instanceOf(Array);
//     //     expect(sockets).to.be.of.length(2);
//     //     expect(sockets[0].client).to.be.instanceOf(WebSocket);
//     //     expect(sockets[0].server).to.be.instanceOf(WebSocket);
//     // });
//     it("Send forklift", async () => {
//         let sockets = await createSocketPair();
//         let forklift = new ForkliftInfo();
//         forklift.id = "id";
//         forklift.batteryStatus = 52;
//         forklift.palletId = null;
//         forklift.position = new Vector2(2, 3);
//         forklift.state = ForkliftInfo.states.idle;

//         Promise.should.eventually.be.instanceOf(Promise);
//         Promise.should.eventually.not.be.instanceOf(Promise);

//         // let promise = sockets.client.whenPackage<ForkliftInfo>(WebSocket.packageTypes.forkliftInfo);
//         // sockets.server.sendForkliftInfo(forklift);
//         // expect(await promise).to.eventually.be.deep.equal(forklift);
//         // console.log("finished");

//         // setTimeout(() => {
//         //     sockets.server.sendRoute(<Route><unknown>{ a: "k" });
//         //     sockets.server.sendRoute(<Route><unknown>{ b: "k" });
//         //     sockets.server.sendRoute(<Route><unknown>{ c: "k" });
//         // }, 1000);

//         // let route: Route = await sockets.client.whenPackage(WebSocket.packageTypes.route);

//         // console.log(route);

//     });
// });
