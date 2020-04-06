import { Graph } from "./graph";

export class Warehouse {

    graph: Graph;
    forkliftSpeed: number;

    constructor(graph: Graph, forkliftSpeed: number) {
        this.graph = graph;
        this.forkliftSpeed = forkliftSpeed;
    }

    static parse(obj: any): Warehouse | null {
        let parsedGraph: Graph = Graph.parse(obj.graph);
        if (parsedGraph === null) return null;

        if (typeof (obj.forkliftSpeed) !== "number") return null;

        return new Warehouse(parsedGraph, obj.forkliftSpeed);
    }
}