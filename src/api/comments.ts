import { StoreState } from "@/store/typeAppStore";

const octopusApi = require('@saooti/octopus-api');
export default {
  postComment(store: StoreState, parameters: Comment): void {
    console.log(store);
    octopusApi.postComment(parameters);
  },
};
