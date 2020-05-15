/**
 * @packageDocumentation
 * @category Shared
 */

import { Vector2 } from "./vector2";

/**
 * Each {@link ForkliftStates} enumerator is equivalent to an integer representation of a state i.e. what a {@link Forklift} is doing.
 */
export enum ForkliftStates {
    idle = 1,
    hasOrder,
    charging,
    initiating
}
/**
 * The {@link ForkliftInfo} object has the sole objective of storing information about a {@link Forklift} object
 */
export class ForkliftInfo {
    static states = ForkliftStates;
    jsonPublicKeys = ["id", "batteryStatus", "position", "state", "palletId"];

    id: string;
    batteryStatus: number;
    position: Vector2;
    state: ForkliftStates;
    palletId: string;
}