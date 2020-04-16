// warehouse.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import { Graph } from "./graph";

/** A Warehouse containing a graph and the general forkliftspeed */
export class Warehouse {
    /** The layout of the warehouse */
    graph: Graph;

    /** The general speed of forklifts in the warehouse in m/s */
    forkliftSpeed: number;

    constructor(graph: Graph, forkliftSpeed: number) {
        this.graph = graph;
        this.forkliftSpeed = forkliftSpeed;
    }

    /** 
     * Parses to a warehouse
     * @param obj What should be parsed 
     * @returns A Warehouse if possible else null
     */
    static parse(obj: any): Warehouse | null {
        let parsedGraph: Graph | null = Graph.parse(obj.graph);
        if (parsedGraph === null) return null;

        if (typeof (obj.forkliftSpeed) !== "number") return null;

        return new Warehouse(parsedGraph, obj.forkliftSpeed);
    }
}