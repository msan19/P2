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
    return new Graph(createVertices(10, 10));
}

/**
 * The total amount of generated vertices is xSize * ySize
 * @param xSize Amount of vertices on the x axis
 * @param ySize Amount of vertices on the y axis
 * @return { [key: string]: Vertex; } A dictionary where the values are Vertex objects
 */
function createVertices(xSize: number, ySize: number): { [key: string]: Vertex; } {
    let vertices = {};
    let distanceOfEdges = 10;

    for (let x = 0; x < xSize; x++) {
        for (let y = 0; y < ySize; y++) {
            let id = `N${x}-${y}`;
            vertices[id] = new Vertex(id, new Vector2(x * distanceOfEdges, y * distanceOfEdges), id);
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