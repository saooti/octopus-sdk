import { CommentPodcast } from "@/store/class/general/comment";
import { StoreState } from "@/store/typeAppStore";

import octopusApi from '@saooti/octopus-api';
/* eslint-disable */
export default {
  postComment(store: StoreState, parameters: CommentPodcast): void {
    console.log(store);
    octopusApi.postComment(parameters);
  },
};
/* eslint-enable */