
/**
 * A vector representing a position in two-dimentional space relative to a center point origo
 */
export class Vector2 {

    /**  */
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(vec2: Vector2): Vector2 {
        return new Vector2(this.x + vec2.x, this.y + vec2.y);
    }

    subtract(vec2: Vector2): Vector2 {
        return new Vector2(this.x - vec2.x, this.y - vec2.y);
    }
    /**
     * 
     * @param scale Number to multiply the vector by
     */
    scale(scale: number): Vector2 {
        return new Vector2(this.x * scale, this.y * scale);
    }

    getLength(): number {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }

    /**
     * Gets euclidian distance to vec2
     * Consider getNewYorkerDistanceTo when working with grids
     * @param vec2 
     */
    getDistanceTo(vec2: Vector2): number {
        return this.subtract(vec2).getLength();
    }
    /**
     * Returns the sum of differences in x and y
     * @param vec2 
     */
    getNewYorkerDistanceTo(vec2: Vector2): number {
        return Math.abs(this.x - vec2.x) + Math.abs(this.y - vec2.y);
    }

    toString(): string {
        return `[${this.x},${this.y}]`;
    }

    static parse(vec2: any): Vector2 | null {
        if (typeof (vec2) !== "object") return null;
        if (typeof (vec2.x) !== "number") return null;
        if (typeof (vec2.y) !== "number") return null;

        return new Vector2(vec2.x, vec2.y);
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

}