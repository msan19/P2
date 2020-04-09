

export class MinPriorityQueue {
    array: any[];
    f: (x: any) => number;

    constructor(f: (x: any) => number) {
        this.array = [];
        this.f = f;
    }

    left(i: number): number {
        return 2 * (i + 1) - 1;
    }

    right(i: number): number {
        return 2 * (i + 1);
    }

    parent(i: number): number {
        if (i === 0) return 0;
        return Math.floor((i - 1) / 2);
    }

    heapMinimum(): any {
        return this.array[0];
    }

    swapByIndex(i: number, j: number): void {
        let temp: any = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
    }

    minHeapify(i: number): void {
        let l: number = this.left(i);
        let r: number = this.right(i);
        let smallest: number;
        if (l < this.array.length && this.f(this.array[l]) < this.f(this.array[i])) smallest = l;
        else smallest = i;
        if (r < this.array.length && this.f(this.array[r]) < this.f(this.array[smallest])) smallest = r;
        if (smallest !== i) {
            this.swapByIndex(i, smallest);
            this.minHeapify(smallest);
        }

    }

    extractMin(): any {
        if (this.array.length === 0) {
            console.log("Underflow");
            return null;
        }
        let min = this.heapMinimum();
        this.array[0] = this.array[this.array.length - 1];
        this.array.pop();

        this.minHeapify(0);
        return min;
    }

    insert(newElement: any): void {
        this.array.push(newElement);
        let index = this.array.length - 1;

        while (index > 0 && this.f(this.array[this.parent(index)]) > this.f(this.array[index])) {
            this.swapByIndex(index, this.parent(index));
            index = this.parent(index);
        }
    }
};



