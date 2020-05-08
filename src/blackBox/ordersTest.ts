/**
 * @packageDocumentation
 * @category BlackBox
 */

import { Order } from "../shared/order";

export class OrderTester {
    timeOfCreation: number;
    timeOffset: number;
    matrixOfStartVertexIds: string[][];
    matrixOfEndVertexIds: string[][];
    matrixOfTypesOfOrders: number[][];

    constructor(timeOfCreation, timeOffset) {
        this.timeOfCreation = timeOfCreation;
        this.timeOffset = timeOffset;

        this.matrixOfStartVertexIds = [
            // O0, O1,  O2,  O3,  O4,  O5,  O6,  O7,  O8,  O9
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 0
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 1
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 2
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 3
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 4
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 5
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 6
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 7
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 8
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N']      // Forklift 9
        ];

        this.matrixOfEndVertexIds = [
            // O0, O1,  O2,  O3,  O4,  O5,  O6,  O7,  O8,  O9
            ['N8-5', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 0
            ['N1-0', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 1
            ['N9-9', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 2
            ['N5-6', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 3
            ['N6-5', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 4
            ['N3-9', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 5
            ['N7-4', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 6
            ['N2-8', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 7
            ['N2-4', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],     // Forklift 8
            ['N0-7', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N']      // Forklift 9
        ];

        let F = Order.types.moveForklift;
        let P = Order.types.movePallet;
        let C = Order.types.charge;
        this.matrixOfTypesOfOrders = [

            // O0, O1,  O2,  O3,  O4,  O5,  O6,  O7,  O8,  O9
            [F],     // Forklift 0
            [F],     // Forklift 1
            [F],     // Forklift 2
            [F],     // Forklift 3
            [F],     // Forklift 4
            [F],     // Forklift 5
            [F],     // Forklift 6
            [F],     // Forklift 7
            [F],     // Forklift 8
            [F]      // Forklift 9
        ];

    }

    generateOrder(forkliftIndex: number, orderIndex: number) {
        return new Order(
            `${orderIndex}F${forkliftIndex}`,                           // id
            this.matrixOfTypesOfOrders[forkliftIndex][orderIndex],      // type of order
            `F${forkliftIndex}`,                                        // forklift id
            `P14`,                                                      // pallet id
            this.matrixOfStartVertexIds[forkliftIndex][orderIndex],     // start vertex id
            this.matrixOfEndVertexIds[forkliftIndex][orderIndex],       // end vertex id
            this.timeOfCreation + this.timeOffset * orderIndex,         // time
            Order.timeTypes.start,                                      // type of time (must always be start)
            0                                                           // maximum number of delays (should be 0)
        );
    }
}