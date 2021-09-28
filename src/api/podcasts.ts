const octopusApi = require('@saooti/octopus-api');
import { defineComponent } from 'vue'
export default defineComponent({
  async fetchPodcastsAdmin(store: any, parameters: any): Promise<any> {
    console.log(store);
    return await octopusApi.fetchPodcasts(parameters);
  },
};
