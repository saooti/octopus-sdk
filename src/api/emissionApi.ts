import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";
import { mapFromGetAll } from "./apiUtils";
import { Emission } from "@/stores/class/general/emission";

/**
 * Retrieve an emission by ID
 * @param emissionId The ID of the emission
 * @return An emission
 */
async function get(emissionId: number): Promise<Emission> {
    return classicApi.fetchData<Emission>({
        api: ModuleApi.DEFAULT,
        path: 'emission/' + emissionId
    });
}

/**
 * Retrieve all emissions specified by their IDs
 * @param emissionIds A list of emission IDs. For better result, they
                          should be unique.
 * @return The matching emissions
 */
async function getAllById(emissionIds: Array<number>): Promise<Record<string, Emission>> {
    return mapFromGetAll(emissionIds, get, 'emissionId');
}

export const emissionApi = {
    get,
    getAllById
};
