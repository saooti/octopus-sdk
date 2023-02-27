import { defineStore } from 'pinia';
import { CommentPodcast } from './class/general/comment';
interface CommentState {
	commentInitialized: boolean;
  commentWebsocketengine: undefined;
  commentPodcastId?: number;
  commentOrgaId?: string;
  commentEventToHandle: Array<{
    comment: CommentPodcast
    type: string;
  }>;
  commentKnownIdentity: string | null;
  commentActualPodcastId?: number;
  commentLoaded: Array<CommentPodcast>;
  commentTotalCount: number;
}
export const useCommentStore = defineStore('CommentStore', {
  state: (): CommentState => ({
    commentInitialized: false,
    commentWebsocketengine: undefined,
    commentPodcastId: undefined,
    commentOrgaId: undefined,
    commentEventToHandle: [],
    commentKnownIdentity: null,
    commentActualPodcastId: 0,
    commentLoaded: [],
    commentTotalCount: 0,
  }),
  getters:{
  },
  actions: {
    setCommentIdentity(identity:string|null) {
      this.commentKnownIdentity = identity;
    },
    setCommentLoaded(data: {podcastId?: number, comments:Array<CommentPodcast>}) {
      this.commentActualPodcastId = data.podcastId;
      this.commentLoaded = data.comments;
    },
  }
})