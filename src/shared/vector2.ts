
/**
 * A {@link Vector2} representing a position in two-dimentional space relative to a center origin point
 */
export class Vector2 {

    /** A number specifying the position on the x-axis */
    x: number;

    /** A number specifying the position on the y-axis */
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds the values of the parameter {@link Vector2} to the respective variables
     * @param vec2 A {@link Vector2} to be added
     * @returns A new {@link Vector2} containing the sum of the paramter {@link Vector2} 
     * and the {@link Vector2} the function is called on
     */
    add(vec2: Vector2): Vector2 {
        return new Vector2(this.x + vec2.x, this.y + vec2.y);
    }

    /**
     * Subtracts the values of the parameter {@link Vector2} from the respective variables
     * @param vec2 A {@link Vector2} to be subtracted
     * @returns A new {@link Vector2} containing the difference between the paramter vector
     * and the {@link Vector2} the function is called on
     */
    subtract(vec2: Vector2): Vector2 {
        return new Vector2(this.x - vec2.x, this.y - vec2.y);
    }

    /**
     * Scales the values of the {@link Vector2} the function is called on
     * @param scale A number to be multiply the {@link Vector2} by
     * @returns A new {@link Vector2} containing the scaled values of the {@link Vector2} the function is called on
     */
    scale(scale: number): Vector2 {
        return new Vector2(this.x * scale, this.y * scale);
    }

    /**
     * Finds the euclidian distance from the position of the {@link Vector2} to the origin
     * @returns Euclidian distance
     */
    getLength(): number {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }

    /**
     * Finds euclidian distance from the parameter {@link Vector2} to the {@link Vector2} the
     * function is called on
     * @param vec2 A {@link Vector2} to find the distance from
     * @returns Euclidian distance
     */
    getDistanceTo(vec2: Vector2): number {
        return this.subtract(vec2).getLength();
    }

    /**
     * Returns the distance between the parameter {@link Vector2} and the {@link Vector2} the 
     * function is called on along right-angled gridlines.
     * @param vec2 A {@link Vector2} to find the distance from
     * @returns Manhatten distance
     */
    getManhattanDistanceTo(vec2: Vector2): number {
        return Math.abs(this.x - vec2.x) + Math.abs(this.y - vec2.y);
    }

    /**
     * Creates a formatted string of the values of the vector
     * @returns A formatted string
     */
    toString(): string {
        return `[${this.x},${this.y}]`;
    }

    /**
     * Creates a {@link Vector2} containing the values of the parameter {@link Vector2}
     * @param vec2 A {@link Vector2} to be parsed
     * @returns A new {@link Vector2} if the values in the parameter {@link Vector2} is legal or null otherwise
     */
    static parse(vec2: any): Vector2 | null {
        if (typeof (vec2) !== "object") return null;
        if (typeof (vec2.x) !== "number") return null;
        if (typeof (vec2.y) !== "number") return null;

        return new Vector2(vec2.x, vec2.y);
    }

    /**
     * Creates a {@link Vector2} containing the values of the {@link Vector2} the function is called on
     * @returns A new {@link Vector2}
     */
    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

}