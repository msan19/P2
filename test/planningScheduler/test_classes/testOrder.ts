import { expect } from 'chai';
import 'mocha';
import * as WebSocket from "ws";

import { DataContainer } from "./../../../src/planningScheduler/classes/dataContainer";
import { Warehouse } from '../../../src/shared/warehouse';
import { Graph, Vertex } from '../../../src/shared/graph';
import { Vector2 } from '../../../src/shared/vector2';
import { Forklift } from '../../../src/planningScheduler/classes/forklift';
import { Order } from '../../../src/shared/order';

function checkOrder(result: Order | null, expected: Order | null) {
    if (expected !== null) {
        let keys: string[] = Object.keys(result);
        let length: number = keys.length;
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

function testParse() {
    let data = new DataContainer();
    let warehouse: Warehouse = new Warehouse(new Graph({
        "N23": new Vertex("N23", new Vector2(10, 10)),
        "N27": new Vertex("N27", new Vector2(20, 20)),
        "N29": new Vertex("N29", new Vector2(30, 30)),
        "N31": new Vertex("N29", new Vector2(40, 40))
    }), 20);
    // Need fix with websockets (null seems to work?)
    let forklifts = [new Forklift("F2", new WebSocket(null)), new Forklift("F5", new WebSocket(null))];

    data.warehouse = warehouse;
    data.forklifts = forklifts;

    describe(`Test of valid order`, () => {
        let order = new Order("O4", Order.types.moveForklift, "F2", "P4", "N23", "N29");
        let result = Order.parse(order, data);
        let expected = order;

        checkOrder(result, expected);

    });

    describe(`Test of invalid order vertex id`, () => {
        let order = new Order("O4", Order.types.moveForklift, "F2", "P4", "N24", "N29");
        let result = Order.parse(order, data);
        let expected = null;

        checkOrder(result, expected);
    });

    describe(`Test of invalid order forklift id`, () => {
        let order = new Order("O4", Order.types.charge, "F7", "P4", "N23", "N29");
        let result = Order.parse(order, data);
        let expected = null;

        checkOrder(result, expected);
    });

    describe(`Test of valid order type`, () => {
        let order = new Order("O4", Order.types.charge, "F2", "P4", "N23", "N29");
        order.type = null;
        let result = Order.parse(order, data);
        let expected = null;

        checkOrder(result, expected);
    });
}



describe(`Test of Order.parse`, testParse);