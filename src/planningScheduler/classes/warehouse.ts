// warehouse.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import { Warehouse as Warehouse_Shared } from "../../shared/warehouse";
import { Graph } from "./graph";

/** A Warehouse containing a graph and the maximum forkliftspeed */
export class Warehouse extends Warehouse_Shared {
    /** The layout of the warehouse */
    graph: Graph;

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