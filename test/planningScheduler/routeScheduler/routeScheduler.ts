/**
 * Test of routeScheduler 
 * @packageDocumentation
 * @category Test
 */

import { expect } from 'chai';
import 'mocha';

import { Graph, ScheduleItem } from '../../../src/planningScheduler/classes/graph';
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

function testRouteScheduler(): void {
    // Test for assignForklift
    describe(`Test for method assignForklift from object RouteScheduler`, () => {
        // No assignable forklifts
        describe(`Test with no assignable forklifts`, () => {
            let routeSet: RouteSet = initRouteSet();
            let routeScheduler: RouteScheduler = initRouteScheduler();

            let order: Order = new Order("O0", Order.types.moveForklift, "F23", "P23", "N1-2", "N8-9", 400, Order.timeTypes.start, 3);

            let expected = [];
            let result = routeScheduler.assignForklift(routeSet, order);

            // Empty arrays have length 0
            it(`Expected is ${expected.length} and the result is ${result.length}`, () => {
                expect(result.length).to.equal(expected.length);
            });
        });

        // All assignable forklifts
        it(`Test with all assignable forklifts`, () => {
            let routeSet: RouteSet = initRouteSet();
            let routeScheduler: RouteScheduler = initRouteScheduler();

            let order: Order = new Order("O0", Order.types.moveForklift, "", "P23", "N1-2", "N8-9", 100000, Order.timeTypes.start, 3);

            // Set idlePositions of routeSet made of a dict of forkliftId : ScheduleItems pairs
            routeSet.graph.idlePositions["F23"] = new ScheduleItem("F23", 1400, "N0-0");
            //console.log(routeSet.graph.idlePositions);
            let expected = [];
            expected.push(new ScheduleItem("F23", 1400, "N0-0"));
            let result = routeScheduler.assignForklift(routeSet, order);

            // Empty arrays have length 0
            expect(result).to.be.eql(expected);
        });

        // Mix of assignable and non-assignable forklifts
        describe(``, () => {

        });

        // Test of the sorting
        describe(``, () => {

        });


    });

}

describe(`Test of object RouteScheduler`, testRouteScheduler);
