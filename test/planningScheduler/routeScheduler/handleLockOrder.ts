import { expect } from 'chai';
import 'mocha';

import { DataContainer } from "./../../../src/planningScheduler/classes/dataContainer";
import { RouteScheduler } from "./../../../src/planningScheduler/routeScheduler";
import { createGraph } from "./../../../src/blackBox/warehouse";
import { Route, Instruction } from "./../../../src/shared/route";
import { RouteSet } from "./../../../src/planningScheduler/classes/routeSet";
import { Graph, Vertex, ScheduleItem } from '../../../src/planningScheduler/classes/graph';
import { Order } from '../../../src/planningScheduler/classes/order';
import { Warehouse } from '../../../src/planningScheduler/classes/warehouse';

describe("Test handleLockOrder", () => {
    describe("Test getRoute for movePallet order", () => {
        let data: DataContainer = new DataContainer();
        let warehouseGraph: Graph = Graph.parse(createGraph());
        let warehouse = new Warehouse(warehouseGraph, 15);
        data.warehouse = warehouse;

        let routeScheduler = new RouteScheduler(data);
        let bestRouteSetgraph = Graph.parse(createGraph());

        let firstOrderId = "O1";
        let secondOrderId = "O2";
        let thirdOrderId = "O3";
        let fourthOrderId = "O4";
        let fifthOrderId = "O5";
        let sixthOrderId = "O6";
        let routePriorities = [firstOrderId, secondOrderId, thirdOrderId,
            fourthOrderId, fifthOrderId, sixthOrderId];

        routeScheduler.bestRouteSet = new RouteSet(routePriorities, bestRouteSetgraph);

        let firstForkliftId = "F1";
        let secondForkliftId = "F2";
        let thirdForkliftId = "F3";
        let fourthForkliftId = "F4";
        let fifthForkliftId = "F5";
        let sixthForkliftId = "F6";

        // no overlapping routes
        let vertexIdFirstRoute = [
            "N0-0", "N0-1", "N0-2", "N0-3", "N0-4",
            "N0-5", "N0-6", "N0-7", "N0-8", "N0-9",
            "N1-9", "N1-8", "N1-7"
        ];
        let vertexIdSecondRoute = [
            "N2-7", "N2-8", "N2-9", "N3-9", "N4-9",
            "N4-8"
        ];
        let vertexIdThirdRoute = [
            "N4-3", "N4-2", "N4-1", "N4-0", "N5-0",
            "N6-0", "N7-0", "N7-1", "N7-2"
        ];

        // overlapping routes
        let vertexIdFourthRoute = [
            "N8-7", "N8-8", "N8-9", "N9-9", "N9-8",
            "N9-7", "N9-6", "N9-5", "N0-4"
        ];
        let vertexIdFifthRoute = [
            "N7-9", "N8-9", "N9-9", "N8-9", "N7-9",
            "N6-9", "N5-9", "N4-9", "N3-9", "N2-9"
        ];
        let vertexIdSixthRoute = [
            "N8-2", "N8-1", "N8-0", "N9-0", "N9-1",
            "N9-2", "N9-3", "N9-4", "N9-5", "N9-6",
            "N9-7"
        ];

        let vertexIds = [vertexIdFirstRoute, vertexIdSecondRoute, vertexIdThirdRoute,
            vertexIdFourthRoute, vertexIdFifthRoute, vertexIdSixthRoute];

        // create array of visitTimes
        let defaultStartTime = 30000;
        let visitTimes = []; // two-dimensional array
        for (let i = 0; i < routePriorities.length; i++) {
            let newTimeStamps: number[] = [];
            if (i === vertexIds[i].length - 1) defaultStartTime = 40000;
            for (let j = 0; j < vertexIds[i].length; j++) {
                newTimeStamps[j] = defaultStartTime + (j * 100);
            }
            visitTimes.push(newTimeStamps);
        }

        let duration = [];
        for (let i = 0; i < visitTimes.length; i++) {
            duration.push(getDuration(visitTimes[i]));
        }
        routeScheduler.bestRouteSet.duration = duration;

        createScheduleItems(routeScheduler.bestRouteSet, vertexIdFirstRoute, firstForkliftId, visitTimes[0]);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIdSecondRoute, secondForkliftId, visitTimes[1]);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIdThirdRoute, thirdForkliftId, visitTimes[2]);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIdFourthRoute, fourthForkliftId, visitTimes[3]);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIdFifthRoute, fifthForkliftId, visitTimes[4]);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIdSixthRoute, sixthForkliftId, visitTimes[5]);

        // create movePallet orders
        data.addOrder(new Order(firstOrderId, Order.types.movePallet, firstForkliftId, "P1", vertexIdFirstRoute[0], vertexIdFirstRoute[vertexIdFirstRoute.length - 1], visitTimes[0][0], Order.timeTypes.start, 3));
        data.addOrder(new Order(secondOrderId, Order.types.movePallet, secondForkliftId, "P2", vertexIdSecondRoute[0], vertexIdSecondRoute[vertexIdSecondRoute.length - 1], visitTimes[0][1], Order.timeTypes.start, 3));
        data.addOrder(new Order(thirdOrderId, Order.types.movePallet, thirdForkliftId, "P3", vertexIdThirdRoute[0], vertexIdThirdRoute[vertexIdThirdRoute.length - 1], visitTimes[0][2], Order.timeTypes.start, 3));
        data.addOrder(new Order(fourthOrderId, Order.types.movePallet, fourthForkliftId, "P3", vertexIdFourthRoute[0], vertexIdFourthRoute[vertexIdFourthRoute.length - 1], visitTimes[0][3], Order.timeTypes.start, 3));
        data.addOrder(new Order(fifthOrderId, Order.types.movePallet, fifthForkliftId, "P3", vertexIdFifthRoute[0], vertexIdFifthRoute[vertexIdFifthRoute.length - 1], visitTimes[0][4], Order.timeTypes.start, 3));
        data.addOrder(new Order(sixthOrderId, Order.types.movePallet, sixthForkliftId, "P3", vertexIdSixthRoute[0], vertexIdSixthRoute[vertexIdSixthRoute.length - 1], visitTimes[0][5], Order.timeTypes.start, 3));

        context("Test for one scheduleItem at each vertex", () => {
            // give routeScheduler access to the data (it needs access to Orders[])
            let firstOrder = routeScheduler.data.orders[firstOrderId];
            firstOrder.time = visitTimes[0][0];
            routeScheduler.data = data;

            let resultingRoute = routeScheduler.handleLockOrder(firstOrderId);

            let expectedRoute = createMovePalletRoute(routeScheduler, firstOrder, vertexIdFirstRoute, "RO1", firstForkliftId, visitTimes[0]);

            let expectedLength = expectedRoute.instructions.length;
            let resultingLength = resultingRoute.instructions.length;

            it(`Should be ${expectedLength}`, () => {
                expect(resultingLength).to.equal(expectedLength);
            });

            it(`Should be ${expectedRoute}`, () => {
                expect(resultingRoute).eql(expectedRoute);
            });


            // check that the route given by vertexIdFirstRoute is saved to the graph in data.warehouse.graph
            for (let i = 0; i < vertexIdFirstRoute.length; i++) {
                let bestRouteVertex = routeScheduler.bestRouteSet.graph.vertices[vertexIdFirstRoute[i]];
                let warehouseVertex = data.warehouse.graph.vertices[vertexIdFirstRoute[i]];

                let routeSchedulteItem = bestRouteVertex.scheduleItems[0];
                let warehouseScheduleItem = warehouseVertex.scheduleItems[0];

                it(`${warehouseScheduleItem} should be equal to ${routeSchedulteItem}`, () => {
                    expect(warehouseScheduleItem).eql(routeSchedulteItem);
                });
            }

            // check scheduleItem of vertex that is not in vertexIdFirstRoute
            let warehouseVertex = data.warehouse.graph.vertices["N1-6"];
            it(`${warehouseVertex.scheduleItems.length} should be 0`, () => {
                expect(warehouseVertex.scheduleItems.length).to.equal(0);
            });

            // check another scheduleItem of vertex that is not in vertexIdFirstRoute
            warehouseVertex = data.warehouse.graph.vertices[vertexIdThirdRoute[4]];
            it(`${warehouseVertex.scheduleItems.length} should be 0`, () => {
                expect(warehouseVertex.scheduleItems.length).to.equal(0);
            });

        });

        context("Test getRoute when there are multiple scheduleItems at a vertex", () => {
            let fifthOrder = routeScheduler.data.orders[fifthOrderId];
            fifthOrder.time = visitTimes[4][0];
            routeScheduler.data = data;

            let resultingRoute = routeScheduler.handleLockOrder(fifthOrderId);
            console.log(resultingRoute);

            let expectedRoute = createMovePalletRoute(routeScheduler, fifthOrder, vertexIdFifthRoute, "RO5", fifthForkliftId, visitTimes[4]);

            let expectedLength = expectedRoute.instructions.length;
            let resultingLength = resultingRoute.instructions.length;

            it(`Should be ${expectedLength}`, () => {
                expect(resultingLength).to.equal(expectedLength);
            });

            it(`Should be ${expectedRoute}`, () => {
                expect(resultingRoute).eql(expectedRoute);
            });
        });


        // describe("Test getRoute for moveForklift order when there is one scheduleItem at each vertex", () => {
        //     /// TO DO
        // });

    });
});

