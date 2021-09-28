const octopusApi = require('@saooti/octopus-api');
import { defineComponent } from 'vue'
export default defineComponent({
  fetchEmissionsAdmin(store: any, parameters: any): void {
    console.log(store);
    octopusApi.fetchEmissions(parameters);
  },
};
