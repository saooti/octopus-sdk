const octopusApi = require('@saooti/octopus-api');
export default {
  postComment(store: any, parameters: any): void {
    console.log(store);
    octopusApi.postComment(parameters);
  },
};
