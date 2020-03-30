import {Forklift} from "./forklift"

export class DataContainer {
    forklifts:Forklift[] = [];

    orders = [];
    routes:[] = [];
    warehouse = null;

    constructor() {
    }
}