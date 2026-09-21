import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";
import { Organisation, OrganisationAttributes } from "../stores/class/general/organisation";
import { mapFromGetAll } from "./apiUtils";
import { VideoConfig } from "@/stores/class/config/videoConfig";
import { useCacheStore } from "@/stores/CacheStore";

/**
 * Retrieve an organisation by ID
 * @param organisationId The ID of the organisation
 * @return An organisation
 */
async function get(organisationId: string): Promise<Organisation> {
    return classicApi.fetchData<Organisation>({
        api: ModuleApi.DEFAULT,
        path: 'organisation/' + organisationId
    });
}

/**
 * Retrieve all organisations specified by their IDs
 * @param organisationIds A list of organisation IDs. For better result, they
                          should be unique.
 * @return The matching organisations
 */
async function getAllById(organisationIds: Array<string>): Promise<Record<string, Organisation>> {
    return mapFromGetAll(organisationIds, get, 'id');
}

/**
 * Retrieve the attributes of a given organisation
 * @param organisationId The ID of the organisation
 * @returns The attributes of the organisation
 */
async function getAttributes(organisationId: string): Promise<OrganisationAttributes> {
    return classicApi.fetchData<OrganisationAttributes>({
        api: ModuleApi.DEFAULT,
        path: 'organisation/attributes/' + organisationId
    });
}

/**
 * Retrieve the video configuration of a given organisation
 * @param organisationId The ID of the organisation
 * @returns The video configuration of the organisation
 */
async function getVideoConfig(organisationId: string): Promise<VideoConfig> {
    const cacheStore = useCacheStore();
    return cacheStore.getData(`org-video-config-${organisationId}`, () => {
        return classicApi.fetchData<VideoConfig>({
            api: ModuleApi.DEFAULT,
            path:"video/config/" + encodeURI(organisationId)
        });
    });
}

export const organisationApi = {
    get,
    getAllById,
    getAttributes,
    getVideoConfig
};
