// graph.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import { Vector2 } from "./vector2";

/** A {@link Graph} cointaining interconnected vertices */
export class Graph {

    /** A dictionary of vertices contained in the {@link Graph} */
    vertices: { [key: string]: Vertex; };

    /** A dictionary of ScheduleItems specifying the time and location of idle forklifts */
    idlePositions: { [forkliftId: string]: ScheduleItem; };

    constructor(vertices: { [key: string]: Vertex; }) {
        this.vertices = vertices || {};
        this.idlePositions = {};
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
        let newIdlePositions: { [forkliftId: string]: ScheduleItem; } = {};

        for (let key in this.idlePositions) {
            newIdlePositions[key] = this.idlePositions[key];
        }

        for (let key in this.vertices) {
            newVertices[key] = this.vertices[key].clone();
        }

        let graph = new Graph(newVertices);
        graph.idlePositions = newIdlePositions;
        return graph;
    }

    /**
     * Sets the isVisited value of each {@link Vertex} in the {@link Graph} to false
     */
    reset(): void {
        let keys: string[] = Object.keys(this.vertices);
        let length: number = keys.length;
        for (let i = 0; i < length; i++) {
            this.vertices[keys[i]].isVisited = false;
        }
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
    adjacentVertexIds: string[];

    /** An array of {@link ScheduleItem} specifying when forklifts move through the {@link Vertex} */
    scheduleItems?: ScheduleItem[];

    /** A {@link Vertex} reference to the previous {@link Vertex} in a route being planned */
    previousVertex: Vertex | null;

    /** A boolean specifying if the {@link Vertex} has been looked at by the route planning algorithm */
    isVisited: boolean;

    /** The time, in Unix epoch time in ms, where a forklift is on a vertex when the route is being planned */
    visitTime: number;

    constructor(id: string, position: Vector2, label?: string) {
        this.id = id;
        this.position = position;
        this.label = label || null;
        this.adjacentVertexIds = [];
        this.scheduleItems = [];
        this.previousVertex = null;
        this.isVisited = false;
        this.visitTime = 0;
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
                if (typeof (vertex.adjacentVertexIds[i]) && vertex.adjacentVertexIds[i].length > 0) {
                    tempAdjacency.push(vertex.adjacentVertexIds[i]);
                }
            }
        }

        // Check schedule items
        let tempSchedule: ScheduleItem[] = [];
        if (typeof (vertex.scheduleItems) === "object" && vertex.scheduleItems !== null) {
            for (let i = 0; i < vertex.scheduleItems.length; i++) {
                let tempItem: ScheduleItem = ScheduleItem.parse(vertex.scheduleItems[i]);
                if (tempItem !== null) {
                    tempSchedule.push(tempItem);
                }
            }
        }

        // Create the now valid vertex and add adjacency and schedule items
        let tempVertex: Vertex = new Vertex(vertex.id, tempVector, tempLabel);
        tempVertex.adjacentVertexIds = tempAdjacency;
        tempVertex.scheduleItems = tempSchedule;

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

        v.scheduleItems = [];
        for (let s in this.scheduleItems) {
            v.scheduleItems.push(this.scheduleItems[s]);
        }

