import { expect } from 'chai';
import 'mocha';

import { MinPriorityQueue } from '../../src/planningScheduler/classes/minPriorityQueue';
import { Vertex } from '../../src/shared/graph';
import { Vector2 } from '../../src/shared/vector2';
import { createGraph } from '../../src/blackBox/warehouse';
import { Order } from '../../src/shared/order';
import { RouteScheduler } from '../../src/planningScheduler/routeScheduler';
import { DataContainer } from '../../src/planningScheduler/classes/dataContainer';
import { RouteSet } from '../../src/shared/route';

function checkLength(l1: number, l2: number) {
    it(`Length l1 (${l1}) should be the same as l2 (${l2})`, () => {
        expect(l1).to.equal(l2);
    });
}

function checkVector(vector: Vector2, expected: Vector2) {
    it('x and y are as expected', () => {
        expect(vector.x).to.equal(expected.x);
        expect(vector.y).to.equal(expected.y);
    });
}

function testMinPriorityQueue() {
    describe(`Test of MinPriorityQueue.swapByIndex`, () => {
        describe(`Test with correct swap`, () => {
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [];
            let expected: Vertex = new Vertex("", new Vector2(10, 10));

            queue.insert(new Vertex("", new Vector2(10, 10)));

            checkVector(queue.array[0].position, expected.position);
        });

        describe(`Inserting in non-empty queue with high expected index position`, () => {
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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
            let queue: MinPriorityQueue = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
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

function testAStar() {
    describe(`Test of A* with Graph from createGraph input`, () => {
        let graph = createGraph();
        let routeSet = new RouteSet([], graph);
        let data = new DataContainer();
        let routeScheduler = new RouteScheduler(data);
        let order = new Order("O0", Order.types.moveForklift, "F23", "P23", "N1-2", "N8-9");
        let expectedRouteLength: number = 14;

        routeScheduler.planOptimalRoute(routeSet, order);

        checkLength(graph.vertices[order.endVertexId].g(order.startVertexId), expectedRouteLength);



    });



}





//describe(`Test of object "MinPriorityQueue"`, testMinPriorityQueue);
describe(`Test of A* algorithm`, testAStar);
