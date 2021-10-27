import { StoreState } from "@/store/typeAppStore";

import octopusApi from '@saooti/octopus-api';
export default {
  postComment(store: StoreState, parameters: Comment): void {
    console.log(store);
    octopusApi.postComment(parameters);
  },
};
