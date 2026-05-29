import { ModuleApi } from "./apiConnection";
import classicApi from "./classicApi";

export interface Aggregator {
    /** ID of the aggregator */
    aggregatorId: number;
    /** Name of the aggregator */
    name: string;
    /** User who created this aggregator */
    createdBy: string;
    /** Link to image for aggregator */
    image?: string;
    /** IP criteria */
    ip?: string;
    /** IP range criteria */
    ipRange?: string;
    /** Regex for referer criteria */
    refererRegexp?: string;
    /** Slug criteria */
    slug?: string;
    /** Regex for user agent criteria */
    uaRegexp?: string;
}

export type PredefinedAggregator = Pick<Aggregator, 'name' | 'image'>;

/**
 * Return the list of predefined aggregators
 */
async function getPredefined(): Promise<Array<PredefinedAggregator>> {
    return classicApi.fetchData<Array<PredefinedAggregator>>({
        api: ModuleApi.DEFAULT,
        path: 'rss/aggregator/distributions'
    });
}

/**
 * Return the list of all user-defined aggregators
 * @param organisationId If defined, the aggregators will be filtered for this
 *                       organisation
 */
async function getAll(organisationId?: string): Promise<Array<Aggregator>> {
    return classicApi.fetchData<Array<Aggregator>>({
        api: ModuleApi.DEFAULT,
        path: 'rss/aggregator/list',
        parameters: organisationId ? { organisationId } : undefined
    });
}

/**
 * Return the list of all user-defined aggregators, without filter data.
 * This doesn't require to be authenticated.
 * @param organisationId If defined, the aggregators will be filtered for this
 *                       organisation
 */
async function getAllNoAuth(organisationId?: string): Promise<Array<PredefinedAggregator>> {
    return classicApi.fetchData<Array<Aggregator>>({
        api: ModuleApi.DEFAULT,
        path: 'rss/aggregator/noauth/list',
        parameters: organisationId ? { organisationId } : undefined
    });
}

export const aggregatorsApi = {
    getPredefined,
    getAll,
    getAllNoAuth
};
