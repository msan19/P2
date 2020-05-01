import { Order as Order_Shared, OrderTypes } from "../../shared/order";
import { DataContainer } from "./dataContainer";

export class Order extends Order_Shared {

    constructor(orderId: string, type: OrderTypes, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string) {
        super(orderId, type, forkliftId, palletId, startVertexId, endVertexId);

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

        // Check for valid forkliftId
        if (obj.forkliftId !== null) {
            let present: boolean = false;
            let keysForklifts: string[] = Object.keys(data.forklifts);
            for (let i = 0; i < keysForklifts.length; i++) {
                if (obj.forkliftId === data.forklifts[keysForklifts[i]].id) {
                    present = true;
                    break;
                }
            }
            if (!present) return null;
        }

        // Check for valid vertixIds (If either is invalid, return null)
        let keysVertices: string[] = Object.keys(data.warehouse.graph.vertices);
        if (!keysVertices.includes(obj.startVertexId) || !keysVertices.includes(obj.endVertexId)) return null;

        return order;
    }

}