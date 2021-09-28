const octopusApi = require('@saooti/octopus-api');
import { defineComponent } from 'vue'
export default defineComponent({
  postComment(store: any, parameters: any): void {
    console.log(store);
    octopusApi.postComment(parameters);
  },
};
