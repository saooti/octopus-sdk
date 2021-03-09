import octopusApi from '@saooti/octopus-api';
export default {
  fetchPodcastsAdmin(store, parameters) {
    console.log(store);
    octopusApi.fetchPodcasts(parameters);
  },
};
