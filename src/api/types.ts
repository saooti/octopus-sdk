export interface Paginable<S> {
    /** The start of pagination */
    first?: number;
    /** The number of elements to retrieve */
    size?: number;
    /** Sorting */
    sort?: S;
}
