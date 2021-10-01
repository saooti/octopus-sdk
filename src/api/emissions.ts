import { FetchParam } from "@/store/class/fetchParam";
import { StoreState } from "@/store/typeAppStore";

const octopusApi = require('@saooti/octopus-api');
export default{
  fetchEmissionsAdmin(store: StoreState, parameters: FetchParam): void {
    console.log(store);
    octopusApi.fetchEmissions(parameters);
  },
};
