import { defineStore } from "pinia";
import { state } from "./ParamSdkStore";
import cookies from "../components/mixins/cookies";
import { CommentPodcast } from "./class/general/comment";
import StringHelper from "../helper/string";
import { useAuthStore } from "./AuthStore";
import uuidGenerator from "../helper/uuidGenerator";
import octopusApi from "@saooti/octopus-api";
import { CommentMessage, CommentsConfig } from "./class/config/commentsConfig";
import { Podcast } from "./class/general/podcast";
import CommentEngine from "../websocket/commentWebsocket";
import { ListClassicReturn } from "./class/general/listReturn";
import murmurHash3 from 'murmurhash3js';
export interface CommentUser{
  name: string|null;
  uuid: string|null;
  uuidHash: string|null;
}
interface CommentState {
  commentInitialized: boolean;
  commentWebsocketengine: undefined|CommentEngine;
  commentPodcastId?: number;
  commentQueueName?: string;
  commentEventToHandle: Array<CommentMessage>;
  commentUser?:CommentUser;
  commentsForPlayer: {[key:number]: Array<CommentPodcast>},
  podcastsCommentsConfig:{ [key: number]: CommentsConfig };
}
export const useCommentStore = defineStore("CommentStore", {
  state: (): CommentState => ({
    commentInitialized: false,
    commentWebsocketengine: undefined,
    commentPodcastId: undefined,
    commentQueueName: undefined,
    commentEventToHandle: [],
    commentsForPlayer:{},
    podcastsCommentsConfig: {},
  }),
  getters: {
  },
  actions: {
    async fetchCommentsForPlayer(podcastId: number){
      if(!this.commentsForPlayer[podcastId]){
        this.commentsForPlayer[podcastId] = [];
        const size = 50;
        let first = 0;
        let keepFetching = true;
        while (keepFetching) {
          const data = await octopusApi.fetchDataPublicWithParams<ListClassicReturn<CommentPodcast>>(2, "comment/list", {
            first: first,
            size: size,
            podcastId: podcastId,
            sort: "DATE_DESC",
            hideAnswers: true,
            state: "VALIDATED"
          });
          first+=size;
          this.commentsForPlayer[podcastId] =  this.commentsForPlayer[podcastId].concat(data.result);
          keepFetching = data.count !== this.commentsForPlayer[podcastId].length;
        }
      }
      return this.commentsForPlayer[podcastId];
    },
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
      //1642d8b8-7af7-412a-bf50-c5f96b163bf3
      //525d0736eb47d5482b60de5704635f4e
      //TODO if not authenticated (+hash)
      this.commentUser = {
        name:cookies.methods.getCookie("comment-octopus-name"),
        uuid:uuid,
        uuidHash: murmurHash3.x64.hash128(uuid)
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
    async getCommentsConfig(podcast: Podcast): Promise<CommentsConfig> {
      if (this.podcastsCommentsConfig[podcast.podcastId]) {
        return this.podcastsCommentsConfig[podcast.podcastId];
      }
      try {
        this.podcastsCommentsConfig[podcast.podcastId] = await octopusApi.fetchData<CommentsConfig>(2, "config/podcast/" + podcast.podcastId);
      } catch {
        this.podcastsCommentsConfig[podcast.podcastId] = await octopusApi.fetchData<CommentsConfig>(2, "config/emission/" + podcast.emission.emissionId);
      }
      return this.podcastsCommentsConfig[podcast.podcastId];
    },
    resetPodcastsConfig() {
      this.podcastsCommentsConfig = {};
    },
    updatePodcastsConfig(podcastId:number, config: CommentsConfig) {
      this.podcastsCommentsConfig[podcastId] = config;
    },
    getCanPostCommentAllowed(config: CommentsConfig, podcast: Podcast): boolean{
      if("NONE"===config.comments.commentAllowed){
        return false;
      }
      const rightsLiveOnly = "LIVE_ONLY"===config.comments.commentAllowed && undefined !==podcast.conferenceId && "READY_TO_RECORD"===podcast.processingStatus;
      const rightsLiveRecord = "LIVE_AND_REPLAY"===config.comments.commentAllowed && undefined !==podcast.conferenceId;
      return "ALL"===config.comments.commentAllowed || rightsLiveOnly || rightsLiveRecord;
    },
    getCanPostComment(config: CommentsConfig|undefined, podcast: Podcast|undefined, isAuth: boolean):boolean{
      if(!config || !podcast){return false;}
      return this.getCanPostCommentAllowed(config, podcast) && (!config.comments.authRequired || (config.comments.authRequired && isAuth));
    },
    getCanReportAbuse(config: CommentsConfig|undefined, isAuth: boolean):boolean{
      if(!config){return false;}
      return (!config.abuse.authRequired || (config.abuse.authRequired && isAuth));
    },


    /*--------------------------------------------------------------------------------------------------------------
    |                                                                                                              |
    |                                           Initializing state                                                 |
    |                                                                                                              |
    --------------------------------------------------------------------------------------------------------------*/
    async initialize() {
      
      const commentUrl = state.octopusApi.commentsUrl?? "https://comments.dev2.saooti.org/";
      const url =  StringHelper.trimChar(commentUrl.replace("https://", ""),"/");
      const engine = new CommentEngine(url);
      await engine.initialize();
      this.commentWebsocketengine = engine;
      this.commentInitialized = true;
    },

    /*--------------------------------------------------------------------------------------------------------------
    |                                                                                                              |
    |                                      Comments management methods                                             |
    |                                                                                                              |
    --------------------------------------------------------------------------------------------------------------*/
    unsubscribeToEvent() {
      if (!this.commentWebsocketengine) {
        return;
      }
      if (
        this.commentPodcastId &&
        this.commentQueueName &&
        this.commentWebsocketengine.isPodcastCommentEventConnected(this.commentPodcastId)
      ) {
        this.commentWebsocketengine.unsubscribeToPodcastCommentEventBus(
          this.commentPodcastId,this.commentQueueName,
        );
      }
    },

    subscribeToEvents() {
      if (!this.commentWebsocketengine) {
        return;
      }
      if (this.commentPodcastId && this.commentQueueName) {
        this.commentWebsocketengine.subscribeToPodcastCommentEventBus(
          this.commentPodcastId,
          this.commentQueueName,
          (message) => {
            this.commentEventToHandleUpdate(message);
          },
        );
      }
    },

    async initComments(podcastId: number, organisationId: string) {
      this.unsubscribeToEvent();
      this.commentQueueName="/topic/comment." +organisationId+"."+ podcastId;
      this.commentPodcastId = podcastId;
      this.subscribeToEvents();
    },
    async unsubscribeComments() {
      this.unsubscribeComments();
      this.commentPodcastId = undefined;
    },

    /*--------------------------------------------------------------------------------------------------------------
    |                                                                                                              |
    |                              Managing conference WebSocket Event Received                                    |
    |                                                                                                              |
    --------------------------------------------------------------------------------------------------------------*/
    commentEventHandled() {
      this.commentEventToHandle.shift();
    },
    commentEventToHandleUpdate(eventToHandle:CommentMessage) {
      if (eventToHandle) {
        this.commentEventToHandle.push(eventToHandle);
      } else {
        this.commentEventToHandle.splice(0, this.commentEventToHandle.length);
      }
    },
  },
});
