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