const octopusApi = require('@saooti/octopus-api');
export default {
  postComment(store: any, parameters: any) {
    console.log(store);
    octopusApi.postComment(parameters);
  },
};
