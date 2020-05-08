import { Order as Order_Shared, OrderTypes, TimeType } from "../../shared/order";
import { DataContainer } from "./dataContainer";

function superCastOrder(order: Order_Shared): Order {
    let output = new Order(order.id, order.type, order.forkliftId, order.palletId, order.startVertexId,
        order.endVertexId, order.time, order.timeType, order.delayMax);
    return output;
}

export class Order extends Order_Shared {

    constructor(orderId: string, type: OrderTypes, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string, time: number, timeType: TimeType, delayMax: number) {
        super(orderId, type, forkliftId, palletId, startVertexId, endVertexId, time, timeType, delayMax);
    }

    /**
     * Creates an {@link Order} containing the content of the parameter object obj
     * @param obj An object to be parsed
     * @param data A DataContainer used to verify the existance of object speficied 
     * by identification strings in obj
     * @returns A new {@link Order} if the content of the parameter object is legal or null otherwise
     */
    static parse(obj: any, data: DataContainer): Order | null {
        // Parse what is unrelated to DataContainer
        let order = Order_Shared.parse(obj);
        if (order === null) return null;

        // Ensure that the forkliftId exists in dataContainer if the type of order requires a forklift (moveForklift, charge)
        if (order.type !== Order.types.movePallet && (order.forkliftId && !data.forklifts[order.forkliftId])) return null;

        // Check for valid vertixIds. Depending on type of order only endVertex is needed
        let keysVertices: string[] = Object.keys(data.warehouse.graph.vertices);
        if ((order.type === Order.types.movePallet && !keysVertices.includes(obj.startVertexId)) || !keysVertices.includes(obj.endVertexId)) {
            return null;
        }

        return superCastOrder(order);
    }

    delayStartTime(baseDelayTime: number) {
        if (this.delayCounter >= this.delayMax) return false;

        // delayCounter is more than 0

        this.time += baseDelayTime * 2 ** this.delayCounter;
        this.delayCounter++;
        return true;
    }

}