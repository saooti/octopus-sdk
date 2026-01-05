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
    /** The filter on emission groups defined on the route props */
    routeEmissionGroups?: number[];
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
    /** When set, filter on topics */
    r?: string;
    q?: string;
    /** When set, filter on groups */
    gp?: number[];
}

type RouteParamEnum =
    'Beneficiaries' |
    'Query' |
    'EmissionGroups'
    ;

/** Utility to access route params by constants instead of undefined value */
export const ROUTE_PARAMS: Record<RouteParamEnum, keyof AdvancedRouteParams> = {
    Beneficiaries: 'b',
    Query: 'q',
    EmissionGroups: 'gp'
};
