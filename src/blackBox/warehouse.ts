// warehouse.ts
/**
 * Contains methods for generating graphs with edges. 
 * @packageDocumentation
 * @category BlackBox
 */

import { Graph, Vertex } from "../shared/graph";
import { Vector2 } from "../shared/vector2";

/**
 * Enumeration type used for declaring type of graph to be generated.
 * Each enum is equivalent to the name as a string
 */
export enum GraphTypes {
    kiva = "kiva",
    transit = "transit",
    simple = "simple"
}

/**
 * Creates a graph object
 */
export function createGraph(graphType: GraphTypes) {
    let graphFunction: () => { [key: string]: Vertex; };

    switch (graphType) {
        case GraphTypes.kiva:
            graphFunction = () => (createKivaLikeVertices(63, 22));
            break;
        case GraphTypes.transit:
            graphFunction = () => (createRealTransitVertices());
            break;
        case GraphTypes.simple:
            graphFunction = () => (createVertices(10, 10));
            break;
        default:
            graphFunction = () => (createVertices(10, 10));
    }

    return new Graph(graphFunction());
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
 * Creates a graph emulating a real transit warehpuse.
 * See: insert_link_here
 * @return { [key: string]: Vertex; } A dictionary where the values are Vertex objects
 */
function createRealTransitVertices(): { [key: string]: Vertex; } {
    let vertices = {};
    let xSize = 36, ySize = 22;     // Size of the graph
    let distanceOfEdges = 3;        // Length between vertices

    for (let x = 0; x < xSize; x++) {
        for (let y = 0; y < ySize; y++) {
            /* Creates vertices in the rack area excluding vertices where racks are placed,
             * which are 10 in length and 2 in width placed with 2 spaces between each on either side. */
            if (x < 26 && ((y % 4 === 0 || y % 4 === 1) || (x % 12 === 0 || x % 12 === 1))) {
                let id = `N${x}-${y}`;
                let label;
                /* Only has label "shelf" if at the point of a shelf, else label is "hallway" */
                if (x % 12 === 0 || x % 12 === 1 || y === 0 || y === ySize - 1) label = "hallway";
                else label = "shelf";
                vertices[id] = new Vertex(id, new Vector2(x * distanceOfEdges, y * distanceOfEdges), label);
                /* Sets vertical lines when not in rack (2 rack spaces per 4 rows) */
                if (y > 0 && (y % 4 === 1 || (x % 12 === 0 || x % 12 === 1))) {
                    let neighborId = `N${x}-${y - 1}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
                /* Sets horizontal lines if not in rack (10 rack spaces per 12 columns, 2 rack spaces per 4 rows) */
                if (x > 0 && (x % 12 === 1 || (y % 4 === 0 || y % 4 === 1))) {
                    let neighborId = `N${x - 1}-${y}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
            }
            /* Creates vertices in the 3 areas, pick-up, put-down and charge at the right of the rack area.
             * Each of these areas are of dimensions 10 x 4*/
            else if (x >= 26 && (y % 8 > 0 && y % 8 < 5)) {
                let id = `N${x}-${y}`;
                let label;
                /* Hardcoded label name if vertex is an endpoint of areas to the right */
                if (y === 1 || y === 4) label = "pickUp";
                else if (y === 9 || y === 12) label = "dropOff";
                else if (y === 17 || y === 20) label = "charge";
                else label = "hallway";
                vertices[id] = new Vertex(id, new Vector2(x * distanceOfEdges, y * distanceOfEdges), label);
                /* Sets all vertical edges for the vertices in these areas*/
                if (y % 8 > 1) {
                    let neighborId = `N${x}-${y - 1}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
                /* Sets horizontal edges in the middle of each area, that is 2nd and 3rd row for each 8th row */
                if (y % 8 === 2 || y % 8 === 3) {
                    let neighborId = `N${x - 1}-${y}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
            }
        }
    }

    return vertices;
}

/**
 * Creates a graph emulating a Kiva-like environment. See http://idm-lab.org/bib/abstracts/papers/socs15b.pdf
 * @param xSize Amount of vertices on the x axis
 * @param ySize Amount of vertices on the y axis
 * @return { [key: string]: Vertex; } A dictionary where the values are Vertex objects
 */
function createKivaLikeVertices(xSize: number, ySize: number): { [key: string]: Vertex; } {
    let vertices = {};
    let distanceOfEdges = 10;
    let boundaryX = { left: 10, right: xSize - 10 };        // Area of rackets

    for (let x = 0; x < xSize; x++) {
        for (let y = 0; y < ySize; y++) {
            /* Creates vertices in an area bound by boundaryX excluding areas of racks,
             * which are 10 in length and 2 in width placed with one space between each on either side. */
            if (x >= boundaryX.left && x < boundaryX.right && ((x - 10) % 11 === 10 || y % 3 === 0)) {
                let id = `N${x}-${y}`;
                vertices[id] = new Vertex(id, new Vector2(x * distanceOfEdges, y * distanceOfEdges), id);
                /* Sets vertical edges only if they are in the spaces between racks (every 11th) */
                if (y > 0 && (x - 10) % 11 === 10) {
                    let neighborId = `N${x}-${y - 1}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
                /* Sets horizontal edges only if they are in the spaces between racks (evert 3rd) */
                if (x > 0 && y % 3 === 0) {
                    let neighborId = `N${x - 1}-${y}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
            }
            /* The areas to the left and right of the rack area */
            else if (x < boundaryX.left || x >= boundaryX.right) {
                let id = `N${x}-${y}`;
                vertices[id] = new Vertex(id, new Vector2(x * distanceOfEdges, y * distanceOfEdges), id);
                /* Sets all vertical edges (all) */
                if (y > 0) {
                    let neighborId = `N${x}-${y - 1}`;
                    vertices[id].adjacentVertexIds.push(neighborId);
                    vertices[neighborId].adjacentVertexIds.push(id);
                }
                /* Sets horizontal lines inside rack area and edges to the rows inside rack area (every 3rd) */
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