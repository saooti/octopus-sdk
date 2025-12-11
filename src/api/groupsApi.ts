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
    acpmMarque?: string;
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
 * Add an emission to a list of groups
 * @param emission The emission to add to the groups
 * @param groups The list of groups to add the emission to
 */
async function addToGroups(emission: Emission, groups: Array<EmissionGroup>): Promise<void> {
    return classicApi.putData({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + 'add/' + emission.emissionId,
        dataToSend: groups.map(g => g.groupId)
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
async function removeFromGroups(emission: Emission, groups: Array<EmissionGroup>): Promise<void> {
    return classicApi.putData({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + 'remove/' + emission.emissionId,
        dataToSend: groups.map(g => g.groupId)
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
async function search(parameters: Partial<SearchParams>): Promise<ListClassicReturn<EmissionGroup>> {
    return classicApi.fetchData<ListClassicReturn<EmissionGroup>>({
        api: ModuleApi.DEFAULT,
        path: BASE_PATH + 'search',
        parameters
    });
}

export const groupsApi = {
    addToGroups,
    create,
    remove,
    get,
    getAllById,
    removeFromGroups,
    update,
    search
};
