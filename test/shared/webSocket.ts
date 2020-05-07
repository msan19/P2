import { expect } from 'chai';
import 'mocha';

import * as ws from "ws";

import { WebSocket } from "../../src/shared/webSocket";

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


// createSocketPairs(5).then((socketPairs) => {
//     console.log(socketPairs);
// });


describe("WebSocket", () => {
    createSocketPairs().then((socketPairs) => {
        let sockets = socketPairs[0];
        it("Initiate socket", () => {
            expect(sockets).to.exist;
            expect(sockets).to.not.exist;
            // expect(serverSocket).to.exist;
            // expect(clientSocket).to.exist;
        });
    });
});
