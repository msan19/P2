/**
 * Test of {@link dataContainer}
 * @packageDocumentation
 * @category Test
 */

import { DataContainer } from "./../../../src/planningScheduler/classes/dataContainer";
import { Warehouse } from "../../../src/shared/warehouse";
import { Order } from "../../../src/planningScheduler/classes/order";
import { Route } from "../../../src/shared/route";
import { expect } from 'chai';
import 'mocha';

/**
 * Test of the object DataContainer
 * @returns Mocha handles the appropriate responses
 */
function testDataContainer(): void {
    let data: DataContainer = new DataContainer();

    it(`${Object.keys(data)[0]} should be empty`, () => {
        expect(Object.keys(data.forklifts).length).to.equal(0);
    });

    it(`${Object.keys(data)[1]} should be empty`, () => {
        expect(Object.keys(data.orders).length).to.equal(0);
    });

    it(`${Object.keys(data)[2]} should be empty`, () => {
        expect(Object.keys(data.routes).length).to.equal(0);
    });

    it(`${Object.keys(data)[3]} should be null`, () => {
        expect(data.warehouse).to.equal(null);
    });
}

/**
 * Test of method addOrder for object DataContainer
 * @returns Mocha handles the appropriate responses
 */
function testAddOrder() {
    // Should be empty when first initialized
    describe(`When no orders are added`, () => {
        let data: DataContainer = new DataContainer();
        it(`${Object.keys(data)[1]} should be empty`, () => {
            expect(Object.keys(data.orders).length).to.equal(0);
        });
    });

    // Adding an order
    describe(`When an order is added`, () => {
        let data: DataContainer = new DataContainer();
        let orderId: string = "sfgojikdfjoi";
        data.addOrder(new Order("sfgojikdfjoi", Order.types.moveForklift, "awd", "pallet1", "start1", "slut1", 1000, 2, 3));

        it(`Order number 1's ${Object.keys(data.orders[orderId])[0]} should be sfgojikdfjoi`, () => {
            expect(data.orders[orderId].id).to.equal("sfgojikdfjoi");
        });

        it(`Order number 1's ${Object.keys(data.orders[orderId])[1]} should be ${Order.types.moveForklift}`, () => {
            expect(data.orders[orderId].type).to.equal(Order.types.moveForklift);
        });

        it(`Order number 1's ${Object.keys(data.orders[orderId])[2]} should be "awd"`, () => {
            expect(data.orders[orderId].forkliftId).to.equal("awd");
        });

        it(`Order number 1's ${Object.keys(data.orders[orderId])[3]} should be "pallet1"`, () => {
            expect(data.orders[orderId].palletId).to.equal("pallet1");
        });

        it(`Order number 1's ${Object.keys(data.orders[orderId])[4]} should be "start1"`, () => {
            expect(data.orders[orderId].startVertexId).to.equal("start1");
        });

        it(`Order number 1's ${Object.keys(data.orders[orderId])[5]} should be "slut1"`, () => {
            expect(data.orders[orderId].endVertexId).to.equal("slut1");
        });

        it(`Order number 1's ${Object.keys(data.orders[orderId])[6]} should be 1000`, () => {
            expect(data.orders[orderId].time).to.equal(1000);
        });

        it(`Order number 1's ${Object.keys(data.orders[orderId])[7]} should be 2`, () => {
            expect(data.orders[orderId].timeType).to.equal(2);
        });

        it(`Order number 1's ${Object.keys(data.orders[orderId])[8]} should be 3`, () => {
            expect(data.orders[orderId].delayMax).to.equal(3);
        });
    });

    // Adding multiple orders
    describe(`When multiple orders are added`, () => {
        let data: DataContainer = new DataContainer();
        data.addOrder(new Order("O0", Order.types.moveForklift, "TF2", "P17", "N17", "N21", 100, Order.timeTypes.start, 3));
        data.addOrder(new Order("O1", Order.types.movePallet, "TF2", "P17", "N21", "N23", 200, Order.timeTypes.start, 3));
        data.addOrder(new Order("O2", Order.types.charge, "TF2", "", "N23", "C1", 300, Order.timeTypes.start, 3));
        data.addOrder(new Order("O3", Order.types.charge, "TF25", "", "", "C3", 400, Order.timeTypes.start, 3));
        data.addOrder(new Order("O4", Order.types.moveForklift, "TF25", "P4", "C3", "N21", 500, Order.timeTypes.start, 3));

        let expectO0: any[] = ["O0", Order.types.moveForklift, "TF2", "P17", "N17", "N21", 100, Order.timeTypes.start, 3];
        let expectO1: any[] = ["O1", Order.types.movePallet, "TF2", "P17", "N21", "N23", 200, Order.timeTypes.start, 3];
        let expectO2: any[] = ["O2", Order.types.charge, "TF2", "", "N23", "C1", 300, Order.timeTypes.start, 3];
        let expectO3: any[] = ["O3", Order.types.charge, "TF25", "", "", "C3", 400, Order.timeTypes.start, 3];
        let expectO4: any[] = ["O4", Order.types.moveForklift, "TF25", "P4", "C3", "N21", 500, Order.timeTypes.start, 3];

        let expecteds: any[][] = [expectO0, expectO1, expectO2, expectO3, expectO4];

        for (let i = 0; i < Object.keys(data.orders).length; i++) {
            describe(`The first order`, () => {
                let orderId: string = "O" + i;
                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[0]} should be ${expecteds[i][0]}`, () => {
                    expect(data.orders[orderId].id).to.equal(expecteds[i][0]);
                });

                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[1]} should be ${expecteds[i][1]}`, () => {
                    expect(data.orders[orderId].type).to.equal(expecteds[i][1]);
                });

                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[2]} should be ${expecteds[i][2]}`, () => {
                    expect(data.orders[orderId].forkliftId).to.equal(expecteds[i][2]);
                });

                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[3]} should be ${expecteds[i][3]}`, () => {
                    expect(data.orders[orderId].palletId).to.equal(expecteds[i][3]);
                });

                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[4]} should be ${expecteds[i][4]}`, () => {
                    expect(data.orders[orderId].startVertexId).to.equal(expecteds[i][4]);
                });

                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[5]} should be ${expecteds[i][5]}`, () => {
                    expect(data.orders[orderId].endVertexId).to.equal(expecteds[i][5]);
                });

                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[6]} should be ${expecteds[i][6]}`, () => {
                    expect(data.orders[orderId].time).to.equal(expecteds[i][6]);
                });

                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[7]} should be ${expecteds[i][7]}`, () => {
                    expect(data.orders[orderId].timeType).to.equal(expecteds[i][7]);
                });

                it(`Order ${orderId}'s ${Object.keys(data.orders[orderId])[8]} should be ${expecteds[i][8]}`, () => {
                    expect(data.orders[orderId].delayMax).to.equal(expecteds[i][8]);
                });
            });
        }
    });
}

describe("Test of dataContainer", testDataContainer);
describe("Test of addOrder", testAddOrder);