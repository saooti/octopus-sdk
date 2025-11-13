export interface RouteProps {
    pr?: number;
    ps?: number;
    routeQuery?: string;
    routeMonetisable?: string;
    routeIab?: number;
    routeSort?: string;
    routeIncludeHidden?: string;
    routeFrom?: string;
    routeTo?: string;
    routeValidity?: string;
    routeOnlyVideo?: string;
    routeOrga?: string;
    routeRubriques?: string;
    /** The filter on beneficiaries defined on the route props */
    routeBeneficiaries?: string[];
}

type DateStr = string;

export interface RouteParams {
    /** The organisation for which we display the emissions/episodes */
    productor?: string;
}

export interface AdvancedRouteParams extends RouteParams {
    /** If true, only show episodes with video */
    v?: 'true';
    /** When set, display data from this date */
    from?: DateStr;
    /** When set, display data up to this date */
    to?: DateStr;
    /** When set, filter on beneficiaries */
    b?: string[];
    q?: string;
}

type RouteParamEnum =
    'Beneficiaries' |
    'Query'
    ;

/** Utility to access route params by constants instead of undefined value */
export const ROUTE_PARAMS: Record<RouteParamEnum, keyof AdvancedRouteParams> = {
    Beneficiaries: 'b',
    Query: 'q'
};