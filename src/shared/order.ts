// order.ts
/**
 * @packageDocumentation
 * @category Shared
 */

/** An enum of posible types of {@link Order} */
export enum OrderTypes {
    movePallet = 1,
    moveForklift,
    charge
}

/** An enum of posible types of time specification */
export enum TimeType {
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

    jsonPublicKeys = ["id", "timeType", "time", "type", "forkliftId", "palletId", "startVertexId", "endVertexId"];

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

    /** Number of times the order can be delayed before being dropped */
    delayCounter: number;

    constructor(orderId: string, type: OrderTypes, forkliftId: string, palletId: string,
        startVertexId: string, endVertexId: string, time: number, timeType: TimeType, delayCounter: number) {
        this.id = orderId;
        this.type = type;
        this.forkliftId = forkliftId;
        this.palletId = palletId;
        this.startVertexId = startVertexId;
        this.endVertexId = endVertexId;
        this.time = time;
        this.timeType = timeType;
        this.delayCounter = delayCounter;
    }

    /**
     * Creates an {@link Order} containing the content of the parameter object obj
     * @param obj An object to be parsed
     * @param _ An unused parameter required to extend the class 
     * by identification strings in obj
     * @returns A new {@link Order} if the content of the parameter object is legal or null otherwise
     */
    static parse(obj: any, _?: any): Order | null {
        // Check for types of necessary fields
        if (typeof (obj.id) !== "string") return null;
        if (typeof (obj.forkliftId) !== "string" && obj.forkliftId !== null) return null;
        if (typeof (obj.palletId) !== "string") return null;
        if (typeof (obj.startVertexId) !== "string") return null;
        if (typeof (obj.endVertexId) !== "string") return null;

        // Valid id (cannot exist previously)

        // Check for valid type
        if (typeof (Order.types[obj.type]) === "undefined") return null;

        // Check for forkliftId when moveForklift or charge
        if ((obj.type === Order.types.moveForklift || obj.type === Order.types.charge) && obj.forkliftId === null) return null;

        // Check for valid timeType
        /*obj.timeType = Number(obj.timeType);
        if (typeof (Order.timeTypes[obj.timeType]) === "undefined") return null;*/

        // Check for valid time
        obj.time = Number(obj.time);
        if (isNaN(obj.time)) return null;

        // Check for valid delayCounter
        obj.delayCounter = Number(obj.delayCounter);
        if (isNaN(obj.delayCounter)) obj.delayCounter = 0;

        return new Order(obj.id, obj.type, obj.forkliftId, obj.palletId, obj.startVertexId, obj.endVertexId, obj.time, obj.timeType, obj.delayCounter);
    }
}
