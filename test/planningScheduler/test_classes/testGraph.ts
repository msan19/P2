import { expect } from 'chai';
import 'mocha';

import { Graph, Vertex, ScheduleItem } from "./../../../src/planningScheduler/classes/graph";
import { Vector2 } from "./../../../src/planningScheduler/classes/vector2";

function checkVector(vector: Vector2, expX: number, expY: number) {
    it('x and y are as expected', () => {
        expect(vector.x).to.equal(expX);
        expect(vector.y).to.equal(expY);
    });
}

function checkEdge(edge, expected) {
    it(`ID of the first`, () => {
        expect(edge.vertexId_1).to.equal(expected.id_1);
    });

    it(`ID of the second`, () => {
        expect(edge.vertexId_2).to.equal(expected.id_2);
    });
}

function checkArray(result: string[], expected: string[]) {
    let length: number = Math.max(result.length, expected.length);
    for (let i = 0; i < length; i++) {
        it(`${result[i]} should be ${expected[i]}`, () => {
            expect(result[i]).to.equal(expected[i]);
        });
    }
}

function testScheduleItem() {
    // forkliftId: string, time: number, nextVertexId: string
    describe(`Test of one random ScheduleItem`, () => {
        let item = new ScheduleItem("TF25", 12382, "N23");

        it(`${Object.keys(item)[0]} should be "TF25"`, () => {
            expect(item.forkliftId).to.equal("TF25");
        });

        it(`${Object.keys(item)[1]} should be 12382`, () => {
            expect(item.time).to.equal(12382);
        });

        it(`${Object.keys(item)[2]} should be "N23"`, () => {
            expect(item.nextVertexId).to.equal("N23");
        });
    });
}

function testVertex() {
    // id: string, position: Vector2, label?: string
    describe(`Test of Vertex Object`, () => {
        describe(`Test of Vertex with label`, () => {
            let vertex = new Vertex("N23", new Vector2(24, 12), "This is a nice node");
            it(`${Object.keys(vertex)[0]} should be "N23"`, () => {
                expect(vertex.id).to.equal("N23");
            });

            it(`${Object.keys(vertex)[1]} should be (24, 12)`, () => {
                checkVector(vertex.position, 24, 12);
            });

            it(`${Object.keys(vertex)[2]} should be "This is a nice node"`, () => {
                expect(vertex.label).to.equal("This is a nice node");
            });
        });

        describe(`Test of Vertex without label`, () => {
            let vertex = new Vertex("N23", new Vector2(24, 12));
            it(`${Object.keys(vertex)[0]} should be "N23"`, () => {
                expect(vertex.id).to.equal("N23");
            });

            it(`${Object.keys(vertex)[1]} should be (24, 12)`, () => {
                checkVector(vertex.position, 24, 12);
            });
        });
    });

    describe(`Test of Vertex method "getDistanceDirect"`, () => {
        describe(`Test of Vertex 1 (x1, y1) and Vertex 2 (x2, y2),\n\t\t where x1 != x2 and y1 != y2`, () => {
            let vertex1 = new Vertex("N23", new Vector2(10, 14));
            let vertex2 = new Vertex("N53", new Vector2(20, 24));
            let expected = parseFloat((((20 - 10) ** 2 + (24 - 14) ** 2) ** 0.5).toFixed(3));
            it(`Length should be ${expected}`, () => {
                expect(parseFloat(vertex1.getDistanceDirect(vertex2).toFixed(3))).to.equal(expected);
            });
        });

        describe(`Test of Vertex 1 (x1, y1) and Vertex 2 (x2, y2),\n\t\t where x1 = x2 and y1 = y2`, () => {
            let vertex1 = new Vertex("N23", new Vector2(10, 14));
            let vertex2 = new Vertex("N53", new Vector2(10, 14));
            let expected = parseFloat((((10 - 10) ** 2 + (14 - 14) ** 2) ** 0.5).toFixed(3));
            it(`Length should be ${expected}`, () => {
                expect(parseFloat(vertex1.getDistanceDirect(vertex2).toFixed(3))).to.equal(expected);
            });
        });
    });

    describe(`Test of Vertex.parse`, () => {
        describe(`Test with object with all valid fields and more`, () => {
            let vertex: any = { "id": "N23", "position": new Vector2(20, 20), "label": "This node", "meat": "beef" };
            let expected: Vertex = new Vertex("N23", new Vector2(20, 20), "This node");
            let result: any = Vertex.parse(vertex);

            it(`${Object.keys(result)[0]} should be ${expected.id}`, () => {
                expect(result.id).to.equal(expected.id);
            });

            checkVector(result.position, expected.position.x, expected.position.y);

            it(`${Object.keys(result)[2]} should be ${expected.label}`, () => {
                expect(result.label).to.equal(expected.label);
            });

            it(`${Object.keys(vertex)[3]} should be ${undefined}`, () => {
                expect(result.meat).to.equal(undefined);
            });

        });

        describe(`Test with insufficient object`, () => {
            let vertex: any = { "position": new Vector2(20, 20), "label": "This node", "meat": "beef" };
            let expected: null = null;
            let result: Vertex | null = Vertex.parse(vertex);

            it(`Should be ${expected}`, () => {
                expect(result).to.equal(expected);
            });
        });
    });
}

