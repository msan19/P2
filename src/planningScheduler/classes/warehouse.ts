import {Graph} from "./graph";

export class Warehouse {

    graph: Graph;
    forkliftSpeed: number;
    
    constructor(graph: Graph, forkliftSpeed: number) {
        this.graph = graph;
        this.forkliftSpeed = forkliftSpeed;
    }
}