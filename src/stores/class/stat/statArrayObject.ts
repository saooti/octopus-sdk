export interface StatOrigin {
    COMPLETION: string;
    DESKTOP: {count: number, averageCompletion: number};
    MOBILE: {count: number, averageCompletion: number};
    TABLET: {count: number, averageCompletion: number};
    TOTAL: {count: number, averageCompletion?: number};
}
export interface InnerStatArrayObject {
    name: string;
    value:StatOrigin
}
export interface StatArrayObject {
    completion: number;
    id?: string;
    origins?: Array<InnerStatArrayObject>;
    originsLive?: Array<InnerStatArrayObject>;
    title: string;
    total: number;
    totalDesktop: number;
    totalMobile: number;
    totalTablet: number;
}
export interface InnerStatDataArray{
    [key:string]: {
        name?: string;
        total: number;
        origins: {[key:string] :StatOrigin}
    }
}
export interface StatDataArray {
    emissionId?: InnerStatDataArray;
    podcastId?: InnerStatDataArray;
    total: number;
}