/**
 *  Returns a random key from the set
 * @param set An object or array
 */
export function randomKey(set: Object | any[]) {
    let keys = Object.keys(set); // Returns an array of every valid key for both arrays and objects
    return keys[Math.floor(Math.random() * keys.length)];
}

/**
 *  Returns a random value from the set
 * @param set An object or array
 */
export function randomValue(set: Object | any[]) {
    return set[randomKey(set)];
}


/**
 * Returns a random integer in min<=output<=max
 * @param min The smallest integer that can be returned
 * @param max The largest integer that can be returned
 */
export function randomIntegerInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Used for extending from multiple classes
 * Source: https://www.typescriptlang.org/docs/handbook/mixins.html
 * @param derivedCtor Class that should inherit from baseCtors
 * @param baseCtors An array of classes, that will be inherited into derivedCtor
 */
export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}

function jsonReplacer(key, value) {
    if (value === null) return value;
    if (typeof (value) === "object") {

        let publicKeys = value["jsonPublicKeys"];
        if (!Array.isArray(publicKeys)) publicKeys = Object.keys(value);

        if (Array.isArray(value)) { // If array
            let output = [];
            for (let publicKey of publicKeys) {
                output[publicKey] = jsonReplacer(publicKey, value[publicKey]);
            }
        } else { // If generic object
            let output = {};
            for (let publicKey of publicKeys) {
                output[publicKey] = jsonReplacer(publicKey, value[publicKey]);
            }
            return output;
        }
    }

    return value;
}

export function stringifyObject(obj: any) {
    return JSON.stringify(obj, jsonReplacer);
}

class PreviousReferences {
    original: any;
    copy: any;
    previous: PreviousReferences | null;

    constructor(original: any = null, copy: any = null, previous: any = null) {
        this.original = original;
        this.copy = copy;
        this.previous = previous;
    }

    createNext(original: any, copy: any) {
        return new PreviousReferences(original, copy, this);
    }

    findByOriginal(original: any) {
        if (this.original === original) return this;
        if (this.previous) return this.previous.findByOriginal(original);
        return null;
    }
}

export function deepCopy<T>(obj: T, refManager: PreviousReferences = new PreviousReferences()): T {
    switch (typeof (obj)) {
        case "bigint":
        case "boolean":
        case "function":
        case "number":
        case "string":
        case "symbol":
        case "undefined":
            return obj;
        case "object":
            if (obj === null) return null;

            // Detect circular references
            let prevRef = refManager.findByOriginal(obj);
            if (prevRef !== null) return prevRef.copy;

            // Instantiate output as array or object, depending on type of obj
            let output;
            if (Array.isArray(obj)) output = [];
            else {
                // Create new instance of same class
                function ctor() { }
                ctor.prototype = obj;
                output = new ctor();
            }

            // Deep copy values
            for (let key in obj) {
                output[key] = deepCopy(obj[key], refManager.createNext(obj, output));
            }
            return output;
        default:
            throw `Unknown type '${typeof (obj)}' in deepCopy`;
    }
}