function getDuration(visitTime: number[]): number {
    return visitTime[visitTime.length - 1] - visitTime[0];
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
function createScheduleItems(routeSet: RouteSet, verticeIdList: string[], forkliftId: string, visitTimeArray: number[]): void {
    // create current scheduleItem
    let startTime = visitTimeArray[0];
    for (let i = 0; i < verticeIdList.length; i++) {
        let currentVertex = routeSet.graph.vertices[verticeIdList[i]];
        let scheduleItem = new ScheduleItem(forkliftId, visitTimeArray[i], verticeIdList[i]);
        let index = getScheduleItemIndex(currentVertex.scheduleItems, visitTimeArray[i]);
        currentVertex.scheduleItems[index] = scheduleItem;
    }

    linkScheduleItems(routeSet, verticeIdList, visitTimeArray);

}

function linkScheduleItems(routeSet: RouteSet, verticeIdList: string[], visitTimeArray: number[]): void {
    let firstVertex = routeSet.graph.vertices[verticeIdList[0]];
    let secondVertex = routeSet.graph.vertices[verticeIdList[1]];
    let firstScheduleItem = getScheduleItem(firstVertex, visitTimeArray[0]);
    let secondScheduleItem = getScheduleItem(secondVertex, visitTimeArray[1]);
    firstScheduleItem.previousScheduleItem = null;
    firstScheduleItem.linkNext(secondScheduleItem);

    for (let j = 1; j < verticeIdList.length - 1; j++) {
        let previousVertex = routeSet.graph.vertices[verticeIdList[j - 1]];
        let previousScheduleItem = getScheduleItem(previousVertex, visitTimeArray[j - 1]);

        let currentVertex = routeSet.graph.vertices[verticeIdList[j]];
        let currentScheduleItem = getScheduleItem(currentVertex, visitTimeArray[j]);

        currentScheduleItem.linkPrevious(previousScheduleItem);

        if (j !== verticeIdList.length - 1) {
            let nextVertex = routeSet.graph.vertices[verticeIdList[j + 1]];
            let nextScheduleItem = getScheduleItem(nextVertex, visitTimeArray[j + 1]);
            currentScheduleItem.linkNext(nextScheduleItem);
        } else {
            console.log("Should not happen.");
        }
    }
}

function getScheduleItem(vertex: Vertex, time: number): ScheduleItem {
    return vertex.scheduleItems[getScheduleItemIndex(vertex.scheduleItems, time)];
}

// A method from Vertex class
function getScheduleItemIndex(scheduleItems: ScheduleItem[], time: number): number {
    let i = 0, j = scheduleItems.length;

    while (j - i > 1) {
        let pivotPoint = Math.round((i + j) / 2);
        if (scheduleItems[pivotPoint].arrivalTimeCurrentVertex >= time) {
            j = pivotPoint;
        } else {
            i = pivotPoint;
        }
    }

    if ((scheduleItems.length !== 0 && scheduleItems[i].arrivalTimeCurrentVertex >= time)) {
        return j - 1;
    } else {
        return j;
    }
}

/**
 * Works when scheduleItems are one scheduleItem in each scheduleItem list 
 */
function createMovePalletRoute(routeScheduler: RouteScheduler, order: Order, vertexId: string[], routeId: string, forkliftId: string, visitTimes: number[]): Route {
    let instructions: Instruction[] = [];

    let currentVertex = routeScheduler.bestRouteSet.graph.vertices[vertexId[0]];
    let currentScheduleItem = getScheduleItem(currentVertex, visitTimes[0]);
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
    let lastScheduleItem = getScheduleItem(lastVertex, visitTimes[visitTimes.length - 1]);
    instructions.push(new Instruction(Instruction.types.sendFeedback, lastVertexId, lastScheduleItem.arrivalTimeCurrentVertex));

    return new Route(routeId, order.palletId, forkliftId, order.id, 1, instructions);
}


