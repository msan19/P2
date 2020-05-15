/**
 * @packageDocumentation
 * @category Shared
 */

import { Graph } from "./graph";

/** A Warehouse containing a graph and the maximum forkliftspeed */
export class Warehouse {
    jsonPublicKeys = ["graph", "maxForkliftSpeed"];

    /** The layout of the warehouse */
    graph: Graph;

    /** The general speed of forklifts in the warehouse in m/s */
    maxForkliftSpeed: number;




    constructor(graph: Graph, forkliftSpeed: number) {
        this.graph = graph;
        this.maxForkliftSpeed = forkliftSpeed;
    }

    /** 
     * Parses to a warehouse
     * @param obj What should be parsed 
     * @returns A Warehouse if possible else null
     */
    static parse(obj: any): Warehouse | null {
        let parsedGraph: Graph | null = Graph.parse(obj.graph);
        if (parsedGraph === null) return null;

        if (typeof (obj.maxForkliftSpeed) !== "number") return null;

        return new Warehouse(parsedGraph, obj.maxForkliftSpeed);
    }
}