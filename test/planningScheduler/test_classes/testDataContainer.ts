import { DataContainer } from "./../../../src/planningScheduler/classes/dataContainer";
import { Warehouse } from "../../../src/shared/warehouse";
import { Order } from "../../../src/shared/order";
import { Route } from "../../../src/shared/route";
import { expect } from 'chai';
import 'mocha';

function testObject() {
    let data = new DataContainer();

    it(`${Object.keys(data)[0]} should be empty`, () => {
        expect(data.forklifts.length).to.equal(0);
    });

    it(`${Object.keys(data)[1]} should be empty`, () => {
        expect(data.orders.length).to.equal(0);
    });

    it(`${Object.keys(data)[2]} should be empty`, () => {
        expect(data.routes.length).to.equal(0);
    });

    it(`${Object.keys(data)[3]} should be null`, () => {
        expect(data.warehouse).to.equal(null);
    });
}

function testAddOrder() {

    // Should be empty when first initialized
    describe(`When no orders are added`, () => {
        let data = new DataContainer();
        it(`${Object.keys(data)[1]} should be empty`, () => {
            expect(data.orders.length).to.equal(0);
        });
    });

    // Adding an order
    describe(`When an order is added`, () => {
        let data = new DataContainer();
        let orderId = "sfgojikdfjoi";
        data.addOrder(new Order("sfgojikdfjoi", Order.types.moveForklift, "awd", "pallet1", "start1", "slut1"));

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
    });

    // Adding multiple orders
    describe(`When multiple orders are added`, () => {
        let data = new DataContainer();
        data.addOrder(new Order("O0", Order.types.moveForklift, "TF2", "P17", "N17", "N21"));
        data.addOrder(new Order("O1", Order.types.movePallet, "TF2", "P17", "N21", "N23"));
        data.addOrder(new Order("O2", Order.types.charge, "TF2", "", "N23", "C1"));
        data.addOrder(new Order("O3", Order.types.charge, "TF25", "", "", "C3"));
        data.addOrder(new Order("O4", Order.types.moveForklift, "TF25", "P4", "C3", "N21"));

        // first order (Order.types.moveForklift, "TF2", "P17", "N17", "N21")
        describe(`The first order`, () => {
            let counter = 0;
            it(`Order number ${counter + 1}'s ${Object.keys(Order)[0]} should be ${Order.types.moveForklift}`, () => {
                expect(data.orders[counter].type).to.equal(Order.types.moveForklift);
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[0])[1]} should be "TF2"`, () => {
                expect(data.orders[counter].forkliftId).to.equal("TF2");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[0])[2]} should be "P17"`, () => {
                expect(data.orders[counter].palletId).to.equal("P17");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[0])[3]} should be "N17"`, () => {
                expect(data.orders[counter].startVertexId).to.equal("N17");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[0])[4]} should be "N21"`, () => {
                expect(data.orders[counter].endVertexId).to.equal("N21");
            });
        });

        // second order (Order.types.movePallet, "TF2", "P17", "N21", "N23")
        describe(`The second order`, () => {
            let counter = 1;
            it(`Order number ${counter + 1}'s's ${Object.keys(Order)[0]} should be ${Order.types.movePallet}`, () => {
                expect(data.orders[counter].type).to.equal(Order.types.movePallet);
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[1]} should be "TF2"`, () => {
                expect(data.orders[counter].forkliftId).to.equal("TF2");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[2]} should be "P17"`, () => {
                expect(data.orders[counter].palletId).to.equal("P17");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[3]} should be "N21"`, () => {
                expect(data.orders[counter].startVertexId).to.equal("N21");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[4]} should be "N23"`, () => {
                expect(data.orders[counter].endVertexId).to.equal("N23");
            });
        });

        // third order (Order.types.charge, "TF2", "", "N23", "C1")
        describe(`The third order`, () => {
            let counter = 2;
            it(`Order number ${counter + 1}'s's ${Object.keys(Order)[0]} should be ${Order.types.charge}`, () => {
                expect(data.orders[counter].type).to.equal(Order.types.charge);
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[1]} should be "TF2"`, () => {
                expect(data.orders[counter].forkliftId).to.equal("TF2");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[2]} should be ""`, () => {
                expect(data.orders[counter].palletId).to.equal("");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[3]} should be "N23"`, () => {
                expect(data.orders[counter].startVertexId).to.equal("N23");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[4]} should be "C1"`, () => {
                expect(data.orders[counter].endVertexId).to.equal("C1");
            });
        });

        // fourth order (Order.types.charge, "TF25", "", "", "C3")
        describe(`The fourth order`, () => {
            let counter = 3;
            it(`Order number ${counter + 1}'s's ${Object.keys(Order)[0]} should be ${Order.types.charge}`, () => {
                expect(data.orders[counter].type).to.equal(Order.types.charge);
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[1]} should be "TF25"`, () => {
                expect(data.orders[counter].forkliftId).to.equal("TF25");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[2]} should be ""`, () => {
                expect(data.orders[counter].palletId).to.equal("");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[3]} should be ""`, () => {
                expect(data.orders[counter].startVertexId).to.equal("");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[4]} should be "C3"`, () => {
                expect(data.orders[counter].endVertexId).to.equal("C3");
            });
        });

        // fifth order (Order.types.moveForklift, "TF25", "P4", "C3", "N21")
        describe(`The fifth order`, () => {
            let counter = 4;
            it(`Order number ${counter + 1}'s's ${Object.keys(Order)[0]} should be ${Order.types.moveForklift}`, () => {
                expect(data.orders[counter].type).to.equal(Order.types.moveForklift);
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[1]} should be "TF25"`, () => {
                expect(data.orders[counter].forkliftId).to.equal("TF25");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[2]} should be "P4"`, () => {
                expect(data.orders[counter].palletId).to.equal("P4");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[3]} should be "C3"`, () => {
                expect(data.orders[counter].startVertexId).to.equal("C3");
            });

            it(`Order number ${counter + 1}'s ${Object.keys(data.orders[1])[4]} should be "N21"`, () => {
                expect(data.orders[counter].endVertexId).to.equal("N21");
            });
        });
    });
}

describe("Test of object", testObject);
describe("Test of addOrder", testAddOrder);