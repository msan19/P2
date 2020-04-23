// testAstar.ts
/**
 * Test of A* ({@link RouteScheduler.planOptimalRoute})
 * @packageDocumentation
 * @category planningScheduler test
 */

import { expect } from 'chai';
import 'mocha';

import { MinPriorityQueue } from '../../src/planningScheduler/classes/minPriorityQueue';
import { Vertex, Graph, ScheduleItem } from '../../src/shared/graph';
import { Vector2 } from '../../src/shared/vector2';
import { createGraph } from '../../src/blackBox/warehouse';
import { Order } from '../../src/shared/order';
import { RouteScheduler } from '../../src/planningScheduler/routeScheduler';
import { DataContainer } from '../../src/planningScheduler/classes/dataContainer';
import { RouteSet } from '../../src/shared/route';
import { Data } from 'ws';
import { Warehouse } from '../../src/shared/warehouse';

/**
 * Checks wether two lengths are equal
 * @param l1 First length
 * @param l2 Second length 
 * @returns Mocha handles the appropriate responses
 */
function checkLength(l1: number, l2: number): void {
    it(`Length l1 (${l1}) should be the same as l2 (${l2})`, () => {
        expect(l1).to.equal(l2);
    });
}

/**
 * Checks whether a vector is equal to an expected vector
 * @param vector The vector that is to be checked
 * @param expected The expected vector
 * @returns Mocha handles the appropriate responses
 */
function checkVector(vector: Vector2, expected: Vector2): void {
    it('x and y are as expected', () => {
        expect(vector.x).to.equal(expected.x);
        expect(vector.y).to.equal(expected.y);
    });
}

/**
 * Checks whether two arrays contains same values
 * @param result The array that is to be checked
 * @param expected The array containing the expected values
 * @returns Mocha handles the appropriate responses
 */
function checkArray(result: number[], expected: number[]) {
    let length: number = Math.max(result.length, expected.length);
    for (let i = 0; i < length; i++) {
        it(`${result[i]} should be ${expected[i]}`, () => {
            expect(result[i]).to.equal(expected[i]);
        });
    }
}

/**
 * Test of the object MinPriorityQueue
 * @returns Mocha handles the appropriate responses
 */
function testMinPriorityQueue(): void {
    describe(`Test of MinPriorityQueue.swapByIndex`, () => {
        describe(`Test with correct swap`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [new Vertex("", new Vector2(0, 0)), new Vertex("", new Vector2(10, 10)), new Vertex("", new Vector2(20, 20))];
            let expected: Vertex[] = [new Vertex("", new Vector2(20, 20)), new Vertex("", new Vector2(10, 10)), new Vertex("", new Vector2(0, 0))];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }

            queue.swapByIndex(0, 2);

            for (let i = 0; i < expected.length; i++) {
                checkVector(queue.array[i].position, expected[i].position);
            }
        });

        describe(`Test with correct swap`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [new Vertex("", new Vector2(0, 0)), new Vertex("", new Vector2(10, 10)), new Vertex("", new Vector2(20, 20))];
            let expected: Vertex[] = [new Vertex("", new Vector2(0, 0)), new Vertex("", new Vector2(10, 10)), new Vertex("", new Vector2(20, 20))];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }

            queue.swapByIndex(0, 0);

            for (let i = 0; i < expected.length; i++) {
                checkVector(queue.array[i].position, expected[i].position);
            }
        });
    });

    describe(`Test of minHeapify`, () => {
        describe(`The queue needs a heapify to satisfy the min-heap-property`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [
                new Vertex("", new Vector2(25, 25)),
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(30, 30))
            ];
            let expected: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(25, 25)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(30, 30))
            ];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }

            queue.minHeapify(0);

            for (let i = 0; i < expected.length; i++) {
                checkVector(queue.array[i].position, expected[i].position);
            }
        });

        describe(`The queue already satisfy the min-heap-property`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(25, 25)),
                new Vertex("", new Vector2(30, 30))
            ];
            let expected: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(25, 25)),
                new Vertex("", new Vector2(30, 30))
            ];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }

            queue.minHeapify(0);

            for (let i = 0; i < expected.length; i++) {
                checkVector(queue.array[i].position, expected[i].position);
            }
        });
    });

    describe(`Test of extractMin`, () => {
        describe(`Using extractMin and testing length and first element`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(25, 25)),
                new Vertex("", new Vector2(30, 30))
            ];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }
            let length: number = queue.array.length;

            let extracted: Vertex = queue.extractMin();

            // Extracted element is (0, 0)
            let expected: Vertex = new Vertex("", new Vector2(0, 0));
            checkVector(extracted.position, expected.position);

            // Length of array is now one smaller
            it(`${queue.array.length} should be ${length - 1}`, () => {
                expect(queue.array.length).to.equal(length - 1);
            });

            // The root is now the left child of extracted element
            checkVector(queue.array[0].position, new Vector2(5, 5));
        });

        describe(`Using extractMin on empty queue`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [];


            let extracted: Vertex | null = queue.extractMin();

            // Extracted element is (0, 0)
            let expected: null = null;
            it(`Both should be null`, () => {
                expect(extracted).to.equal(expected);
            });
        });
    });

    describe(`Test of insert`, () => {
        describe(`Inserting in empty queue`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [];
            let expected: Vertex = new Vertex("", new Vector2(10, 10));

            queue.insert(new Vertex("", new Vector2(10, 10)));

            checkVector(queue.array[0].position, expected.position);
        });

        describe(`Inserting in non-empty queue with high expected index position`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(30, 30))
            ];
            let expected: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(30, 30)),
                new Vertex("", new Vector2(25, 25))
            ];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }

            queue.insert(new Vertex("", new Vector2(25, 25)));

            for (let i = 0; i < expected.length; i++) {
                checkVector(queue.array[i].position, expected[i].position);
            }
        });

        describe(`Inserting in non-empty queue with low expected index position`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(30, 30))
            ];
            let expected: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(7, 7)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(20, 20)),
                new Vertex("", new Vector2(30, 30)),
                new Vertex("", new Vector2(10, 10))
            ];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }

            queue.insert(new Vertex("", new Vector2(7, 7)));

            for (let i = 0; i < expected.length; i++) {
                checkVector(queue.array[i].position, expected[i].position);
            }
        });

        describe(`Inserting multiple in empty queue`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [
                new Vertex("", new Vector2(7, 7)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(30, 30)),
                new Vertex("", new Vector2(20, 20))
            ];
            let expected: Vertex[] = [
                new Vertex("", new Vector2(0, 0)),
                new Vertex("", new Vector2(5, 5)),
                new Vertex("", new Vector2(7, 7)),
                new Vertex("", new Vector2(15, 15)),
                new Vertex("", new Vector2(10, 10)),
                new Vertex("", new Vector2(30, 30)),
                new Vertex("", new Vector2(20, 20))
            ];

            for (let i = 0; i < vertices.length; i++) {
                queue.insert(vertices[i]);
            }

            for (let i = 0; i < expected.length; i++) {
                checkVector(queue.array[i].position, expected[i].position);
            }
        });
    });
}

