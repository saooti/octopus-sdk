import { PlaylistMedia } from "../stores/class/radio/playlistMedia";
import { Mix } from "../stores/class/radio/mix";
import { ModuleApi } from "./apiConnection";
import classicApi from "./classicApi";
import { Cartouchier } from "@/stores/class/cartouchier/cartouchier";

/**
 * Retrieve all cartouchier from the given organisation
 * @param organisationId The ID of the organisation
 * @param options Filtering options
 * @returns List of cartouchier belonging to the organisation
 */
async function getAllCartouchiers(organisationId: string, options?: { ownerId?: string }): Promise<Array<Cartouchier>> {
    return classicApi.fetchData<Array<Cartouchier>>({
        api: ModuleApi.MEDIA,
        path: `cartouchier/list/${organisationId}`,
        parameters: options
    });
}

/**
 * Retrieve all mix from the given organisation
 * @param organisationId The ID of the organisation
 * @returns List of mix belonging to the organisation
 */
async function getAllMix(organisationId: string): Promise<Array<Mix>> {
    return classicApi.fetchData<Array<Mix>>({
        api: ModuleApi.MEDIA,
        path: `mix/${organisationId}`
    });
}

/**
 * Delete mix with the given id
 * @param mixId The ID of the mix to delete
 */
async function deleteMix(mixId: number): Promise<void> {
    await classicApi.deleteData({
        api: ModuleApi.MEDIA,
        path: `mix/${mixId}`
    });
}

/**
 * Retrieve all playlist from the given organisation
 * @param organisationId The ID of the organisation
 * @param options Filtering options
 * @returns List of playlist belonging to the organisation
 */
async function getAllPlaylists(organisationId: string, options?: { ownerId?: string }): Promise<Array<PlaylistMedia>> {
    return classicApi.fetchData<Array<PlaylistMedia>>({
        api: ModuleApi.MEDIA,
        path: `playlist/${organisationId}`,
        parameters: options
    });
}

/**
 * Delete playlist with the given id
 * @param playlistId The ID of the playlist to delete
 */
async function deletePlaylist(playlistId: number): Promise<void> {
    await classicApi.deleteData({
        api: ModuleApi.MEDIA,
        path: `playlist/${playlistId}`
    });
}

export const mediathequeApi = {
    getAllCartouchiers,
    getAllMix,
    deleteMix,
    getAllPlaylists,
    deletePlaylist
}
