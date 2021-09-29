const octopusApi = require('@saooti/octopus-api');
export default{
  fetchEmissionsAdmin(store: any, parameters: any): void {
    console.log(store);
    octopusApi.fetchEmissions(parameters);
  },
};
