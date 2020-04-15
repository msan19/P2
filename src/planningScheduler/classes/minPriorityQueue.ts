
/**
 * A min-priority queue implementation 
 */
export class MinPriorityQueue {
    /** An array containing the elemtns of the priority queue  */
    array: any[];

    /** 
     * A function defined as the sum of two other functions, 
     * which in {@link RouteScheduler} is {@link Vertex.g} and {@link RouteScheduler.heuristic}
     */
    f: (x: any) => number;

    constructor(f: (x: any) => number) {
        this.array = [];
        this.f = f;
    }

    // returns index of left child
    left(i: number): number {
        return 2 * (i + 1) - 1;
    }

    // returns index of right child
    right(i: number): number {
        return 2 * (i + 1);
    }

    // returns index of parent
    parent(i: number): number {
        if (i === 0) return 0;
        return Math.floor((i - 1) / 2);
    }

    // returns first element in the min-heap
    heapMinimum(): any {
        return this.array[0];
    }

    // swaps the elements with index i and index j
    swapByIndex(i: number, j: number): void {
        let temp: any = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
    }

    /**
     * Maintains the min-heap property: 
     *     A[Parent(i)] <= A[i]
     * @assumption left- and right subtree are minheaps
     * @param i An index in the array
     */
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

    /**
     * Returns the first element in the min-heap 
     * Restores the min-heap property 
     */
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

    /**
     * Inserts a new element into the heap
     * @param newElement The element that is to be inserted into the min-heap
     */
    insert(newElement: any): void {
        this.array.push(newElement);
        let index = this.array.length - 1;

        while (index > 0 && this.f(this.array[this.parent(index)]) > this.f(this.array[index])) {
            this.swapByIndex(index, this.parent(index));
            index = this.parent(index);
        }
    }
};



