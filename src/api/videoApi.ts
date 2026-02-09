import { ModuleApi } from "./apiConnection";
import classicApi from "./classicApi";

/**
 * Request the download ID from a video
 * @param podcastId The id of the podcast to be watched
 */
async function watchPodcast(podcastId: number): Promise<string> {
    return classicApi.fetchData<string>({
        api: ModuleApi.DEFAULT,
        path: 'video/watch/' + podcastId
    });
}

export const videoApi = {
    watchPodcast
}
