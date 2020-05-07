// testAstar.ts
/**
 * Test of ({@link Warehouse}). Assumes 
 * @packageDocumentation
 * @category planningScheduler test
 */

import { expect } from 'chai';
import 'mocha';
import { Warehouse } from '../../../src/planningScheduler/classes/warehouse';
import { Vector2 } from '../../../src/shared/vector2';
import { Graph, Vertex } from '../../../src/planningScheduler/classes/graph';

describe(`Warehouse parse`, () => {
    let originalGraph = new Graph({
        "N23": new Vertex("N23", new Vector2(10, 10)),
        "N27": new Vertex("N27", new Vector2(20, 20))
    });
    let originalMaxForkliftSpeed = 15;

    let warehouseReference = new Warehouse(new Graph({
        "N23": new Vertex("N23", new Vector2(10, 10)),
        "N27": new Vertex("N27", new Vector2(20, 20))
    }), 15);

    context(`when valid graph, valid maxForkliftSpeed`, () => {
        let testObject = { graph: originalGraph, maxForkliftSpeed: originalMaxForkliftSpeed };
        let resultingWarehouse = Warehouse.parse(testObject);
        let expectedWarehouse = warehouseReference;
        it(`should be parsed as a warehouse`, () => {
            expect(resultingWarehouse).to.eql(expectedWarehouse);
        });
    });

    context(`when valid graph, invalid maxForkliftSpeed`, () => {
        let testObject = { graph: originalGraph, maxForkliftSpeed: null };
        let resultingWarehouse = Warehouse.parse(testObject);
        let expectedWarehouse = null;
        it(`should not be parsed as a warehouse`, () => {
            expect(resultingWarehouse).to.eql(expectedWarehouse);
        });
    });

    context(`when invalid graph, valid maxForkliftSpeed`, () => {
        let testObject = { graph: null, maxForkliftSpeed: originalMaxForkliftSpeed };
        let resultingWarehouse = Warehouse.parse(testObject);
        let expectedWarehouse = null;
        it(`should not be parsed as a warehouse`, () => {
            expect(resultingWarehouse).to.eql(expectedWarehouse);
        });
    });

    context(`when invalid graph, invalid maxForkliftSpeed`, () => {
        let testObject = { graph: null, maxForkliftSpeed: null };
        let resultingWarehouse = Warehouse.parse(testObject);
        let expectedWarehouse = null;
        it(`should not be parsed as a warehouse`, () => {
            expect(resultingWarehouse).to.eql(expectedWarehouse);
        });
    });

});
