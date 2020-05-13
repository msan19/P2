/**
 * Test of handleLockOrder
 * @packageDocumentation
 * @category Test
 */
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

describe("Test getRoute for movePallet order type, i.e. test of createMovePalletInstructions", () => {
    let bestRouteSetgraph = Graph.parse(createGraph());

    context("when all vertices in route are unique", () => {
        let vertexIds = ["N0-1", "N0-2", "N0-3", "N0-4", "N0-5", "N0-6", "N0-7"];
        let visitTimes = [30000, 31000, 32000, 33000, 34000, 35000, 36000];

        let data: DataContainer = new DataContainer();
        data.warehouse = new Warehouse(Graph.parse(createGraph()), 15);;
        let routeScheduler = new RouteScheduler(data);


        routeScheduler.bestRouteSet = new RouteSet(["O1"], bestRouteSetgraph);
        routeScheduler.bestRouteSet.duration = [6000];

        let order = new Order("O1", Order.types.movePallet, "F1", "P1", "N0-1", "N0-7", 30000, Order.timeTypes.start, 3);
        routeScheduler.data.addOrder(order);

        setVisitTimes(routeScheduler.bestRouteSet.graph, vertexIds, visitTimes);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIds, "F1", visitTimes);

        let resultingRoute = routeScheduler.handleLockOrder("O1");
        let expectedRoute = createMovePalletRoute(routeScheduler, order, vertexIds, "RO1", "F1", visitTimes);
        it(`Should be ${expectedRoute}`, () => {
            expect(resultingRoute).eql(expectedRoute);
        });
    });

    context("when route visits same vertex more than once", () => {
        let vertexIds = ["N5-1", "N5-2", "N5-3", "N5-4", "N5-3"];
        let visitTimes = [30000, 31000, 32000, 33000, 34000];

        let data: DataContainer = new DataContainer();
        data.warehouse = new Warehouse(Graph.parse(createGraph()), 15);;
        let routeScheduler = new RouteScheduler(data);

        routeScheduler.bestRouteSet = new RouteSet(["O2"], bestRouteSetgraph);
        routeScheduler.bestRouteSet.duration = [4000];

        let order = new Order("O2", Order.types.movePallet, "F2", "P2", "N5-1", "N5-3", 30000, Order.timeTypes.start, 3);
        routeScheduler.data.addOrder(order);

        setVisitTimes(routeScheduler.bestRouteSet.graph, vertexIds, visitTimes);
        createScheduleItems(routeScheduler.bestRouteSet, vertexIds, "F2", visitTimes);

        let resultingRoute = routeScheduler.handleLockOrder("O2");
        let expectedRoute = createMovePalletRoute(routeScheduler, order, vertexIds, "RO2", "F2", visitTimes);
        it(`Should be ${expectedRoute}`, () => {
            expect(resultingRoute).eql(expectedRoute);
        });
    });
});

describe("Test getRoute for moveForklift order type, i.e. test of createMoveInstructions", () => {
    let vertexIds = ["N5-1", "N5-2", "N5-3", "N5-4", "N5-5"];
    let visitTimes = [30000, 31000, 32000, 33000, 34000];

    let data: DataContainer = new DataContainer();
    data.warehouse = new Warehouse(Graph.parse(createGraph()), 15);;
    let routeScheduler = new RouteScheduler(data);

    let bestRouteSetgraph = Graph.parse(createGraph());
    routeScheduler.bestRouteSet = new RouteSet(["O3"], bestRouteSetgraph);
    routeScheduler.bestRouteSet.duration = [4000];

    let order = new Order("O3", Order.types.moveForklift, "F3", "P3", "N5-1", "N5-5", 30000, Order.timeTypes.start, 3);
    routeScheduler.data.addOrder(order);

    setVisitTimes(routeScheduler.bestRouteSet.graph, vertexIds, visitTimes);
    createScheduleItems(routeScheduler.bestRouteSet, vertexIds, "F3", visitTimes);

    let resultingRoute = routeScheduler.handleLockOrder("O3");
    let expectedRoute = createMoveForkliftRoute(routeScheduler, order, vertexIds, "RO3", "F3", visitTimes);
    it(`Should be ${expectedRoute}`, () => {
        expect(resultingRoute).eql(expectedRoute);
    });
});



/* Auxiliary functions */
function setVisitTimes(graph: Graph, vertexIds: string[], visitTimes: number[]) {
    for (let i = 0; i < visitTimes.length; i++) {
        graph.vertices[vertexIds[i]].visitTime = visitTimes[i];
    }
}

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
    firstScheduleItem.setNext(secondScheduleItem);

    for (let j = 1; j < verticeIdList.length - 1; j++) {
        let previousVertex = routeSet.graph.vertices[verticeIdList[j - 1]];
        let previousScheduleItem = getScheduleItem(previousVertex, visitTimeArray[j - 1]);

        let currentVertex = routeSet.graph.vertices[verticeIdList[j]];
        let currentScheduleItem = getScheduleItem(currentVertex, visitTimeArray[j]);

        currentScheduleItem.setPrevious(previousScheduleItem);

        if (j !== verticeIdList.length - 1) {
            let nextVertex = routeSet.graph.vertices[verticeIdList[j + 1]];
            let nextScheduleItem = getScheduleItem(nextVertex, visitTimeArray[j + 1]);
            currentScheduleItem.setNext(nextScheduleItem);
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

function createMoveForkliftRoute(routeScheduler: RouteScheduler, order: Order, vertexId: string[], routeId: string, forkliftId: string, visitTimes: number[]): Route {
    let instructions: Instruction[] = [];

    let currentVertex = routeScheduler.bestRouteSet.graph.vertices[vertexId[0]];
    let currentScheduleItem = getScheduleItem(currentVertex, visitTimes[0]);
    for (let i = 0; i < vertexId.length; i++) {
        let instructionType;
        if (i === vertexId.length - 1) {
            instructionType = Instruction.types.sendFeedback;
        } else {
            instructionType = Instruction.types.move;
        }
        let newInstruction = new Instruction(instructionType, vertexId[i], currentScheduleItem.arrivalTimeCurrentVertex);
        instructions.push(newInstruction);
        currentScheduleItem = currentScheduleItem.nextScheduleItem;
    }

    return new Route(routeId, order.palletId, forkliftId, order.id, 1, instructions);
}