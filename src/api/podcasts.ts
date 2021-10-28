import { FetchParam } from "@/store/class/fetchParam";
import { StoreState } from "@/store/typeAppStore";

import octopusApi from '@saooti/octopus-api';
/* eslint-disable */
export default {
  async fetchPodcastsAdmin(store: StoreState, parameters: FetchParam): Promise<any> {
    console.log(store);
    return await octopusApi.fetchPodcasts(parameters);
  },
};
/* eslint-enable */