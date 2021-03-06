/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

import { Graph as Graph_Shared, Vertex as Vertex_Shared } from "../../shared/graph";
import { Vector2 } from "../../shared/vector2";
import { Order } from "./order";
import { Instruction } from "../../shared/route";

function superCastVertex(vertex: Vertex_Shared): Vertex {
    let output = new Vertex(vertex.id, vertex.position, vertex.label);
    output.adjacentVertexIds = vertex.adjacentVertexIds;
    return output;
}
function superCastGraph(graph: Graph_Shared): Graph {
    let castedVertices = {};
    for (let key in graph.vertices) {
        castedVertices[key] = superCastVertex(graph.vertices[key]);
    }

    return new Graph(castedVertices);
}

export class Graph extends Graph_Shared {
    vertices: { [key: string]: Vertex; };

    /** A dictionary of ScheduleItems specifying the time and location of idle forklifts */
    idlePositions: { [forkliftId: string]: ScheduleItem; } = {};

    /**
     * Returns a new {@link Graph} containing only the legal content of the parameter {@link Graph}
     * @param graph The {@link Graph} to be parsed
     * @returns The new {@link Graph}
     */
    static parse(graph: any): Graph | null {
        let parsed: Graph | Graph_Shared = Graph_Shared.parse(graph);
        if (parsed === null) return null;
        parsed = superCastGraph(parsed);

        return <Graph>parsed;
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

export class Vertex extends Vertex_Shared {
    /** An array of {@link ScheduleItem} specifying when forklifts move through the {@link Vertex} */
    scheduleItems: ScheduleItem[] = [];

    /** A {@link Vertex} reference to the previous {@link Vertex} in a route being planned */
    previousVertex: Vertex | null = null;

    /** A boolean specifying if the {@link Vertex} has been looked at by the route planning algorithm */
    isVisited: boolean = false;

    /** The time, in Unix epoch time in ms, where a forklift is on a vertex when the route is being planned */
    visitTime: number = 0;

    /**
     *
     */
    constructor(id: string, position: Vector2, label?: string) {
        super(id, position, label);
    }

    /**
     * Creates a new vertex containing parsed versions of the content of the parameter vertex
     * if the content is legal, or null otherwise
     * @param vertex A vertex to be parsed
     * @returns A legal vertex or null
     */
    static parse(vertex: any): Vertex | null {
        let parsed = super.parse(vertex);
        if (parsed === null) return null;
        return superCastVertex(parsed);
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

    /**
     * Links current scheduleItem with input parameter previousScheduleItem
     * @param previousScheduleItem ScheduleItem to be linked with current scheduleItem
     */
    setPrevious(previousScheduleItem: ScheduleItem): void {
        this.previousScheduleItem = previousScheduleItem;
        previousScheduleItem.nextScheduleItem = this;
    }

    /**
    * Links current scheduleItem with input parameter nextScheduleItem
    * @param previousScheduleItem ScheduleItem to be linked with current scheduleItem
    */
    setNext(nextScheduleItem: ScheduleItem): void {
        this.nextScheduleItem = nextScheduleItem;
        nextScheduleItem.previousScheduleItem = this;
    }

    /**
     * Converts the list of scheduleItems into an array of instructions, including relevant charge and sendFeedback instructions
     * @param order The order the instructions are related to
     * @param endTime orderTime + duration, the time the forklift will be done
     */
    asInstructionArray(order: Order, endTime: number): Instruction[] {
        let instructions = [];
        let scheduleItem: ScheduleItem = this;

        // Set scheduleItem to the first in the list
        while (scheduleItem.previousScheduleItem) scheduleItem = scheduleItem.previousScheduleItem;

        // Create and push an instruction for every scheduleItem from start to end
        let lastScheduleItem;
        while (scheduleItem) {
            // Get instruction-type
            let instructionType = Instruction.types.move;
            if (order.type === Order.types.movePallet) {
                if (scheduleItem.currentVertexId === order.endVertexId && scheduleItem.arrivalTimeCurrentVertex === endTime) {
                    // If final vertex, and time (can potentially drive through the vertex, from last idlePos, on the way to the pallet pickup)
                    instructionType = Instruction.types.unloadPallet;
                } else if (scheduleItem.currentVertexId === order.startVertexId) {
                    // If at pallet-vertex
                    instructionType = Instruction.types.loadPallet;
                }
            }

            // Push new instruction
            instructions.push(
                new Instruction(instructionType, scheduleItem.currentVertexId, scheduleItem.arrivalTimeCurrentVertex)
            );

            // Prepare next iteration
            lastScheduleItem = scheduleItem;
            scheduleItem = scheduleItem.nextScheduleItem;
        }

        if (order.type === Order.types.charge) {
            instructions.push(new Instruction(Instruction.types.charge, lastScheduleItem.currentVertexId, endTime));
        }

        instructions.push(new Instruction(Instruction.types.sendFeedback, lastScheduleItem.currentVertexId, endTime));

        return instructions;
    }

}
