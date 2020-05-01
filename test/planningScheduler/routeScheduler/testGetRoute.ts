import { expect } from 'chai';
import 'mocha';

import { DataContainer } from "./../../../src/planningScheduler/classes/dataContainer";
import { RouteScheduler } from "./../../../src/planningScheduler/routeScheduler";
import { createGraph } from "./../../../src/blackBox/warehouse";
import { RouteSet, Route, Instruction } from "./../../../src/shared/route";
import { ScheduleItem, Graph } from '../../../src/shared/graph';
import { Order } from '../../../src/shared/order';
import { Warehouse } from '../../../src/shared/warehouse';

function testGetRoute(): void {
    describe("Test getRoute for movePallet order", () => {
        let data: DataContainer = new DataContainer();
        let warehouseGraph: Graph = createGraph();
        let warehouse = new Warehouse(warehouseGraph, 15);
        data.warehouse = warehouse;

        let routeScheduler = new RouteScheduler(data);
        let bestRouteSetgraph = createGraph();

        let firstOrderId = "O1";
        let secondOrderId = "O2";
        let thirdOrderId = "O3";
        let routePriorities = [firstOrderId, secondOrderId, thirdOrderId];

        routeScheduler.bestRouteSet = new RouteSet(routePriorities, bestRouteSetgraph);

        let firstForkliftId = "F1";
        let secondForkliftId = "F2";
        let thirdForkliftId = "F3";

        routeScheduler.bestRouteSet.assignedForklift[firstOrderId] = firstForkliftId;
        routeScheduler.bestRouteSet.assignedForklift[secondOrderId] = secondForkliftId;
        routeScheduler.bestRouteSet.assignedForklift[thirdOrderId] = thirdForkliftId;

        let vertexIdFirstRoute = [
            "N0-0", "N0-1", "N0-2", "N0-3", "N0-4",
            "N0-5", "N0-6", "N0-7", "N0-8", "N0-9",
            "N1-9", "N1-8", "N1-7"
        ];
        let vertexIdSecondRoute = [
            "N4-7", "N4-8", "N4-9", "N5-9", "N6-9",
            "N6-8"
        ];
        let vertexIdThirdRoute = [
            "N4-3", "N4-2", "N4-1", "N4-0", "N5-0",
            "N6-0", "N7-0", "N7-1", "N7-2"
        ];

        let startTime = 30000;
        let durationFirstRoute = getDuration(startTime, vertexIdFirstRoute);
        let durationSecondRoute = getDuration(startTime, vertexIdFirstRoute);
        let durationThirdRoute = getDuration(startTime, vertexIdFirstRoute);
        let duration = [durationFirstRoute, durationSecondRoute, durationThirdRoute];
        routeScheduler.bestRouteSet.duration = duration;

        createScheduleItems(routeScheduler.bestRouteSet, vertexIdFirstRoute, firstForkliftId, startTime);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIdSecondRoute, secondForkliftId, startTime);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIdThirdRoute, thirdForkliftId, startTime);

        // create order
        data.addOrder(new Order(firstOrderId, Order.types.movePallet, firstForkliftId, "P1", vertexIdFirstRoute[0], vertexIdFirstRoute[12]));
        data.addOrder(new Order(secondOrderId, Order.types.movePallet, secondForkliftId, "P2", vertexIdSecondRoute[0], vertexIdSecondRoute[5]));
        data.addOrder(new Order(thirdOrderId, Order.types.movePallet, thirdForkliftId, "P3", vertexIdThirdRoute[0], vertexIdThirdRoute[8]));


        describe("Test for one scheduleItem at each vertex", () => {
            // give routeScheduler access to the data (it needs access to Orders[])
            let firstOrder = routeScheduler.data.orders[firstOrderId];
            firstOrder.time = startTime;
            routeScheduler.data = data;

            let resultingRoute = routeScheduler.getRoute(firstOrderId);

            let expectedRoute = createMovePalletRoute(routeScheduler, firstOrder, vertexIdFirstRoute, "RO1", "F42");

            // console.log("Expected \n", expectedRoute);
            // console.log("Resulting \n", resultingRoute);

            let expectedLength = expectedRoute.instructions.length;
            let resultingLength = resultingRoute.instructions.length;

            it(`Should be ${expectedLength}`, () => {
                expect(resultingLength).to.equal(expectedLength);
            });

            checkRoute(resultingRoute, expectedRoute);


            // check that the route given by vertexIdFirstRoute is saved to the graph in data.warehouse.graph
            for (let i = 0; i < vertexIdFirstRoute.length; i++) {
                let bestRouteVertex = routeScheduler.bestRouteSet.graph.vertices[vertexIdFirstRoute[i]];
                let warehouseVertex = data.warehouse.graph.vertices[vertexIdFirstRoute[i]];

                let routeSchedulteItem = bestRouteVertex.scheduleItems[0];
                let warehouseScheduleItem = warehouseVertex.scheduleItems[0];

                checkSchedulteItem(routeSchedulteItem, warehouseScheduleItem, vertexIdFirstRoute.length, i);
            }

            // check scheduleItem of vertex that is not in vertexIdFirstRoute
            let warehouseVertex = data.warehouse.graph.vertices["N1-6"];
            expect(warehouseVertex.scheduleItems.length).to.equal(0);

            // check another scheduleItem of vertex that is not in vertexIdFirstRoute
            warehouseVertex = data.warehouse.graph.vertices[vertexIdThirdRoute[4]];
            expect(warehouseVertex.scheduleItems.length).to.equal(0);

        });

        // describe("Test getRoute when there are multiple scheduleItems at a vertex", () => {
        // /// TO DO 
        // });


        // describe("Test getRoute for moveForklift order when there is one scheduleItem at each vertex", () => {
        //     /// TO DO
        // });

    });
};

