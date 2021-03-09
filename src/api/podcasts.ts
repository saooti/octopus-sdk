const octopusApi = require('@saooti/octopus-api');
export default {
  fetchPodcastsAdmin(store: any, parameters: any) {
    console.log(store);
    octopusApi.fetchPodcasts(parameters);
  },
};
