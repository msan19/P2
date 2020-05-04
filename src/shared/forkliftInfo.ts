// forkliftInfo.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import { Vector2 } from "./vector2";

export enum ForkliftStates {
    idle = 1,
    hasOrder,
    charging,
    initiating
}

export class ForkliftInfo {
    static states = ForkliftStates;
    jsonPublicKeys = ["id", "batteryStatus", "position", "state", "palletId"];

    id: string;
    batteryStatus: number;
    position: Vector2;
    state: ForkliftStates;
    palletId: string;
}