function checkSchedulteItem(firstScheduleItem: ScheduleItem, secondScheduleitem: ScheduleItem, numberOfVertices: number, scheduleItemIndex: number): void {
    expect(firstScheduleItem.arrivalTimeCurrentVertex).to.equal(secondScheduleitem.arrivalTimeCurrentVertex);
    expect(firstScheduleItem.currentVertexId).to.equal(secondScheduleitem.currentVertexId);

    if (scheduleItemIndex === 0) {
        expect(firstScheduleItem.previousScheduleItem).to.equal(null);
    } else {
        expect(firstScheduleItem.previousScheduleItem.currentVertexId).to.equal(firstScheduleItem.previousScheduleItem.currentVertexId);
    }

    if (scheduleItemIndex === numberOfVertices - 1) {
        expect(firstScheduleItem.nextScheduleItem).to.equal(null);
    } else {
        expect(firstScheduleItem.nextScheduleItem.currentVertexId).to.equal(secondScheduleitem.nextScheduleItem.currentVertexId);
    }
}

function checkRoute(result: Route, expected: Route): void {
    let keys: string[] = Object.keys(expected);
    for (let key of keys) {
        if (key == "instructions") {
            checkInstructions(result[key], expected[key]);
        } else {
            it(`${key}: ${result[key]} should be ${result[key]}`, () => {
                expect(result[key]).to.equal(expected[key]);
            });
        }
    }
}

function checkInstructions(result: Instruction[], expected: Instruction[]): void {
    let length: number = Math.max(result.length, expected.length);
    for (let i = 0; i < length; i++) {
        checkInstruction(result[i], expected[i]);
    }
}

function checkInstruction(result: Instruction, expected: Instruction): void {
    let keys: string[] = Object.keys(expected);
    for (let key of keys) {
        it(`${key}: ${result[key]} should be ${result[key]}`, () => {
            expect(result[key]).to.equal(expected[key]);
        });
    }
}


function getDuration(startTime: number, vertexIds: string[]): number {
    let duration = 0;
    for (let i = 0; i < vertexIds.length; i++) {
        duration += 100;
    }
    return duration;
}

/**
 * 
 * @note The route is added the the firs element in scheduleItems[]. This means that there are
 * not multiple routes in the same scheduleItems-list
 * @param routeSet List of verticeId's
 * @param verticeList 
 * @param forkliftId
 * @param startTime 
 */
