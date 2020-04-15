import { expect } from 'chai';
import 'mocha';
import { Warehouse } from '../../../src/shared/warehouse';
import { Graph, Vertex } from '../../../src/shared/graph';
import { Vector2 } from '../../../src/shared/vector2';

/** 
 * Considers whether two warehouses contains same values using Mocha
 * @param result The warehouse to be checked
 * @param expected The expected warehouse
 * @returns Mocha handles the appropriate responses
 */
function checkWarehouse(result: any, expected: Warehouse | null): void {
    if (expected !== null) {
        it(`Speed should be ${expected.forkliftSpeed}`, () => {
            expect(result.forkliftSpeed).to.equal(expected.forkliftSpeed);
        });
        checkArray(Object.keys(result.graph.vertices), Object.keys(expected.graph.vertices));
    } else {
        it(`Should be ${expected}`, () => {
            expect(result).to.equal(expected);
        });
    }
}

/**
 * Checks whether two arrays cointains same values using Mocha
 * @param result The array to be checked
 * @param expected The array containing the expected values
 * @returns Mocha handles the appropriate responses
 */
function checkArray(result: string[], expected: string[]): void {
    let length: number = Math.max(result.length, expected.length);
    for (let i = 0; i < length; i++) {
        it(`${result[i]} should be ${expected[i]}`, () => {
            expect(result[i]).to.equal(expected[i]);
        });
    }
}

/**
 * Test of the object Warehouse
 * @returns Mocha handles the appropriate responses
 */
function testWarehouse(): void {
    let graph: Graph = new Graph({
        "N23": new Vertex("N23", new Vector2(10, 10)),
        "N27": new Vertex("N27", new Vector2(20, 20)),
        "N29": new Vertex("N29", new Vector2(30, 30))
    });
    let warehouse: Warehouse = new Warehouse(graph, 20);
    let expectedArray: string[] = ["N23", "N27", "N29"];
    let expectedSpeed: number = 20;

    it(`ForkliftSpeed should be ${expectedSpeed}`, () => {
        expect(warehouse.forkliftSpeed).to.equal(expectedSpeed);
    });

    checkArray(Object.keys(warehouse.graph.vertices), expectedArray);
}

/**
 * Test of parse method on Warehouse object
 * @returns Mocha handles the appropriate responses
 */
function testParse(): void {
    let graph: Graph = new Graph({
        "N23": new Vertex("N23", new Vector2(10, 10)),
        "N27": new Vertex("N27", new Vector2(20, 20)),
        "N29": new Vertex("N29", new Vector2(30, 30))
    });

    describe(`Valid warehouse`, () => {
        let warehouse: Warehouse = new Warehouse(graph, 20);
        let expected: Warehouse = new Warehouse(graph, 20);
        let result: Warehouse | null = Warehouse.parse(warehouse);

        checkWarehouse(result, expected);
    });

    describe(`Invalid vertex in graph from warehouse`, () => {
        let warehouse: Warehouse = new Warehouse(graph, 20);
        warehouse.graph.vertices["N23"].id = null;
        // graph.vertices["N23"] = null;
        let expected: Warehouse = new Warehouse(graph, 20);
        let result: Warehouse | null = Warehouse.parse(warehouse);

        checkWarehouse(result, expected);

    });

    describe(`Invalid forkliftSpeed from warehouse`, () => {
        let warehouse: Warehouse = new Warehouse(graph, 20);
        warehouse.forkliftSpeed = null;

        let expected: Warehouse | null = null;
        let result: Warehouse | null = Warehouse.parse(warehouse);

        checkWarehouse(result, expected);
    });

    describe(`Invalid graph from warehouse`, () => {
        let warehouse: Warehouse = new Warehouse(graph, 20);
        warehouse.graph = null;

        let expected: Warehouse | null = null;
        let result: Warehouse | null = Warehouse.parse(warehouse);

        checkWarehouse(result, expected);
    });
}

describe(`Test of Warehouse Object`, testWarehouse);
describe(`Test of Warehouse Parse`, testParse);