        return v;
    }

    /**
     * Creates an array of vertices containing the legal vertices in the parameter array
     * @param vertices An array of vertices to be parsed
     * @returns A created array of vertices
     */
    static parseMultiple(vertices: Vertex[]): Vertex[] | null {
        vertices.forEach(element => {
            if (typeof (Vertex.parse(element)) === "object") return null;
        });
        let newVertices: Vertex[] = [];
        vertices.forEach(element => {
            newVertices.push(element);
        });

        return newVertices;
    }

    /**
     * Finds distance from the vertex which the function is called on to the vertex specified 
     * by the parameter id by recursively adding the distance to the previousVertex 
     * @param startId An identification string specifying the last vertex in the recursion
     */
    g(startId: string): number {
        if (this.id === startId || this.previousVertex === null) {
            return 0;
        } else {
            return this.previousVertex.g(startId) + (this.position.getDistanceTo(this.previousVertex.position));
        }
    }

    /**
     * Uses a binary search to find the index of a scheduleitem in the list of scheduleitems based on the parameter time
     * @param time A point in time for which the corresponding array index is found
     * @returns An index corresponding to the time
     */
    getScheduleItemIndex(time: number): number {
        let i = 0, j = this.scheduleItems.length;

        while (j - i > 1) {
            let pivotPoint = Math.round((i + j) / 2);
            if (this.scheduleItems[pivotPoint].arrivalTimeCurrentVertex >= time) {
                j = pivotPoint;
            } else {
                i = pivotPoint;
            }
        }

        if ((this.scheduleItems.length !== 0 && this.scheduleItems[i].arrivalTimeCurrentVertex >= time)) {
            return j - 1;
        } else {
            return j;
        }
    }

    getScheduleItem(time: number): ScheduleItem {
        return this.scheduleItems[this.getScheduleItemIndex(time)];
    }

    insertScheduleItem(scheduleItem: ScheduleItem): number {
        let index = this.getScheduleItemIndex(scheduleItem.arrivalTimeCurrentVertex);
        this.scheduleItems.splice(index, 0, scheduleItem);
        return index;
    }

}


/**
 * A point in time located at a vertex specifying which forklift 
 * moved through the vertex, when it did, which vertex it visited before
 * and which vertex it visited after. 
 * It can be viewed as a node in a linked list.
 */
export class ScheduleItem {

    /** An identification string for the forklift */
    forkliftId: string;

    /** 
     * The time when the forklift arrives at the current vertex. 
     * The time is represented as epoch time in ms 
     */
    arrivalTimeCurrentVertex: number;

    /** An identification string for the vertex that this ScheduleItem is attached to */
    currentVertexId: string;

    /** A reference to the scheduleItem on the previous vertex that the forklift was on */
    previousScheduleItem: ScheduleItem;

    /** A reference to the scheduleItem on the next vertex that the forklift was on */
    nextScheduleItem: ScheduleItem;

    constructor(forkliftId: string, arrivalTimeCurrentVertex: number, currentVertexId: string) {
        this.forkliftId = forkliftId;
        this.arrivalTimeCurrentVertex = arrivalTimeCurrentVertex;
        this.currentVertexId = currentVertexId;
        this.previousScheduleItem = null;
        this.nextScheduleItem = null;
    }

    /**
     * Creates a {@link ScheduleItem} with the content of the parameter object
     * @param item An object to be parsed
     * @returns A new {@link ScheduleItem} if the content of the parameter object is legal or null otherwise
     */
    static parse(item: any): ScheduleItem | null {
        // Check all necessary fields
        if (typeof (item) !== "object" || item === null) return null;
        if (typeof (item.forkliftId) !== "string" || item.nextVertexId.length < 1) return null;
        if (typeof (item.arrivalTimeCurrentVertex) !== "number") return null;
        if (typeof (item.currentVertexId) !== "string" || item.nextVertexId.length < 1) return null;

        return new ScheduleItem(item.forkliftId, item.time, item.nextVertexId);
    }

    linkPrevious(previousScheduleItem: ScheduleItem) {
        this.previousScheduleItem = previousScheduleItem;
        previousScheduleItem.nextScheduleItem = this;
    }

    linkNext(nextScheduleItem: ScheduleItem) {
        this.nextScheduleItem = nextScheduleItem;
        nextScheduleItem.previousScheduleItem = this;
    }

    /**
     * Creates a {@link ScheduleItem} with the content of the {@link ScheduleItem} the function is called on
     * @returns A new {@link ScheduleItem}
     */
    clone(): ScheduleItem {
        return new ScheduleItem(this.forkliftId, this.arrivalTimeCurrentVertex, this.currentVertexId);
    }

}
