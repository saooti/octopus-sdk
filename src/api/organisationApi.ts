import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";
import { Organisation, OrganisationAttributes } from "../stores/class/general/organisation";
import { mapFromGetAll } from "./apiUtils";

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

export const organisationApi = {
    get,
    getAllById,
    getAttributes
};