function testGraph() {
    describe(`Test of Graph object`, () => {
        describe(``, () => {
            let graph = new Graph({
                "N23": new Vertex("N23", new Vector2(10, 10)),
                "N27": new Vertex("N27", new Vector2(20, 20))
            });

            it(`${Object.keys(graph.vertices)[0]} should be N23`, () => {
                expect(graph.vertices["N23"].id).to.equal("N23");
                checkVector(graph.vertices["N23"].position, 10, 10);
            });

            it(`${Object.keys(graph.vertices)[1]} should be N27`, () => {
                expect(graph.vertices["N27"].id).to.equal("N27");
                checkVector(graph.vertices["N27"].position, 20, 20);
            });
        });
    });

    describe(`Test of Graph method "getDistanceDirect"`, () => {
        describe(`Two vertices with different positions`, () => {
            let graph = new Graph({
                "N23": new Vertex("N23", new Vector2(10, 10)),
                "N27": new Vertex("N27", new Vector2(20, 20))
            });
            let vertex1 = graph.vertices["N23"];
            let vertex2 = graph.vertices["N27"];
            let expected = parseFloat((((20 - 10) ** 2 + (20 - 10) ** 2) ** 0.5).toFixed(3));

            it(`Length should be ${expected}`, () => {
                expect(parseFloat(graph.getDistanceDirect(vertex1, vertex2).toFixed(3))).to.equal(expected);
            });
        });

        describe(`Two vertices with same position`, () => {
            let graph = new Graph({
                "N23": new Vertex("N23", new Vector2(10, 10)),
                "N27": new Vertex("N27", new Vector2(10, 10))
            });
            let vertex1 = graph.vertices["N23"];
            let vertex2 = graph.vertices["N27"];
            let expected = parseFloat((((10 - 10) ** 2 + (10 - 10) ** 2) ** 0.5).toFixed(3));

            it(`Length should be ${expected}`, () => {
                expect(parseFloat(graph.getDistanceDirect(vertex1, vertex2).toFixed(3))).to.equal(expected);
            });
        });
    });

    describe(`Test of Graph method "getEdges"`, () => {
        // No edges
        describe(``, () => {
            let graph = new Graph({
                "N23": new Vertex("N23", new Vector2(10, 10)),
                "N27": new Vertex("N27", new Vector2(20, 20)),
                "N29": new Vertex("N29", new Vector2(30, 30))
            });
            let edges = graph.getEdges();
            let expected = [];
            //expected.push({ "Id_1": "", "Id_2": "" });

            it(`Length is the same (${edges.length} = ${expected.length})`, () => {
                expect(edges.length).to.equal(expected.length);
            });

            for (let i = 0; i < edges.length; i++) {
                checkEdge(edges[i], expected[i]);
            }
        });

        // Edges on both nodes
        describe(``, () => {
            let graph = new Graph({
                "N23": new Vertex("N23", new Vector2(10, 10)),
                "N27": new Vertex("N27", new Vector2(20, 20)),
                "N29": new Vertex("N29", new Vector2(30, 30))
            });
            graph.vertices["N23"].adjacentVertexIds.push("N27");
            graph.vertices["N27"].adjacentVertexIds.push("N23");

            graph.vertices["N23"].adjacentVertexIds.push("N29");
            graph.vertices["N29"].adjacentVertexIds.push("N23");

            graph.vertices["N29"].adjacentVertexIds.push("N27");
            graph.vertices["N27"].adjacentVertexIds.push("N29");

            let edges = graph.getEdges();
            let expected = [];
            expected.push({ "id_1": "N23", "id_2": "N27" });
            expected.push({ "id_1": "N23", "id_2": "N29" });
            expected.push({ "id_1": "N27", "id_2": "N29" });

            it(`Length is the same (${edges.length} = ${expected.length})`, () => {
                expect(edges.length).to.equal(expected.length);
            });

            for (let i = 0; i < edges.length; i++) {
                checkEdge(edges[i], expected[i]);
            }
        });

        // Edges only one-way (alphabetically correct)
        describe(``, () => {

        });

        // Edges only one-way (alphabetically incorrect)

        // Check Graph.parse
        describe(`Test of Graph.parse (all valid)`, () => {
            let graph = new Graph({
                "N23": new Vertex("N23", new Vector2(10, 10)),
                "N27": new Vertex("N27", new Vector2(20, 20)),
                "N29": new Vertex("N29", new Vector2(30, 30))
            });
            graph.vertices["N23"].adjacentVertexIds.push("N27");
            graph.vertices["N27"].adjacentVertexIds.push("N23");

            graph.vertices["N23"].adjacentVertexIds.push("N29");
            graph.vertices["N29"].adjacentVertexIds.push("N23");

            graph.vertices["N29"].adjacentVertexIds.push("N27");
            graph.vertices["N27"].adjacentVertexIds.push("N29");

            let result: Graph | null = Graph.parse(graph);
            let keys: string[] = Object.keys(result.vertices);
            let length: number = keys.length;
            for (let i = 0; i < length; i++) {
                it(`${keys[i]} should be Vertex`, () => {
                    let currVertex = Vertex.parse(result.vertices[keys[i]]);
                    expect(typeof (currVertex)).to.equal("object");
                });
            }
        });

        describe(`Test of Graph.parse (missing both-way edges)`, () => {
            let graph = new Graph({
                "N23": new Vertex("N23", new Vector2(10, 10)),
                "N27": new Vertex("N27", new Vector2(20, 20)),
                "N29": new Vertex("N29", new Vector2(30, 30))
            });
            graph.vertices["N23"].adjacentVertexIds.push("N27");
            graph.vertices["N23"].adjacentVertexIds.push("N29");
            graph.vertices["N29"].adjacentVertexIds.push("N27");

            let result: Graph | null = Graph.parse(graph);

            it(`N23 adjacent should be empty`, () => {
                expect(result.vertices["N23"].adjacentVertexIds.length).to.equal(0);
            });

            it(`N27 adjacent should be empty`, () => {
                expect(result.vertices["N27"].adjacentVertexIds.length).to.equal(0);
            });

            it(`N29 adjacent should be empty`, () => {
                expect(result.vertices["N29"].adjacentVertexIds.length).to.equal(0);
            });
        });

        describe(`Test of Graph.parse (faulty vertex)`, () => {
            let graph: Graph = new Graph({
                "N23": new Vertex("N23", new Vector2(10, 10)),
                "N27": new Vertex("N27", new Vector2(20, 20)),
                "N29": new Vertex("N29", new Vector2(30, 30)),
                "N31": new Vertex("N29", new Vector2(40, 40))
            });
            let expected: string[] = ["N23", "N27", "N29"];

            graph.vertices["N31"].id = null;

            let result: Graph | null = Graph.parse(graph);

            let keys: string[] = Object.keys(result.vertices);

            it(`Should only contain 3 elements`, () => {
                expect(keys.length).to.equal(3);
            });

            checkArray(keys, expected);

            it(`N31 should be undefined`, () => {
                expect(result.vertices["N31"]).to.equal(undefined);
            });
        });

    });
}




describe(`Test of ScheduleItem`, testScheduleItem);
describe(`Test of Vertex`, testVertex);
describe(`Test of Graph`, testGraph);

