import { Pageable } from "./pageable";
import { SortPageable } from "./sortPageable";

export interface ListReturn<T> {
    content: T;
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: Pageable;
    size: number;
    sort: SortPageable;
    totalElements: number;
    totalPages: number;
}