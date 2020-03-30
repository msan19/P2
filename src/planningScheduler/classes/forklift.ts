function newGuid() {
    return "";
}

export class Forklift {
    id:string = newGuid();

    constructor() {
    }  
}

export default {
    Forklift: Forklift
}