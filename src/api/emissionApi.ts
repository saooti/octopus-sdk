import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";
import { mapFromGetAll } from "./apiUtils";
import { Emission } from "@/stores/class/general/emission";
import { ListClassicReturn } from "@/stores/class/general/listReturn";

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


/**
 * Search for emissions
 * @param query A filter on the name of the emission
 * @param options Optional options to filter the results
 */
async function search(query?: string, options?: {
    /** The index of the first element to retrieve */
    first?: number;
    /** The number of elements to retrieve */
    size?: number;
    specialTreatment?: boolean;
    distributedBy?: string;
    /** Filter by organisation */
    organisationId?: string|string[];
}): Promise<ListClassicReturn<Emission>> {
    return classicApi.fetchData<ListClassicReturn<Emission>>({
        api: ModuleApi.DEFAULT,
        path: "emission/search",
        parameters: {
            query,
            first: options?.first ?? 0,
            size: options?.size ?? 10,
            distributedBy: options?.distributedBy,
            organisationId: options?.organisationId
        },
        specialTreatement: options?.specialTreatment ?? true
    });
}

/**
 * Remove seasons data from emission
 * @param emissionId The ID of the emission for which to remove the data
 */
async function resetSeasons(emissionId: number): Promise<void> {
    return classicApi.putData({
        api: ModuleApi.DEFAULT,
        path: 'emission/seasons/reset/' + emissionId
    });
}
export const emissionApi = {
    get,
    getAllById,
    search,
    resetSeasons
};