function createScheduleItems(routeSet: RouteSet, verticeIdList: string[], forkliftId: string, startTime: number): void {
    // create current scheduleItem
    for (let i = 0; i < verticeIdList.length; i++) {
        let currentVertex = routeSet.graph.vertices[verticeIdList[i]];
        let scheduleItem = new ScheduleItem(forkliftId, startTime + (i + 1) * 100, verticeIdList[i]);
        currentVertex.scheduleItems[0] = scheduleItem;
        //console.log(i, "   \n   ", currentVertex.scheduleItems[0].currentVertexId);
    }

    linkScheduleItems(routeSet, verticeIdList);

}

function linkScheduleItems(routeSet: RouteSet, verticeIdList: string[]): void {
    let firstVertex = routeSet.graph.vertices[verticeIdList[0]];
    let secondVertex = routeSet.graph.vertices[verticeIdList[1]];
    firstVertex.scheduleItems[0].previousScheduleItem = null;
    firstVertex.scheduleItems[0].linkNext(secondVertex.scheduleItems[0]);
    for (let j = 1; j < verticeIdList.length - 1; j++) {
        let previousVertex = routeSet.graph.vertices[verticeIdList[j - 1]];
        let currentVertex = routeSet.graph.vertices[verticeIdList[j]];
        currentVertex.scheduleItems[0].linkPrevious(previousVertex.scheduleItems[0]);
        if (j !== verticeIdList.length - 1) {
            let nextVertex = routeSet.graph.vertices[verticeIdList[j + 1]];
            currentVertex.scheduleItems[0].linkNext(nextVertex.scheduleItems[0]);
        } else {
            console.log("Should not happen.");
        }
    }
}

/**
 * Works when scheduleItems are one scheduleItem in each scheduleItem list (TO DO: make it universal)
 */
function createMovePalletRoute(routeScheduler: RouteScheduler, order: Order, vertexId: string[], routeId: string, forkliftId: string): Route {
    let instructions: Instruction[] = [];

    let currentVertex = routeScheduler.bestRouteSet.graph.vertices[vertexId[0]];
    let currentScheduleItem = currentVertex.scheduleItems[0];
    for (let i = 0; i < vertexId.length; i++) {
        let instructionType;
        if (i === 0) {
            instructionType = Instruction.types.loadPallet;
        } else if (i === vertexId.length - 1) {
            instructionType = Instruction.types.unloadPallet;
        } else {
            instructionType = Instruction.types.move;
        }
        let newInstruction = new Instruction(instructionType, vertexId[i], currentScheduleItem.arrivalTimeCurrentVertex);
        instructions.push(newInstruction);
        currentScheduleItem = currentScheduleItem.nextScheduleItem;
    }

    let lastVertexId = vertexId[vertexId.length - 1];
    let lastVertex = routeScheduler.bestRouteSet.graph.vertices[vertexId[vertexId.length - 1]];
    let lastScheduleItem = lastVertex.scheduleItems[0];
    instructions.push(new Instruction(Instruction.types.sendFeedback, lastVertexId, lastScheduleItem.arrivalTimeCurrentVertex));

    return new Route(routeId, order.palletId, forkliftId, order.id, 1, instructions);
}

function printScheduleItem(routeSet: RouteSet, verticeIdList: string[]): void {
    for (let i = 0; i < verticeIdList.length; i++) {
        console.log("Index:", i);
        let vertex = routeSet.graph.vertices[verticeIdList[i]];
        let scheduleItem = vertex.scheduleItems[0];
        console.log(scheduleItem.currentVertexId);
        console.log("      ", scheduleItem.forkliftId);
        console.log("      ", scheduleItem.arrivalTimeCurrentVertex);

        if (scheduleItem.previousScheduleItem !== null) {
            console.log("      prev:", scheduleItem.previousScheduleItem.currentVertexId);
        } else {
            console.log("      prev:", scheduleItem.previousScheduleItem);
        }

        if (scheduleItem.nextScheduleItem !== null) {
            console.log("      next:", scheduleItem.nextScheduleItem.currentVertexId);
        } else {
            console.log("      next:", scheduleItem.nextScheduleItem);
        }
        console.log("\n");
    }

}

describe("Test of getRoute", testGetRoute);