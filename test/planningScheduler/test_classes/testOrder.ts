import { expect } from 'chai';
import 'mocha';
import * as WebSocket from "ws";

import { DataContainer } from "./../../../src/planningScheduler/classes/dataContainer";
import { Warehouse } from '../../../src/shared/warehouse';
import { Graph, Vertex } from '../../../src/shared/graph';
import { Vector2 } from '../../../src/shared/vector2';
import { Forklift } from '../../../src/planningScheduler/classes/forklift';
import { Order } from '../../../src/shared/order';

/**
 * This function checks whether two orders are the same using Mocha's "expect"
 * @param result The actual order that is supposed to be checked
 * @param expected The order that the result is expected to be equal to
 * @returns There is no output, as Mocha handles the actual response
 */
function checkOrder(result: Order | null, expected: Order | null): void {
    /* First checks whether the expected order is different from null,
       as trying to access fields of null creates errors */
    if (expected !== null) {
        let keys: string[] = Object.keys(result);
        let length: number = keys.length;
        /* Goes through all fields (keys is a list of field-names) and checks their values */
        for (let i = 0; i < length; i++) {
            it(`${result[keys[i]]} should be ${expected[keys[i]]}`, () => {
                expect(result[keys[i]]).to.equal(expected[keys[i]]);
            });
        }
    } else {
        it(`Both should be null`, () => {
            expect(result).to.equal(expected);
        });
    }
}

/**
 * Function that uses Mocha to test the method parse on object Order
 * @returns Mocha handles the appropriate responses
 */
function testParse(): void {
    /* Creates necessary information for testing a valid order */
    let data: DataContainer = new DataContainer();
    let warehouse: Warehouse = new Warehouse(new Graph({
        "N23": new Vertex("N23", new Vector2(10, 10)),
        "N27": new Vertex("N27", new Vector2(20, 20)),
        "N29": new Vertex("N29", new Vector2(30, 30)),
        "N31": new Vertex("N29", new Vector2(40, 40))
    }), 20);
    // Need fix with websockets (null seems to work?)
    data.forklifts["F2"] = new Forklift("F2", null);
    data.forklifts["F5"] = new Forklift("F5", null);
    data.warehouse = warehouse;

    describe(`Test of valid order`, () => {
        let order: Order = new Order("O4", Order.types.moveForklift, "F2", "P4", "N23", "N29");
        let result: Order | null = Order.parse(order, data);
        let expected: Order = order;

        checkOrder(result, expected);

    });

    describe(`Test of invalid order vertex id`, () => {
        let order: Order = new Order("O4", Order.types.moveForklift, "F2", "P4", "N24", "N29");
        let result: Order | null = Order.parse(order, data);
        let expected: Order | null = null;

        checkOrder(result, expected);
    });

    describe(`Test of invalid order forklift id`, () => {
        let order: Order = new Order("O4", Order.types.charge, "F7", "P4", "N23", "N29");
        let result: Order | null = Order.parse(order, data);
        let expected: Order | null = null;

        checkOrder(result, expected);
    });

    describe(`Test of valid order type`, () => {
        let order: Order = new Order("O4", Order.types.charge, "F2", "P4", "N23", "N29");
        order.type = null;
        let result: Order | null = Order.parse(order, data);
        let expected: Order | null = null;

        checkOrder(result, expected);
    });
}

/* Calls the test in Mocha environment */
describe(`Test of Order.parse`, testParse);