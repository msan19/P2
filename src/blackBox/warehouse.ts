import { Graph, Vertex } from "../shared/graph";
import { Vector2 } from "../shared/vector2";

export function createGraph() {
    let vertices = createVertices(10, 10);
    // vertices["n2-4"].id = null;   
    let graph = new Graph(vertices);
    let edges = graph.getEdges();

    return graph;
}

function createVertices(xSize: number, ySize: number): { [key: string]: Vertex; } {
    let vertices = {};

    for (let x = 0; x < xSize; x++) {
        for (let y = 0; y < ySize; y++) {
            let id = `n${x}-${y}`;
            vertices[id] = new Vertex(id, new Vector2(x, y), id);
            if (y > 0) {
                let neighborId = `n${x}-${y - 1}`;
                vertices[id].adjacentVertexIds.push(neighborId);
                vertices[neighborId].adjacentVertexIds.push(id);
            }
            if (x > 0 && (y === 0 || y === ySize - 1)) {
                let neighborId = `n${x - 1}-${y}`;
                vertices[id].adjacentVertexIds.push(neighborId);
                vertices[neighborId].adjacentVertexIds.push(id);
            }
        }
    }
    return vertices;
}