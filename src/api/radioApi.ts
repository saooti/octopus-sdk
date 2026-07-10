import { Ambiance, Canal } from "../stores/class/radio/canal";
import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";

/**
 * Retrieve a radio canal by its id
 * @param radioId Id of the radio to retrieve
 * @returns The canal data
 */
async function get(radioId: number): Promise<Canal> {
    return classicApi.fetchData<Canal>({
        api: ModuleApi.RADIO,
        path: `canal/${radioId}`
    });
}

/**
 * Retrieve all radio canal by organisation
 * @param organisationId Id of the organisation
 * @returns The list of canal data
 */
async function getAll(organisationId: string): Promise<Array<Canal>> {
    return await classicApi.fetchData<Array<Canal>>({
        api: ModuleApi.RADIO,
        path: "canal/orga/" + organisationId + "/"
    });
}

/**
 * Set the default ambiance for the given canal
 * @param canalId ID of the canal to change
 * @param ambiance New ambiance settings
 * @returns The modified ambiance
 */
async function setDefaultAmbiance(canalId: number, ambiance: Ambiance): Promise<Ambiance> {
    return await classicApi.putData<Ambiance>({
        api: ModuleApi.RADIO,
        path: `ambiance/canal/${canalId}/default`,
        dataToSend: ambiance
    });
    
}

export const radioApi = {
    get,
    getAll,
    setDefaultAmbiance
};
