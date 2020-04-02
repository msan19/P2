import { DataContainer } from "./../../../src/planningScheduler/classes/dataContainer"
import {Warehouse} from "./../../../src/planningScheduler/classes/warehouse";
import {Order} from "./../../../src/planningScheduler/classes/order";
import {Route} from "./../../../src/planningScheduler/classes/route";
import { expect } from 'chai';
import 'mocha';



function testObject() {
    let data = new DataContainer();

    it(`${Object.keys(data)[0]} should be empty`, function () {
        expect(data.forklifts.length).to.equal(0);
    });

    it(`${Object.keys(data)[1]} should be empty`, function () {
        expect(data.orders.length).to.equal(0);
    });

    it(`${Object.keys(data)[2]} should be empty`, function () {
        expect(data.routes.length).to.equal(0);
    });

    it(`${Object.keys(data)[3]} should be null`, function () {
        expect(data.warehouse).to.equal(null);
    });
}

function testAddOrder() {
    let data = new DataContainer();

    // Should be empty when first initialized
    it(`${Object.keys(data)[1]} should be empty`, function () {
        expect(data.orders.length).to.equal(0);
    });

    // Adding an order
    data.addOrder(new Order(Order.types.moveForklift, "awd", "pallet1", "start1", "slut1"));


    it(`Order number 1's ${Object.keys(Order)[0]} should be ${Order.types.moveForklift}`, function () {
        expect(data.orders[0].type).to.equal(Order.types.moveForklift);
    });

    it(`Order number 1's ${Object.keys(data.orders[0])[1]} should be "awd"`, function () {
        expect(data.orders[0].forkliftId).to.equal("awd");
    });

    it(`Order number 1's ${Object.keys(data.orders[0])[2]} should be "pallet1"`, function () {
        expect(data.orders[0].palletId).to.equal("pallet1");
    });

    it(`Order number 1's ${Object.keys(data.orders[0])[3]} should be "start1"`, function () {
        expect(data.orders[0].startVertexId).to.equal("start1");
    });

    it(`Order number 1's ${Object.keys(data.orders[0])[4]} should be "slut1"`, function () {
        expect(data.orders[0].endVertexId).to.equal("slut1");
    });
        
        

// type: OrderType, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string
}

describe("Test of object", testObject);
describe("Test of addOrder", testAddOrder);