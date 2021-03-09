const octopusApi = require('@saooti/octopus-api');
export default {
  fetchEmissionsAdmin(store: any, parameters: any) {
    console.log(store);
    octopusApi.fetchEmissions(parameters);
  },
};
