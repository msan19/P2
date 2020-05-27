// graph.ts
/**
 * Contains the graph and also vertices and scheduleItems which the graph uses. 
 * @packageDocumentation
 * @category Shared
 */

import { Vector2 } from "./vector2";

/** A {@link Graph} cointaining interconnected vertices */
export class Graph {
    jsonPublicKeys = ["vertices"];

    /** A dictionary of vertices contained in the {@link Graph} */
    vertices: { [key: string]: Vertex; };

    constructor(vertices: { [key: string]: Vertex; }) {
        this.vertices = vertices || {};
    }

    /**
     * Returns direct distance between two vertices
     * @param vertex_1 First {@link Vertex} 
     * @param vertex _2 Second {@link Vertex} 
     * @returns Distance between the vertices
     */
    getDistanceDirect(vertex_1: Vertex, vertex_2: Vertex): number {
        return vertex_1.getDistanceDirect(vertex_2);
    }

    /**
     * Loops through each adjecent {@link Vertex}  within each {@link Vertex} on the {@link Graph}
     * @returns Array of objects with two {@link Vertex} ids
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

    /**
     * Returns a new {@link Graph} containing only the legal content of the parameter {@link Graph}
     * @param graph The {@link Graph} to be parsed
     * @returns The new {@link Graph}
     */
    static parse(graph: any): Graph | null {
        // Check necessary fields
        if (typeof (graph) !== "object" || graph === null) return null;
        if (typeof (graph.vertices) !== "object" || graph.vertices === null) return null;

        // All vertices are vertex
        let keys: string[] = Object.keys(graph.vertices);
        let length: number = keys.length;
        for (let i = 0; i < length; i++) {
            let tempVertex: Vertex | null = Vertex.parse(graph.vertices[keys[i]]);
            if (tempVertex === null) {
                delete graph.vertices[keys[i]];
            }
        }

        // Check for both-way edges
        let tempVertices: { [key: string]: Vertex; } = {};
        keys = Object.keys(graph.vertices);
        length = keys.length;
        for (let i = 0; i < length; i++) {
            let currVertex: Vertex = graph.vertices[keys[i]];
            let tempVertex: Vertex = Vertex.parse(currVertex);

            if (tempVertex !== null) {
                tempVertex.adjacentVertexIds = [];
                for (let j = 0; j < currVertex.adjacentVertexIds.length; j++) {
                    if (graph.vertices[currVertex.adjacentVertexIds[j]].adjacentVertexIds.includes(currVertex.id)) {
                        tempVertex.adjacentVertexIds.push(currVertex.adjacentVertexIds[j]);
                    }
                }
                tempVertices[tempVertex.id] = tempVertex;
            }
        }

        return new Graph(tempVertices);
    }

    /**
     * Creates a new {@link Graph} containing a clone of each object in the {@link Graph} the function is called on
     * @returns A new {@link Graph}
     */
    clone(): Graph {
        let newVertices: { [key: string]: Vertex; } = {};

        for (let key in this.vertices) {
            newVertices[key] = this.vertices[key].clone();
        }

        return new Graph(newVertices);
    }
}

/**
 * A {@link Vertex} which in compination with the vertices adjecent to it make up a {@link Graph}
 */
export class Vertex {
    jsonPublicKeys = ["id", "position", "label", "adjacentVertexIds"];

    /** A {@link Vertex} identification string */
    id: string;

    /** A {@link Vector2} representing the position of the {@link Vertex} */
    position: Vector2;

    /** A label used by the user interface */
    label: string;

    /** An array of identification strings for adjecent vertices */
    adjacentVertexIds: string[] = [];

    constructor(id: string, position: Vector2, label?: string) {
        this.id = id;
        this.position = position;
        this.label = label || null;
    }

    /**
     * Finds direct distance between the parameter vertex at the vertex the function is called on
     * @param vertex A vertex which the distance is calculated to
     * @returns Direct distance to the parameter vertex
     */
    getDistanceDirect(vertex: Vertex): number {
        return vertex && this.position.getDistanceTo(vertex.position);
    }

    /**
     * Creates a new vertex containing parsed versions of the content of the parameter vertex
     * if the content is legal, or null otherwise
     * @param vertex A vertex to be parsed
     * @returns A legal vertex or null
     */
    static parse(vertex: any): Vertex | null {
        // Check for necessary field types
        if (typeof (vertex) !== "object" || vertex === null) return null;
        if (typeof (vertex.id) !== "string") return null;
        if (typeof (vertex.position) !== "object" || vertex.position === null) return null;

        // Check for a valid position
        let tempVector: Vector2 | null = Vector2.parse(vertex.position);
        if (tempVector === null) return null;

        // Check for label
        let tempLabel: string = null;
        if (typeof (vertex.label) === "string" && vertex.label.length > 0) {
            tempLabel = vertex.label;
        }

        // Check adjacency list
        let tempAdjacency: string[] = [];
        if (typeof (vertex.adjacentVertexIds) === "object" && vertex.adjacentVertexIds !== null) {
            for (let i = 0; i < vertex.adjacentVertexIds.length; i++) {
                if (typeof (vertex.adjacentVertexIds[i]) === "string" && vertex.adjacentVertexIds[i].length > 0) {
                    tempAdjacency.push(vertex.adjacentVertexIds[i]);
                }
            }
        }

        // Create the now valid vertex and add adjacency and schedule items
        let tempVertex: Vertex = new Vertex(vertex.id, tempVector, tempLabel);
        tempVertex.adjacentVertexIds = tempAdjacency;

        return tempVertex;
    }

    /**
     * Creates a vertex containing clones of the content of the vertex the function is called on
     * @returns A created vertex
     */
    clone(): Vertex {
        let v: Vertex = new Vertex(this.id, this.position.clone(), this.label);

        for (let a of this.adjacentVertexIds) {
            v.adjacentVertexIds.push(a);
        }

        return v;
    }

    /**
     * Creates an array of vertices containing the legal vertices in the parameter array
     * @param vertices An array of vertices to be parsed
     * @returns A created array of vertices
     */
    static parseMultiple(vertices: Vertex[]): Vertex[] | null {
        let newVertices: Vertex[] = [];

        if (!Array.isArray(vertices)) return null;

        for (let vertex of vertices) {
            let parsed = Vertex.parse(vertex);
            if (parsed === null) return null;
            else newVertices.push(parsed);
        }

        return newVertices;
    }

}
