// route.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import { RouteSet } from "../planningScheduler/classes/routeSet";


/** An enum of possible states used to describe a route */
enum RouteStatus {
    queued = 1,
    inProgress,
    completed,
    failed,
}

/** An enum of possible types of {@link Instruction} */
enum InstructionType {
    move = 1,
    unloadPallet,
    loadPallet,
    charge,
    wait,
    sendFeedback,
}

/** An instruction for a forklift */
export class Instruction {

    /** Static types of instructions */
    static types = InstructionType;

    /** The type of the instruction */
    type: InstructionType;

    /** The id of the vertex at which the forklift is at the {@link startTime} */
    vertexId: string;

    /** The starting time of the instruction */
    startTime: number;

    constructor(type: InstructionType, vertexId: string, startTime: number) {
        this.type = type;
        this.vertexId = vertexId;
        this.startTime = startTime;
    }

    /** 
     * Parses into Instruction
     * @param instruction Object that should be parsed to Instruction
     * @returns An Instruction if possible else null
     */
    static parse(instruction: any): Instruction | null {

        if (typeof (Instruction.types[instruction.type]) === "undefined") return null;

        if (typeof (instruction.vertexId) !== "string" || instruction.vertexId.length === 0) return null;

        // Implement checking of valid ids?
        if (typeof (instruction.startTime) !== "number") return null;
        return new Instruction(instruction.type, instruction.vertexId, instruction.startTime);
    }

    /** 
     * Parses into an array of Instructions 
     * @param instructions What should be parsed
     * @returns An array of Instructions if possible else null
     */
    static parseMultiple(instructions: any): Instruction[] | null {
        let newInstructionSet: Instruction[] = [];

        if (!Array.isArray(instructions)) return null;

        for (let instruction of instructions) {
            let newInstruction = Instruction.parse(instruction);

            if (newInstruction === null) return null;
            else newInstructionSet.push(newInstruction);
        }

        return newInstructionSet;
    }
}

/** A route containing an array of Instructions */
export class Route {
    static Statuses = RouteStatus;

    jsonPublicKeys = ["routeId", "forkliftId", "orderId", "status", "instructions"];

    /** An id for the route */
    routeId: string;

    palletId: string;

    forkliftId: string;

    /** An id for the order */
    orderId: string;

    /** The status of the route */
    status: RouteStatus;

    /** An array of instructions */
    instructions: Instruction[];

    constructor(routeId: string, forkliftId: string, orderId: string, status: RouteStatus, instructions: Instruction[]) {
        this.routeId = routeId;
        this.forkliftId = forkliftId;
        this.orderId = orderId;
        this.status = status;
        this.instructions = instructions;
    }

    /** 
     * Parses into a Route
     * @param route What should be parsed
     * @returns A Route if possible else null
     */
    static parse(route: any): Route | null {
        if (typeof (route.routeId) !== "string") return null;
        if (typeof (route.forkliftId) !== "string") return null;
        if (typeof (route.orderId) !== "string") return null;
        // Implement checking of valid ids?
        if (typeof (route.status) !== "number") return null;
        let parsedInstructions = Instruction.parseMultiple(route.instructions);
        if (parsedInstructions === null) return null;

        return new Route(route.routeId, route.forkliftId, route.orderId, route.RouteStatus, parsedInstructions);
    }

    /** 
     * Parses into an array of Routes
    * @param routes What should be parsed
    * @returns An array of Routes if possible else null
    */
    static parseMultiple(routes: any[]): Route[] | null {
        let newRouteSet: Route[] = [];

        if (!Array.isArray(routes)) return null;

        for (let route of routes) {
            let newRoute = Route.parse(route);

            if (newRoute === null) return null;
            else newRouteSet.push(newRoute);
        }

        return newRouteSet;
    }
}
