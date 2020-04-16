// warehouse.ts
/**
 * @packageDocumentation
 * @category BlackBox
 */

import { Graph, Vertex } from "../shared/graph";
import { Vector2 } from "../shared/vector2";

/**
 * Creates a graph object
 */
export function createGraph() {
    let vertices = createVertices(10, 10);
    // vertices["n2-4"].id = null;   
    let graph = new Graph(vertices);
    let edges = graph.getEdges();

    return graph;
}

/**
 * The total amount of generated vertices is xSize * ySize
 * @param xSize Amount of vertices on the x axis
 * @param ySize Amount of vertices on the y axis
 * @return { [key: string]: Vertex; } A dictionary where the values are Vertex objects
 */
function createVertices(xSize: number, ySize: number): { [key: string]: Vertex; } {
    let vertices = {};

    for (let x = 0; x < xSize; x++) {
        for (let y = 0; y < ySize; y++) {
            let id = `N${x}-${y}`;
            vertices[id] = new Vertex(id, new Vector2(x, y), id);
            if (y > 0) {
                let neighborId = `N${x}-${y - 1}`;
                vertices[id].adjacentVertexIds.push(neighborId);
                vertices[neighborId].adjacentVertexIds.push(id);
            }
            if (x > 0 && (y === 0 || y === ySize - 1)) {
                let neighborId = `N${x - 1}-${y}`;
                vertices[id].adjacentVertexIds.push(neighborId);
                vertices[neighborId].adjacentVertexIds.push(id);
            }
        }
    }
    return vertices;
}