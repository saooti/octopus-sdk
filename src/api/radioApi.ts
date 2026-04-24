import { Canal } from "../stores/class/radio/canal";
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

export const radioApi = {
    get
};
