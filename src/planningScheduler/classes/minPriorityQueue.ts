

class MinPriorityQueue {
    array: any[];
    f: (x: any) => number;

    constructor(f: (x: any) => number) {
        this.array = [];
        this.f = f;
    }

    left(i: number): number {
        return 2 * i;
    }

    right(i: number): number {
        return 2 * i + 1;
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
        if (l <= this.array.length && this.f(this.array[l]) < this.f(this.array[i])) smallest = l;
        else smallest = i;
        if (r <= this.array.length && this.f(this.array[r]) < this.f(this.array[smallest])) smallest = r;
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
        delete this.array[this.array.length - 1];
        this.minHeapify(0);
        return min;
    }

    /// TO DO
    decreaseKey(current: any) {



    }

    // insert() {

    // }
};



