import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";
import { Podcast, SimplifiedPodcast } from "../stores/class/general/podcast";
import { Playlist } from "../stores/class/general/playlist";
import { organisationApi } from "./organisationApi";
import { emissionApi } from "./emissionApi";

/**
 * Retrieve playlist data
 * @param playlistId The ID of the playlist
 * @return The playlist
 */
async function get(playlistId: number): Promise<Playlist> {
    return classicApi.fetchData<Playlist>({
        api: ModuleApi.DEFAULT,
        path: 'playlist/' + playlistId
    });
}

/**
 * Retrieve the podcasts defined in the playlist
 * @param playlistId The ID of the playlist
 * @return A list of simplified podcasts
 */
async function getContent(playlistId: number): Promise<Array<SimplifiedPodcast>> {
    return classicApi.fetchData<Array<SimplifiedPodcast>>({
        api: ModuleApi.DEFAULT,
        path: 'v2/playlist/' + playlistId + '/content'
    });
}

function unique<T>(value: T, index: number, array: Array<T>): boolean {
    return array.indexOf(value) === index;
}

/**
 * Retrieve the podcasts defined in the playlist, with all their data
 * This query is longer, because it also needs to retrieve organisations &
 * emissions.
 * @param playlistId The ID of the playlist
 * @return A list of podcasts
 */
async function getContentFull(playlistId: number): Promise<Array<Podcast>> {
    const simplified = await this.getContent(playlistId);
    const full: Array<Podcast> = [];

    const organisationIds = simplified.map((p: SimplifiedPodcast) => p.organisationId)
        .filter(unique);
    const emissionIds = simplified.map((p: SimplifiedPodcast) => p.emissionId)
        .filter(unique);

    const organisations = await organisationApi.getAllById(organisationIds);
    const emissions = await emissionApi.getAllById(emissionIds);

    simplified.forEach((s: SimplifiedPodcast) => {
        const organisation = organisations[s.organisationId];
        const emission = emissions[s.emissionId];

        full.push({
            ...s,
            organisation,
            emission
        });
    })

    return full;
}

/**
 * API to manage playlists
 */
export const playlistApi = {
    get,
    getContent,
    getContentFull
}
