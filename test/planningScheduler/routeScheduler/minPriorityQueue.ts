/**
 * Test of minPriorityQueue
 * @packageDocumentation
 * @category Test
 */

import { expect } from 'chai';
import 'mocha';

import { MinPriorityQueue } from '../../../src/planningScheduler/classes/minPriorityQueue';
import { Vertex } from '../../../src/planningScheduler/classes/graph';
import { Vector2 } from '../../../src/shared/vector2';

describe("MinPriorityQueue", () => {
    describe(`Test of MinPriorityQueue.swapByIndex`, () => {
        it(`Test with correct swap`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [new Vertex("", new Vector2(0, 0)), new Vertex("", new Vector2(10, 10)), new Vertex("", new Vector2(20, 20))];
            let expected: Vertex[] = [new Vertex("", new Vector2(20, 20)), new Vertex("", new Vector2(10, 10)), new Vertex("", new Vector2(0, 0))];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }

            queue.swapByIndex(0, 2);

            expect(queue.array).to.eql(expected);
        });

        it(`Test with correct swap`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let vertices: Vertex[] = [new Vertex("", new Vector2(0, 0)), new Vertex("", new Vector2(10, 10)), new Vertex("", new Vector2(20, 20))];
            let expected: Vertex[] = [new Vertex("", new Vector2(0, 0)), new Vertex("", new Vector2(10, 10)), new Vertex("", new Vector2(20, 20))];

            for (let i = 0; i < vertices.length; i++) {
                queue.array.push(vertices[i]);
            }

            queue.swapByIndex(0, 0);

            expect(queue.array).to.eql(expected);
        });
    });

    describe(`Test of minHeapify`, () => {
        it(`The queue needs a heapify to satisfy the min-heap-property`, () => {
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

            expect(queue.array).to.eql(expected);
        });

        it(`The queue already satisfy the min-heap-property`, () => {
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

            expect(queue.array).to.eql(expected);
        });
    });

    describe(`Test of extractMin`, () => {
        it(`Using extractMin and testing length and first element`, () => {
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
            expect(extracted).to.be.eql(expected);

            // Length of array is now one smaller
            it(`${queue.array.length} should be ${length - 1}`, () => {
                expect(queue.array.length).to.equal(length - 1);
            });

            // The root is now the left child of extracted element
            expect(queue.array[0].position).to.be.eql(new Vector2(5, 5));
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
        it(`Inserting in empty queue`, () => {
            let queue: MinPriorityQueue<Vertex> = new MinPriorityQueue((vertex: Vertex): number => { return vertex.position.getLength(); });
            let expected: Vertex = new Vertex("", new Vector2(10, 10));

            queue.insert(new Vertex("", new Vector2(10, 10)));

            expect(queue.array[0].position).to.be.eql(expected.position);
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

            expect(queue.array).to.be.eql(expected);
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

            expect(queue.array).to.be.eql(expected);
        });

        it(`Inserting multiple in empty queue`, () => {
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

            expect(queue.array, "Failed to insert and maintain order").to.be.eql(expected);
        });
    });
});