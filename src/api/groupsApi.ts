import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";
import { ListClassicReturn } from "../stores/class/general/listReturn";

const BASE_PATH = 'emission/groups/';

/** Group of emissions */
export interface EmissionGroup {
    /** Name of the group */
    name: string;
    /** Id of the group */
    groupId: number;
    /** Simple description */
    description: string;
    /** The id of the organisation this group belongs to */
    organisationId: string;
    /** The list of ids of emissions in this group */
    emissionIds: Array<number>|null;
    acpmMarque: string;
}

interface SearchParams {
    /** Filter by acpm */
    acpmMarque: string;
    /** Filter by name */
    search: string;
    /** Filter by organisations */
    organisationIds: Array<string>;
    /** Pagination */
    first: number;
    /** Number of elements */
    size: number;
}

/**
 * Create a new group
 */
export async function createGroup(group: Omit<EmissionGroup, 'groupId'|'emissionIds'>): Promise<EmissionGroup> {
    return classicApi.postData<EmissionGroup>({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH,
        dataToSend: group
    });
}

/**
 * Search groups
 */
export async function searchGroups(parameters: Partial<SearchParams>): Promise<ListClassicReturn<EmissionGroup>> {
    return classicApi.fetchData<ListClassicReturn<EmissionGroup>>({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + 'search',
        parameters
    });
}
