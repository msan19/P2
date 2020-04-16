import { DataContainer } from "../planningScheduler/classes/dataContainer";

/** An enum of posible types of {@link Order} */
enum OrderTypes {
    movePallet = 1,
    moveForklift,
    charge
}

/** An enum of posible types of time specification */
enum TimeType {
    start = 1,
    end
}

/**
 * An {@link Order} speficying a task to be carried out by a forklift
 */
export class Order {

    /** A reference to the entire enum of OrderTypes */
    static types = OrderTypes;

    /** A reference to the entire enum of OrderTypes */
    static timeTypes = TimeType;

    /** An identification string for the {@link Order} */
    id: string;

    /** An enum specifying the type of time */
    timeType: TimeType;

    /** A number representing the epoch time in miliseconds */
    time: number;

    /** An enum specifying the type of {@link Order} */
    type: OrderTypes;

    /** An identification string for the forklift assigned to the {@link Order}, null for movePallet a {@link Order} */
    forkliftId: string;

    /** An identification string for the pallet to be moved, 
     * only used for movePallet a {@link Order}, null otherwise */
    palletId: string;

    /** An identification string for the {@link Vertex} position of the pallet in a movePallet {@link Order}, null otherwise */
    startVertexId: string;

    /** An identification string for the {@link Vertex} at which the forklift should drive to */
    endVertexId: string;

    constructor(orderId: string, type: OrderTypes, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string) {
        this.id = orderId;
        this.type = type;
        this.forkliftId = forkliftId;
        this.palletId = palletId;
        this.startVertexId = startVertexId;
        this.endVertexId = endVertexId;
    }

    /**
     * Creates an {@link Order} containing the content of the parameter object obj
     * @param obj An object to be parsed
     * @param data A DataContainer used to verify the existance of object speficied 
     * by identification strings in obj
     * @returns A new {@link Order} if the content of the parameter object is legal or null otherwise
     */
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
