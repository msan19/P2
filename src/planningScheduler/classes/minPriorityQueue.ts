// minPriorityQueue.ts
/**
 * @packageDocumentation
 * @category PlanningScheduler
 */

/**
 * A min-priority queue implementation 
 */
export class MinPriorityQueue<T> {
    /** An array containing the elemtns of the priority queue  */
    array: T[];

    /** 
     * A function defined as the sum of two other functions, 
     * which in {@link RouteScheduler} is {@link Vertex.g} and {@link RouteScheduler.heuristic}
     */
    f: (x: T) => number;

    constructor(f: (x: T) => number) {
        this.array = [];
        this.f = f;
    }

    /** 
     * Returns index of left child
     * @param i An index of the array
     * @returns Index of the left side of index i
     */
    left(i: number): number {
        return 2 * (i + 1) - 1;
    }

    /** 
     * Returns index of right child 
     * @param i An index of the array
     * @returns Index of the right side of index i
     */
    right(i: number): number {
        return 2 * (i + 1);
    }

    /** 
     * Returns index of parent 
     * @param i An index of the array
     * @returns Index of the parent of index i
     */
    parent(i: number): number {
        if (i === 0) return 0;
        return Math.floor((i - 1) / 2);
    }

    /** 
     * Returns first element in the min-heap 
     * @returns The smallest element of the heap
    */
    heapMinimum(): T {
        return this.array[0];
    }

    /** 
     * Swaps the elements with index i and index j
     * @param i The first index to swap 
     * @param j The second index to swap
     */
    swapByIndex(i: number, j: number): void {
        let temp: T = this.array[i];
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
     * Returns the first element in the min-heap and
     * restores the min-heap property 
     */
    extractMin(): T {
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
    insert(newElement: T): void {
        this.array.push(newElement);
        let index = this.array.length - 1;

        while (index > 0 && this.f(this.array[this.parent(index)]) > this.f(this.array[index])) {
            this.swapByIndex(index, this.parent(index));
            index = this.parent(index);
        }
    }
};



