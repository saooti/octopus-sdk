import { Podcast, PodcastProcessingStatus, SimplifiedPodcast } from '../stores/class/general/podcast';
import { ListClassicReturn } from '../stores/class/general/listReturn';
import { useAuthStore } from '../stores/AuthStore';
import classicApi from './classicApi';
import { ModuleApi } from './apiConnection';
import { unique } from '../helper/arrayHelper';
import { organisationApi } from './organisationApi';
import { emissionApi } from './emissionApi';
import { EmissionGroup } from './groupsApi';
import { FetchParam } from '@/stores/class/general/fetchParam';
import { toRaw } from 'vue';

export enum PodcastSort {
    DATE = 'DATE',
    DATE_ASC = 'DATE_ASC',
    NAME = 'NAME',
    LAST_PODCAST_DESC = 'LAST_PODCAST_DESC',
    POPULARITY = 'POPULARITY',
    SCORE = 'SCORE',
    UPDATE_ASC = 'UPDATE_ASC',
    UPDATE_DESC = 'UPDATE_DESC'
}

export enum PodcastMonetisation {
    YES = "YES",
    NO = "NO",
    UNDEFINED = "UNDEFINED"
}

interface Paginable<S> {
    /** The start of pagination */
    first?: number;
    /** The number of elements to retrieve */
    pageSize?: number;
    /** Sorting */
    sort?: S;
}

/**
 * The options available to search for podcasts.
 * 
 * ** /!\ This list is not exhaustive **
 */
export interface PodcastSearchOptions extends Paginable<PodcastSort> {
    /** Filter by emission ID */
    emissionId?: number|number[];
    /** Filter by emission groups */
    emissionGroups?: EmissionGroup[];
    /** Filter by organisation ID */
    organisationId?: string[];
    /** Filter by title containing */
    query?: string;
    /** Filter by IAB category */
    iabId?: number;
    /** Filter by participant */
    participantId?: number;
    /** Fitler by monetisation */
    monetisable?: PodcastMonetisation;
    /** Filter by pub date before */
    pubDateBefore?: string;
    /** Filter by pub date after */
    pubDateAfter?: string;
    /** Filter by rubriquage exclusion ? */
    noRubriquageId?: Array<number>;
    /** Filter by rubrique */
    rubriqueId?: Array<number>;
    /** Filter by rubriquage */
    rubriquageId?: Array<number>;
    /** Also show hidden podcasts */
    includeHidden?: boolean;
    /** Filter by validity */
    validity?: boolean;
    /** Filter by status */
    processingStatus?: Array<PodcastProcessingStatus>;
    /** Filter by podcast having a video */
    withVideo?: boolean;
    /** Filter by tags */
    tags?: Array<string>;
    /** Filter by beneficiaries/rights holder reference */
    beneficiaries?: Array<string>;
}

async function downloadRegister(podcastId: number, parameters?: Record<string,unknown>): Promise<{ location: string; downloadId: number }> {
    const authStore = useAuthStore();

    return classicApi.fetchData<{
        location: string;
        downloadId: number;
    }>({
        api: ModuleApi.DEFAULT,
        path:"podcast/download/register/" + podcastId + ".mp3",
        parameters: {
            access_token: authStore.authParam.accessToken,
            ...parameters
        },
        headers: {'X-Extra-UA':'Saooti Player'},
        isNotAuth:true
    });
}

/**
 * Get a podcast by its ID
 */
function get(podcastId: number): Promise<Podcast> {
    return classicApi.fetchData<Podcast>({
        api: ModuleApi.DEFAULT,
        path: 'podcast/' + podcastId
    });
}


/**
 * Convert easy to use PodcastSearchOptions to the actual FetchParams used by
 * the endpoint.
 */
function processSearchParameters(search: PodcastSearchOptions): FetchParam {
    const parameters: FetchParam = {};

    Object.keys(search).forEach(key => {
        const value = search[key];

        if (value === undefined || value === null) {
            return;
        }

        if (key === 'beneficiaries') {
            parameters.beneficiary = value;
        } else if (key === 'processingStatus') {
            parameters.includeStatus = value;
        } else if (key === 'tags') {
            parameters.includeTags = value;
        } else if (key === 'pubDateBefore') {
            parameters.before = value;
        } else if (key === 'pubDateAfter') {
            parameters.after = value;
        } else if (key === 'pageSize') {
            parameters.size = value;
        } else if (key === 'emissionGroups') {
            const emissionIds = [search.emissionId ?? undefined].flat();
            search.emissionGroups.forEach(group => {
                emissionIds.push(...group.emissionIds);
            });
            parameters.emissionId = emissionIds;
        } else {
            parameters[key] = value;
        }
    });

    return parameters;
}

/**
 * Search for podcasts. Retrieved podcasts are 'incomplete', some of their
 * properties are only IDs.
 * Use `searchFull` to get full podcasts, but more queries will be made
 * @param options The search criterias
 * @param adaptParameters If true, some adjustments will be made to the parameters
 * @return A list of simplified podcasts
 */
function search(options: PodcastSearchOptions, adaptParameters?: boolean): Promise<ListClassicReturn<SimplifiedPodcast>> {
    return classicApi.fetchData<ListClassicReturn<SimplifiedPodcast>>({
        api: ModuleApi.DEFAULT,
        path: 'v2/podcast/search',
        parameters: processSearchParameters(options),
        specialTreatement: adaptParameters
    });
}

/**
 * Retrieve the podcasts matching the search criterias, with all their data.
 * This query is longer, because it also needs to retrieve organisations &
 * emissions.
 * @param options The search criterias
 * @param adaptParameters If true, some adjustments will be made to the parameters
 * @return A list of podcasts
 */
async function searchFull(options:PodcastSearchOptions, adaptParameters?: boolean): Promise<ListClassicReturn<Podcast>> {
    const podcasts = await search(options, adaptParameters);
    const full: ListClassicReturn<Podcast> = {
        count: podcasts.count,
        sort:podcasts.sort,
        result: []
    };
    
    const organisationIds = podcasts.result.map((p: SimplifiedPodcast) => p.organisationId)
        .filter(unique);
    const emissionIds = podcasts.result.map((p: SimplifiedPodcast) => p.emissionId)
        .filter(unique);

    const organisations = await organisationApi.getAllById(organisationIds);
    const emissions = await emissionApi.getAllById(emissionIds);

    podcasts.result.forEach((s: SimplifiedPodcast) => {
        const organisation = organisations[s.organisationId];
        const emission = emissions[s.emissionId];

        full.result.push({
            ...s,
            organisation,
            emission
        });
    });

    return full;
}

export const podcastApi = {
    downloadRegister,
    get,
    search,
    searchFull
}
