import { DataContainer } from "../planningScheduler/classes/dataContainer";

enum OrderTypes {
    movePallet = 1,
    moveForklift,
    charge
}

export class Order {
    static types = OrderTypes;
    id: string;
    type: OrderTypes;
    forkliftId: string;
    palletId: string;
    startVertexId: string;
    endVertexId: string;

    constructor(orderId: string, type: OrderTypes, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string) {
        this.id = orderId;
        this.type = type;
        this.forkliftId = forkliftId;
        this.palletId = palletId;
        this.startVertexId = startVertexId;
        this.endVertexId = endVertexId;
    }

    static parse(obj: any, data: DataContainer): Order | null {
        // Check for types of necessary fields
        if (typeof (obj.id) !== "string") return null;
        if (typeof (obj.type) !== "number") return null;
        if (typeof (obj.forkliftId) !== "string") return null;
        if (typeof (obj.palletId) !== "string") return null;
        if (typeof (obj.startVertexId) !== "string") return null;
        if (typeof (obj.endVertexId) !== "string") return null;

        // Valid id (cannot exist previously)

        // Check for valid vertixIds (If either is invalid, return null)
        let keysVertices: string[] = Object.keys(data.warehouse.graph.vertices);
        if (!keysVertices.includes(obj.startVertexId) || !keysVertices.includes(obj.endVertexId)) return null;

        // Check for valid forkliftId
        let present: boolean = false;
        let keysForklifts: string[] = Object.keys(data.forklifts);
        for (let i = 0; i < keysForklifts.length; i++) {
            if (obj.forkliftId === data.forklifts[keysForklifts[i]].id) present = true;
        }
        if (!present) return null;

        // Check for valid type
        if (typeof (Order.types[obj.type]) === "undefined") return null;

        return new Order(obj.id, obj.type, obj.forkliftId, obj.palletId, obj.startVertexId, obj.endVertexId);
    }
}
