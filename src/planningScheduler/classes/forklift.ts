import { Route } from "./route";

export class Forklift {
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    send(route: Route): void {

    }
    static parse(obj: any): Forklift | null {
        return null;
    }
    putData(obj: any): void {

    }
}
