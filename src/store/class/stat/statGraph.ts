export interface StatGraph {
    end: string,
    interval: string,
    start:string,
    points?: {[key:string]: {[key:string]:number}},
    total?: Array<number>
}