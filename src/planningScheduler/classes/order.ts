import { DataContainer } from "./dataContainer";
import { type } from "os";

export enum OrderTypes {
    movePallet = 1,
    moveForklift,
    charge,
}

export class Order {
    static types = OrderTypes;
    type: OrderTypes;
    forkliftId: string;
    palletId: string;
    startVertexId: string;
    endVertexId: string;

    constructor(type: OrderTypes, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string) {
        this.type = type;
        this.forkliftId = forkliftId;
        this.palletId = palletId;
        this.startVertexId = startVertexId;
        this.endVertexId = endVertexId;
    }

    static parse(obj: any, data: DataContainer): Order | null {
        // Check for types of necessary fields
        if (typeof (obj.type) !== "object" || obj.type === null) return null;
        if (typeof (obj.forkliftId) !== "string") return null;
        if (typeof (obj.palletId) !== "string") return null;
        if (typeof (obj.startVertexId) !== "string") return null;
        if (typeof (obj.endVertexId) !== "string") return null;

        // Check for valid vertixIds (If either is invalid, return null)
        let keys: string[] = Object.keys(data.warehouse.graph.vertices);
        if (!keys.includes(obj.startVertexId) || !keys.includes(obj.endVertexId)) return null;

        // Check for valid forkliftId
        let present: boolean = false;
        for (let i = 0; i < data.forklifts.length; i++) {
            if (obj.forkliftId === data.forklifts[i].id) present = true;
        }
        if (!present) return null;

        // Check for valid type
        if (Object.keys(Order.types).includes(obj.type)) return null;

        return new Order(obj.type, obj.forkliftId, obj.palletId, obj.startVertexId, obj.endVertexId);
    }
}
