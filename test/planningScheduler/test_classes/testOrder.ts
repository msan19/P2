import { expect } from 'chai';
import 'mocha';

import { DataContainer } from "./../../../src/planningScheduler/classes/dataContainer";
import { Warehouse } from '../../../src/planningScheduler/classes/warehouse';
import { Graph, Vertex } from '../../../src/planningScheduler/classes/graph';
import { Vector2 } from '../../../src/planningScheduler/classes/vector2';

function testParse() {
    let data = new DataContainer();
    let warehouse: Warehouse = new Warehouse(new Graph({
        "N23": new Vertex("N23", new Vector2(10, 10)),
        "N27": new Vertex("N27", new Vector2(20, 20)),
        "N29": new Vertex("N29", new Vector2(30, 30)),
        "N31": new Vertex("N29", new Vector2(40, 40))
    }), 20);


    describe(`Test of valid order`, () => {

    });

    describe(`Test of invalid order vertex id`, () => {

    });

    describe(`Test of invalid order forklift id`, () => {

    });

    describe(`Test of valid order type`, () => {

    });
}



describe(`Test of Order.parse`, testParse);