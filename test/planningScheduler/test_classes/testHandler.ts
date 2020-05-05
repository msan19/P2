// testHandler.ts
/**
 * Test of {@link Handler}
 * @packageDocumentation
 * @category planningScheduler test
 */

import { Handler } from "../../../src/planningScheduler/classes/handler";
import { expect } from 'chai';
import 'mocha';
import { DataContainer } from "../../../src/planningScheduler/classes/dataContainer";


let data: DataContainer = new DataContainer();
let handler: Handler = new Handler(data);

// describe("Handler controllers lowercase and methods uppercased", () => {
//     for (let controllerId in handler.controllers) {
//         it(controllerId, () => {
//             expect(controllerId).to.equal(controllerId.toLowerCase());
//         });
//     }
// });

describe("Handler: ControllerIds must be lowercase and methodIds must be uppercased", () => {
    for (let controllerId in handler.controllers) {
        for (let methodId in handler.controllers[controllerId]) {
            it(`${controllerId}:${methodId}`, () => {
                expect(controllerId).to.equal(controllerId.toLowerCase());
                expect(methodId).to.equal(methodId.toUpperCase());
            });
        }
    }
});

describe("PlanningScheduler.handler.socketControllers should all be lowercased", () => {
    for (let socketControllerId in handler.socketControllers) {
        it(socketControllerId, () => {
            expect(socketControllerId).to.equal(socketControllerId.toLowerCase());
        });
    }
});;