/**
 * Test of A*
 * @returns Mocha handles the appropriate responses
 */
function testAStar(): void {
    describe(`Test of A* with Graph from createGraph input`, () => {
        let graph: Graph = createGraph();
        let routeSet: RouteSet = new RouteSet([], graph);
        let warehouse = new Warehouse(graph, 15);
        let data: DataContainer = new DataContainer();
        data.warehouse = warehouse;
        let routeScheduler: RouteScheduler = new RouteScheduler(data);
        let order: Order = new Order("O0", Order.types.moveForklift, "F23", "P23", "N1-2", "N8-9");
        order.timeType = Order.timeTypes.start;
        order.time = 134513;
        let expectedRouteLength: number = 14;

        routeScheduler.planOptimalRoute(routeSet, order);

        checkLength(graph.vertices[order.endVertexId].g(order.startVertexId), expectedRouteLength);
    });

    describe(`Make A* great again!`, () => {
        // Creating necessary objects
        let graph: Graph = createGraph();
        let routeSet: RouteSet = new RouteSet([], graph);
        let warehouse = new Warehouse(graph, 15);
        let data: DataContainer = new DataContainer();
        data.warehouse = warehouse;
        let routeScheduler: RouteScheduler = new RouteScheduler(data);

        // Orders and such
        let order: Order = new Order("O0", Order.types.moveForklift, "F23", "P23", "N1-2", "N8-9");
        order.timeType = Order.timeTypes.start;
        order.time = 400;

        let orderAnnoying: Order = new Order("O1", Order.types.moveForklift, "F24", "P24", "N0-3", "N5-8");
        orderAnnoying.timeType = Order.timeTypes.start;
        orderAnnoying.time = 400;

        routeScheduler.planOptimalRoute(routeSet, order);
        routeScheduler.planOptimalRoute(routeSet, orderAnnoying);

        console.log(routeScheduler);
    });

    describe(`Test arrival time`, () => {
        let graph: Graph = createGraph();
        let routeSet: RouteSet = new RouteSet([], graph);
        let warehouse = new Warehouse(graph, 15);
        let data: DataContainer = new DataContainer();
        data.warehouse = warehouse;
        let routeScheduler: RouteScheduler = new RouteScheduler(data);

        // Init scheduleItems
        let vertex1: Vertex = routeScheduler.data.warehouse.graph.vertices["N0-0"];
        let vertex2: Vertex = routeScheduler.data.warehouse.graph.vertices["N0-1"];

        vertex1.scheduleItems.push(new ScheduleItem("F0", 400, vertex1.id));
        vertex1.scheduleItems.push(new ScheduleItem("F1", 30400, vertex1.id));
        vertex1.scheduleItems.push(new ScheduleItem("F2", 62480, vertex1.id));

        vertex2.scheduleItems.push(new ScheduleItem("F4", 400, vertex2.id));
        vertex2.scheduleItems.push(new ScheduleItem("F0", 30400, vertex2.id));
        vertex2.scheduleItems.push(new ScheduleItem("F1", 70400, vertex2.id));

        // Link shit
        vertex1.scheduleItems[0].linkNext(vertex2.scheduleItems[1]);
        vertex1.scheduleItems[1].linkNext(vertex2.scheduleItems[2]);

        // Test the shit
        let results: number[] = [];
        let expecteds: number[] = [];

        results.push(routeScheduler.getArrivalTime(vertex1, vertex2, 0, 30000));
        results.push(routeScheduler.getArrivalTime(vertex1, vertex2, 401, 30000));
        results.push(routeScheduler.getArrivalTime(vertex1, vertex2, 30401, 30000));
        results.push(routeScheduler.getArrivalTime(vertex1, vertex2, 62481, 30000));

        expecteds.push(Infinity);
        expecteds.push(30400 + 30000 / 2);
        expecteds.push(70400 + 30000 / 2);
        expecteds.push(70400 + 30000 / 2);

        checkArray(results, expecteds);

    });
}

//describe(`Test of object "MinPriorityQueue"`, testMinPriorityQueue);
describe(`Test of A* algorithm`, testAStar);
