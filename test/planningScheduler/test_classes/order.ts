// testAstar.ts
/**
 * Test of {@link Order}
 * @packageDocumentation
 * @category Test
 */

import { expect } from 'chai';
import 'mocha';

import { DataContainer } from "../../../src/planningScheduler/classes/dataContainer";
import { Warehouse } from '../../../src/planningScheduler/classes/warehouse';
import { Graph, Vertex } from '../../../src/planningScheduler/classes/graph';
import { Vector2 } from '../../../src/shared/vector2';
import { Forklift } from '../../../src/planningScheduler/classes/forklift';
import { Order } from '../../../src/planningScheduler/classes/order';
import { Order as Order_Shared, OrderTypes, TimeType } from "../../../src/shared/order";

describe(`Order parse`, () => {
    let sharedOrder = new Order_Shared("1", Order.types.movePallet, "F2", "P2", "N1-8", "N1-9", 100, Order.timeTypes.start, 0);
    let data = new DataContainer();
    data.forklifts["F2"] = new Forklift("F2", null);
    data.warehouse = new Warehouse(new Graph({
        "N1-8": new Vertex("N1-8", new Vector2(0, 0)),
        "N1-9": new Vertex("N1-9", new Vector2(0, 0))
    }), 15);

    context(`when order is valid, forklift is valid and vertices are valid`, () => {
        let resultingOrder = Order.parse(sharedOrder, data);
        let expectedOrder = new Order("1", Order.types.movePallet, "F2", "P2", "N1-8", "N1-9", 100, Order.timeTypes.start, 0);
        it(`should be parsed as an order`, () => {
            expect(resultingOrder).to.eql(expectedOrder);
        });
    });

    context(`when order is invalid, forklift is valid and vertices are valid`, () => {
        let testObject = { id: "1" };
        let resultingOrder = Order.parse(testObject, data);
        let expectedOrder = null;
        it(`should not be parsed as an order`, () => {
            expect(resultingOrder).to.eql(expectedOrder);
        });
    });

    context(`when order is valid, forklift is invalid and vertices are valid`, () => {
        let testObject = new Order_Shared("1", Order.types.moveForklift, "NOT_A_FORKLIFT", "P2", "N1-8", "N1-9", 100, Order.timeTypes.start, 0);
        let resultingOrder = Order.parse(testObject, data);
        let expectedOrder = null;
        it(`should not be parsed as an order`, () => {
            expect(resultingOrder).to.eql(expectedOrder);
        });
    });

    context(`when order is valid, forklift is valid and vertices are invalid`, () => {
        let testObject = new Order_Shared("1", Order.types.movePallet, "F2", "P2", "NOT_A_VERTEX", "ALSO_NOT_A_VERTEX", 100, Order.timeTypes.start, 0);
        let resultingOrder = Order.parse(testObject, data);
        let expectedOrder = null;
        it(`should not be parsed as an order`, () => {
            expect(resultingOrder).to.eql(expectedOrder);
        });
    });
});

describe(`Order delayStartTime`, () => {
    context(`when counter is 0 and delayMax is 1`, () => {
        let baseDelayTime = 100;
        let originalOrder = new Order("1", Order.types.movePallet, "F2", "P2", "N1-8", "N1-9", 100, Order.timeTypes.start, 1);
        let newTime = originalOrder.time + 100;     // 100 from formula, where i is delayCounter: newTime = originalTime + baseDelayTime * 2 ** i
        let delayed = originalOrder.delayStartTime(baseDelayTime);
        it(`should be true`, () => {
            expect(delayed).to.be.true;
        });
        it(`the new time should be delayed`, () => {
            expect(originalOrder.time).to.equal(newTime);
        });
    });

    context(`when counter is 0 and delayMax is 0`, () => {
        let delayCounter = 0;
        let baseDelayTime = 100;
        let originalOrder = new Order("1", Order.types.movePallet, "F2", "P2", "N1-8", "N1-9", 100, Order.timeTypes.start, delayCounter);
        let delayed = originalOrder.delayStartTime(baseDelayTime);
        it(`should be true`, () => {
            expect(delayed).to.be.false;
        });
    });
});



