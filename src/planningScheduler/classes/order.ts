import { DataContainer } from "./dataContainer";
import { type } from "os";

export enum OrderTypes {
    movePallet = 1,
    moveForklift,
    charge
}

export class Order {
    static types = OrderTypes;
    orderId: string;
    type: OrderTypes;
    forkliftId: string;
    palletId: string;
    startVertexId: string;
    endVertexId: string;

    constructor(orderId: string, type: OrderTypes, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string) {
        this.orderId = orderId;
        this.type = type;
        this.forkliftId = forkliftId;
        this.palletId = palletId;
        this.startVertexId = startVertexId;
        this.endVertexId = endVertexId;
    }

    static parse(obj: any, data: DataContainer): Order | null {
        // Check for types of necessary fields
        if (typeof (obj.orderId) !== "string") return null;
        if (typeof (obj.type) !== "number") return null;
        if (typeof (obj.forkliftId) !== "string") return null;
        if (typeof (obj.palletId) !== "string") return null;
        if (typeof (obj.startVertexId) !== "string") return null;
        if (typeof (obj.endVertexId) !== "string") return null;

        // Valid orderId (cannot exist previously)

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

        return new Order(obj.orderId, obj.type, obj.forkliftId, obj.palletId, obj.startVertexId, obj.endVertexId);
    }
}
