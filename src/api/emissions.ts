import { Emission } from "@/store/class/emission";
import { FetchParam } from "@/store/class/fetchParam";
import { StoreState } from "@/store/typeAppStore";

import octopusApi from '@saooti/octopus-api';
/* eslint-disable */
export default{
  async fetchEmissionsAdmin(store: StoreState, parameters: FetchParam): Promise<{ count: number; result: Array<Emission>; sort: string; }> {
    console.log(store);
    return await octopusApi.fetchEmissions(parameters);
  },
};
/* eslint-enable */