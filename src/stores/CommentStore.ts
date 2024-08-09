import { defineStore } from "pinia";
import cookies from "../components/mixins/cookies";
import { CommentPodcast } from "./class/general/comment";
import { useAuthStore } from "./AuthStore";
import uuidGenerator from "../helper/uuidGenerator";
export interface CommentUser{
  name: string|null;
  uuid: string|null;
}
interface CommentState {
  commentInitialized: boolean;
  commentWebsocketengine: undefined;
  commentPodcastId?: number;
  commentOrgaId?: string;
  commentEventToHandle: Array<{
    comment: CommentPodcast;
    type: string;
  }>;
  commentActualPodcastId?: number;
  commentUser?:CommentUser;
}
export const useCommentStore = defineStore("CommentStore", {
  state: (): CommentState => ({
    commentInitialized: false,
    commentWebsocketengine: undefined,
    commentPodcastId: undefined,
    commentOrgaId: undefined,
    commentEventToHandle: [],
    commentActualPodcastId: 0,
  }),
  getters: {},
  actions: {
    initCommentUser(){
      if(this.commentUser){
        return;
      }
      const authStore = useAuthStore();
      if(authStore.authProfile){
        this.commentUser = {
          name:authStore.authName,
          uuid:authStore.authProfile.userId
        }; 
        return;
      }
      var uuid = cookies.methods.getCookie("comment-octopus-uuid");
      if(null===uuid){
        uuid = uuidGenerator.uuidv4();
        cookies.methods.setCookie("comment-octopus-uuid", uuid);
      }
      this.commentUser = {
        name:cookies.methods.getCookie("comment-octopus-name"),
        uuid:uuid
      }; 
    },
    setCommentUser(name:string) {
      const authStore = useAuthStore();
      if(authStore.authProfile || !this.commentUser){
        return;
      }
      cookies.methods.setCookie("comment-octopus-name", name);
      this.commentUser.name = name;
    },
  },
});
