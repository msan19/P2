import { Vector2 } from "./vector2";

export class Graph {
    vertices: { [key: string]: Vertex; };
    constructor(vertices: { [key: string]: Vertex; }) {
        this.vertices = vertices || {};
    }

    getDistanceDirect(vertex_1: Vertex, vertex_2: Vertex): number {
        return vertex_1.getDistanceDirect(vertex_2);
    }

    /**
    * Loops through each vertice within each vertice on the graph
    * @returns array of objects with 2 vertex ids
    */
    getEdges(): { vertexId_1: string, vertexId_2: string; }[] {
        let output = [];
        for (let vertexId_1 in this.vertices) {
            for (let key in this.vertices[vertexId_1].adjacentVertexIds) {
                let vertexId_2 = this.vertices[vertexId_1].adjacentVertexIds[key];
                if (vertexId_1 < vertexId_2) {
                    output.push({ "vertexId_1": vertexId_1, "vertexId_2": vertexId_2 });
                }
            }
        }
        return output;
    }
}

export class Vertex {
    id: string;
    position: Vector2;
    label: string;

    adjacentVertexIds: string[];

    scheduleItems?: ScheduleItem[];

    constructor(id: string, position: Vector2, label?: string) {
        this.id = id;
        this.position = position;
        this.label = label || "";
        this.adjacentVertexIds = [];
    }

    getDistanceDirect(vertex: Vertex): number {
        return this.position.getDistanceTo(vertex.position);
    }
}

export class ScheduleItem {
    forkliftId: string;
    time: number;
    nextVertexId: string;

    constructor(forkliftId: string, time: number, nextVertexId: string) {
        this.forkliftId = forkliftId;
        this.time = time;
        this.nextVertexId = nextVertexId;
    }
}
