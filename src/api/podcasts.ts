import { FetchParam } from "@/store/class/fetchParam";
import { StoreState } from "@/store/typeAppStore";

const octopusApi = require('@saooti/octopus-api');
export default {
  async fetchPodcastsAdmin(store: StoreState, parameters: FetchParam): Promise<any> {
    console.log(store);
    return await octopusApi.fetchPodcasts(parameters);
  },
};
