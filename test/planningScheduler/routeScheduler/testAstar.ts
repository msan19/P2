// testAstar.ts
/**
 * Test of A* ({@link RouteScheduler.planOptimalRoute})
 * @packageDocumentation
 * @category Test
 */

import { expect } from 'chai';
import 'mocha';

import { Vertex, Graph, ScheduleItem } from '../../../src/planningScheduler/classes/graph';
import { createGraph } from '../../../src/blackBox/warehouse';
import { Order } from '../../../src/planningScheduler/classes/order';
import { RouteScheduler } from '../../../src/planningScheduler/routeScheduler';
import { DataContainer } from '../../../src/planningScheduler/classes/dataContainer';
import { RouteSet } from '../../../src/planningScheduler/classes/routeSet';
import { Warehouse } from '../../../src/planningScheduler/classes/warehouse';

function initRouteSet() {
    let graph: Graph = Graph.parse(createGraph());
    return new RouteSet([], graph);
}

function initRouteScheduler() {
    let graph: Graph = Graph.parse(createGraph());
    let warehouse = new Warehouse(graph, 15);
    let data: DataContainer = new DataContainer();
    data.warehouse = warehouse;
    return new RouteScheduler(data);
}

describe(`Test of A* algorithm`, () => {
    /*describe(`Test of A* with Graph from createGraph input`, () => {
        let graph: Graph = createGraph();
        let routeSet: RouteSet = new RouteSet([], graph);
        let warehouse = new Warehouse(graph, 15);
        let data: DataContainer = new DataContainer();
        data.warehouse = warehouse;
        let routeScheduler: RouteScheduler = new RouteScheduler(data);
        let order: Order = new Order("O0", Order.types.moveForklift, "F23", "P23", "N1-2", "N8-9");
        order.timeType = Order.timeTypes.start;
        order.time = 134513;
        let expectedRouteLength: number = 14;

        routeScheduler.planOptimalRoute(routeSet, order, "F0");

        checkLength(graph.vertices[order.endVertexId].g(order.startVertexId), expectedRouteLength);
    });*/

    describe(`Make A* great again!`, () => {
        // Creating necessary objects
        let routeSet: RouteSet = initRouteSet();
        let routeScheduler: RouteScheduler = initRouteScheduler();

        // Orders and such
        let order: Order = new Order("O0", Order.types.moveForklift, "F23", "P23", "N1-2", "N8-9", 400, Order.timeTypes.start, 3);

        let orderAnnoying: Order = new Order("O1", Order.types.moveForklift, "F24", "P24", "N0-3", "N5-8", 400, Order.timeTypes.start, 3);

        routeScheduler.planOptimalRoute(routeSet, order.startVertexId, order.endVertexId, order.time, "F23");
        routeScheduler.planOptimalRoute(routeSet, orderAnnoying.startVertexId, orderAnnoying.endVertexId, orderAnnoying.time, "F24");

        //console.log(`\n\n Length Red:  ${routeSet.graph.vertices[order.endVertexId].g(order.startVertexId)}`);
        //console.log(`\n\n Length Blue: ${routeSet.graph.vertices[orderAnnoying.endVertexId].g(orderAnnoying.startVertexId)}`);
    });

    it(`Test arrival time`, () => {
        let routeSet: RouteSet = initRouteSet();
        let routeScheduler: RouteScheduler = initRouteScheduler();

        // Init scheduleItems
        let vertex1: Vertex = routeScheduler.data.warehouse.graph.vertices["N0-0"];
        let vertex2: Vertex = routeScheduler.data.warehouse.graph.vertices["N0-1"];

        vertex1.scheduleItems.push(new ScheduleItem("F0", 400, vertex1.id));
        vertex1.scheduleItems.push(new ScheduleItem("F1", 30400, vertex1.id));
        vertex1.scheduleItems.push(new ScheduleItem("F2", 62480, vertex1.id));

        vertex2.scheduleItems.push(new ScheduleItem("F4", 400, vertex2.id));
        vertex2.scheduleItems.push(new ScheduleItem("F0", 30400, vertex2.id));
        vertex2.scheduleItems.push(new ScheduleItem("F1", 70400, vertex2.id));

        // Link shit
        vertex1.scheduleItems[0].linkNext(vertex2.scheduleItems[1]);
        vertex1.scheduleItems[1].linkNext(vertex2.scheduleItems[2]);

        // Test the shit
        let results: number[] = [];
        let expecteds: number[] = [];

        results.push(routeScheduler.getArrivalTime(vertex1, vertex2, 0, false, "F0"));
        results.push(routeScheduler.getArrivalTime(vertex1, vertex2, 401, false, "F1"));
        results.push(routeScheduler.getArrivalTime(vertex1, vertex2, 30401, false, "F2"));
        results.push(routeScheduler.getArrivalTime(vertex1, vertex2, 62481, true, "F1"));

        expecteds.push(Infinity);
        expecteds.push(30400 + 30000 / 2);
        expecteds.push(30400 + 30000 / 2);
        expecteds.push(70400 + 30000 / 2);

        expect(results).to.be.eql(expecteds);
    });
});