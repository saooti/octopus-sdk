import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";
import { ListClassicReturn } from "../stores/class/general/listReturn";
import { Emission } from "@/stores/class/general/emission";
import { mapFromGetAll } from "./apiUtils";

const BASE_PATH = 'emission/groups/';

/** Group of emissions */
export interface EmissionGroup {
    /** Name of the group */
    name: string;
    /** Id of the group */
    groupId: number;
    /** Simple description */
    description?: string;
    /** The id of the organisation this group belongs to */
    organisationId: string;
    /** The list of ids of emissions in this group */
    emissionIds: Array<number>|null;
    /** If set, defines this group as a "marque" group. */
    acpmMarque: string|null;
}

interface Pagination {
    /** Pagination */
    first: number;
    /** Number of elements */
    size: number;
}

interface SearchParams {
    /** Filter by acpm */
    acpmMarque: string;
    /** Filter by name */
    search: string;
    /** Filter by organisations */
    organisationIds: Array<string>;
}

/**
 * Add an emission to a list of groups
 * @param emission The emission to add to the groups
 * @param groups The list of groups to add the emission to
 */
async function addToGroups(emission: Emission|number, groups: Array<EmissionGroup>|Array<number>): Promise<void> {
    if (groups.length === 0) {
        return;
    }

    let emissionId: number;
    if (typeof emission === 'object') {
        emissionId = emission.emissionId;
    } else {
        emissionId = emission;
    }
    let groupIds: Array<number>;
    if (typeof groups[0] === 'object') {
        groupIds = (groups as Array<EmissionGroup>).map(g => g.groupId);
    } else {
        groupIds = groups as Array<number>;
    }

    return classicApi.putData({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + 'add/' + emissionId,
        dataToSend: groupIds
    });
}

/**
 * Create a new group
 */
async function create(group: Omit<EmissionGroup, 'groupId'|'emissionIds'>): Promise<EmissionGroup> {
    return classicApi.postData<EmissionGroup>({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH,
        dataToSend: group
    });
}

/**
 * Delete a group
 */
async function remove(groupId: number): Promise<void> {
    return classicApi.deleteData({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + groupId
    });
}

/**
 * Retrieve a group by its ID
 * @param groupId The ID of the group to retrieve
 * @return The group
 */
async function get(groupId: number): Promise<EmissionGroup> {
    return classicApi.fetchData<EmissionGroup>({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + groupId
    });
}

/**
 * Retrieve all groups specified by their IDs
 * @param groupIds A list of group IDs. For better result, they
                          should be unique.
 * @return The matching groups
 */
async function getAllById(groupIds: Array<number>): Promise<Record<string, EmissionGroup>> {
    return mapFromGetAll(groupIds, get, 'groupId');
}

/**
 * Remove an emission from a list of groups
 * @param emission The emission to remove from the groups
 * @param groups The list of groups to remove the emission from
 */
async function removeFromGroups(emission: Emission|number, groups: Array<EmissionGroup>|Array<number>): Promise<void> {
    if (groups.length === 0) {
        return;
    }

    let emissionId: number;
    if (typeof emission === 'object') {
        emissionId = emission.emissionId;
    } else {
        emissionId = emission;
    }
    let groupIds: Array<number>;
    if (typeof groups[0] === 'object') {
        groupIds = (groups as Array<EmissionGroup>).map(g => g.groupId);
    } else {
        groupIds = groups as Array<number>;
    }

    return classicApi.putData({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + 'remove/' + emissionId,
        dataToSend: groupIds
    });
}

/**
 * Update a group
 */
async function update(group: Omit<EmissionGroup, 'emissionIds'>): Promise<EmissionGroup> {
    return classicApi.putData({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH,
        dataToSend: group
    });
}

/**
 * Search groups
 */
async function search(parameters: Partial<SearchParams & Pagination>): Promise<ListClassicReturn<EmissionGroup>> {
    return classicApi.fetchData<ListClassicReturn<EmissionGroup>>({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + 'search',
        parameters
    });
}

/**
 * Search for all groups, without pagination
 */
async function searchNoPagination(parameters: Partial<SearchParams>): Promise<Array<EmissionGroup>> {
    const result: Array<EmissionGroup> = [];

    let index = 0;
    while (true) {
        const response = await search({
            ...parameters,
            first: index,
            size: 1
        });

        result.push(...response.result);
        index += response.result.length;

        if (index >= response.count || response.result.length === 0) {
            break;
        }
    }

    return result;
}

export const groupsApi = {
    addToGroups,
    create,
    remove,
    get,
    getAllById,
    removeFromGroups,
    update,
    search,
    searchNoPagination
};
