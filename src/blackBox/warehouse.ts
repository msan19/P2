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
    return new Graph(createKivaLikeGraph(53, 22));
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
            // Generates the vertical lines (all)
            if (y > 0) {
                let neighborId = `N${x}-${y - 1}`;
                vertices[id].adjacentVertexIds.push(neighborId);
                vertices[neighborId].adjacentVertexIds.push(id);
            }
            // Generates the horizontal lines on the graph (every 3rd row)
            if (x > 0 && y % 3 === 0) {
                let neighborId = `N${x - 1}-${y}`;
                vertices[id].adjacentVertexIds.push(neighborId);
                vertices[neighborId].adjacentVertexIds.push(id);
            }
        }
    }
    return vertices;
}

/**
 * The total amount of generated vertices is xSize * ySize
 * @param xSize Amount of vertices on the x axis
 * @param ySize Amount of vertices on the y axis
 * @return { [key: string]: Vertex; } A dictionary where the values are Vertex objects
 */
function createKivaLikeGraph(xSize: number, ySize: number): { [key: string]: Vertex; } {
    let vertices = {};
    let distanceOfEdges = 10;
    let boundaryX = { left: 5, right: xSize - 5 };


    for (let x = 0; x < xSize; x++) {
        for (let y = 0; y < ySize; y++) {
            if (x >= boundaryX.left && x < boundaryX.right && ((x - 5) % 11 === 10 || y % 3 === 0)) {
                let id = `N${x}-${y}`;
                vertices[id] = new Vertex(id, new Vector2(x * distanceOfEdges, y * distanceOfEdges), id);

                if (y > 0 && (x - 5) % 11 === 10) {
                    let neighborId = `N${x}-${y - 1}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
                if (x > 0 && y % 3 === 0) {
                    let neighborId = `N${x - 1}-${y}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }

            } else if (x < boundaryX.left || x >= boundaryX.right) {
                let id = `N${x}-${y}`;
                vertices[id] = new Vertex(id, new Vector2(x * distanceOfEdges, y * distanceOfEdges), id);
                if (y > 0) {
                    let neighborId = `N${x}-${y - 1}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
                if (x > 0 && (x > boundaryX.right || x < boundaryX.left || y % 3 === 0)) {
                    let neighborId = `N${x - 1}-${y}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }

            }
        }
    }
    return vertices;
}