import { CommentPodcast } from "../general/comment";

export interface CommentMessage {
  comment: CommentPodcast;
  type: string;
}
export interface CommentsConfig {
  inherited: boolean|null,
  abuse: {
    authRequired: boolean
  },
  commentLikes:{
    authRequired: boolean,
    dislikeEnabled: boolean,
    likeEnabled: boolean,
  },
  comments:{
    authRequired: boolean,
    commentAllowed: string, //NONE,LIVE_ONLY,LIVE_AND_REPLAY,ALL
    defaultState: string, //VALIDATED,NOT_VALID,PENDING
    depth: 2
  },
  podcastLikes:{
    authRequired: boolean,
    dislikeEnabled: boolean,
    likeEnabled: boolean,
  },
}
export function defaultCommentsConfig(inherited: boolean): CommentsConfig {
  return {
    inherited: inherited,
    abuse: {
      authRequired: true
    },
    commentLikes:{
      authRequired: true,
      dislikeEnabled: true,
      likeEnabled: true,
    },
    comments:{
      authRequired: true,
      commentAllowed: "NONE",
      defaultState: "PENDING",
      depth: 2
    },
    podcastLikes:{
      authRequired: true,
      dislikeEnabled: true,
      likeEnabled: true,
    },
  };
}
