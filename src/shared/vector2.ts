export class Vector2 {
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

    scale(scale: number): Vector2 {
        return new Vector2(this.x * scale, this.y * scale);
    }

    getLength(): number {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }

    getDistanceTo(vec2: Vector2): number {
        return this.subtract(vec2).getLength();
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