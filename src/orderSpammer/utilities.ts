/**
 * @packageDocumentation
 * @category orderSpammer
 */

import { DataContainer } from "./dataContainer";
import { Vector2 } from "../shared/vector2";

export enum VertexTypes {
    pickup = "pickUp",
    dropOff = "dropOff",
    shelf = "shelf",
    charge = "charge",
    hallway = "hallway"
}

export class Vertex {
    static isAvailable(data: DataContainer, vertexId: string, time: number, ): boolean {
        for (let i in data.unfinishedOrders) {
            let order = data.unfinishedOrders[i];
            if (order.endVertexId && order.endVertexId === vertexId) {
                return false;
            }
        }

        for (let i in data.lockedRoutes) {
            let route = data.lockedRoutes[i];
            let lastInstruction = route.instructions[route.instructions.length - 1];

            if ((lastInstruction.vertexId === vertexId) && lastInstruction.startTime > time) {
                // If same endVertex
                return false;
            }
        }

        for (let i in data.forklifts) {
            if (data.warehouse.graph.vertices[vertexId].position.getDistanceTo(data.forklifts[i].position) < 1)
                return false;
        }

        return true;
    }

    static getAllAvailable(data: DataContainer, time: number): string[] {
        let output = [];
        for (let id in data.warehouse.graph.vertices) {
            if (Vertex.isAvailable(data, id, time)) {
                output.push(id);
            }
        }
        return output;
    }

    static getAllAvailableOfType(data: DataContainer, availableVertexIds: string[], type: VertexTypes) {
        return availableVertexIds.filter((val, id, arr) => {
            return Vertex.getType(data, val) === type;
        });
    }

    static getType(data: DataContainer, vertexId: string): VertexTypes {
        return <VertexTypes>data.warehouse.graph.vertices[vertexId].label;
    }

    static estimateVertexId(data: DataContainer, position: Vector2): string {
        for (let k in data.warehouse.graph.vertices) {
            let v = data.warehouse.graph.vertices[k];
            if (v.position.getDistanceTo(position) < 0.2) return v.id;
        }
        return;
    }
}

export class Forklift {
    static isAvailble(data: DataContainer, forkliftId: string, time: number): boolean {
        for (let i in data.unfinishedOrders) {
            let order = data.unfinishedOrders[i];
            if (order.forkliftId && order.forkliftId === forkliftId) {
                return false;
            }
        }
        for (let i in data.lockedRoutes) {
            let route = data.lockedRoutes[i];
            if (route.forkliftId && route.forkliftId === forkliftId) { // If same forklift
                let instructions = route.instructions;
                if ((instructions[0].startTime < time) && (instructions[instructions.length - 1].startTime > time)) {
                    // If time is within timespan of route
                    return false;
                }
            }
        }
        return true;
    }
    static getAvailableForkliftIds(data: DataContainer, time: number): string[] {
        let output = [];
        for (let id in data.forklifts) {
            if (Forklift.isAvailble(data, id, time)) {
                output.push(id);
            }
        }
        return output;
    }
    static getHomeVertexId(data: DataContainer, forkliftId: string, time: number): string {
        for (let v of Vertex.getAllAvailable(data, time)) {
            if (Vertex.getType(data, v) === VertexTypes.charge) return v;
        }
        return undefined;
    }
}
