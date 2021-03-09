import octopusApi from '@saooti/octopus-api';
export default {
  fetchEmissionsAdmin(store, parameters) {
    console.log(store);
    octopusApi.fetchEmissions(parameters);
  },
};
