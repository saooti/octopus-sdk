import { state } from '../../../stores/ParamSdkStore';
import octopusApi from '@saooti/octopus-api';
import { CommentPodcast } from '@/stores/class/general/comment';
import { defineComponent } from 'vue';
import { usePlayerStore } from '@/stores/PlayerStore';
import { useGeneralStore } from '@/stores/GeneralStore';
import { mapState } from 'pinia';
import { FetchParam } from '@/stores/class/general/fetchParam';
import { InterfacePageable } from '@/stores/class/general/interfacePageable';
export const playerComment = defineComponent({
  data() {
    return {
      comments: [] as Array<CommentPodcast>,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ['generalComments']),
    ...mapState(usePlayerStore, ['playerPodcast', 'playerLive']),
    commentsLoaded(){
      return this.generalComments.loadedComments;
    },
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
  },

  watch: {
    commentsLoaded(): void {
      this.initComments(true);
    },
  },
  methods: {
    editRight(organisation: string): boolean {
      return (true===state.generalParameters.isCommments && this.organisationId === organisation) || true===state.generalParameters.isAdmin;
    },
    initCommentCurrentPodcast(podcastId?: number): Array<number>{
      if (
        podcastId &&
        this.generalComments.actualPodcastId === podcastId
      ) {
        this.comments = this.commentsLoaded;
        if (
          this.commentsLoaded &&
          this.commentsLoaded.length < this.generalComments.totalCount
        ) {
          return [this.commentsLoaded.length, this.generalComments.totalCount];
        }
      }
      return [0, 0];
    },
    async fetchComments(first: number, count:number,podcastId?:number,organisation?:string){
      const size = 50;
      while (0 === first || this.comments.length < count) {
        const param: FetchParam = {
          first: first,
          size: size,
          podcastId: podcastId,
        };
        if (!this.editRight(organisation? organisation : '')) {
          param.status = ['Valid'];
        }
        const data = await octopusApi.postDataPublic<InterfacePageable<CommentPodcast>>(2, 'getRootCom',param);
        first += size;
        count = data.totalElements;
        this.comments = this.comments.concat(data.content).filter((c: CommentPodcast) => {
          return null !== c;
        });
      }
    },
    async initComments(refresh = false): Promise<void> {
      let podcastId, organisation;
      if (this.playerPodcast) {
        podcastId = this.playerPodcast.podcastId;
        organisation = this.playerPodcast.organisation.id;
      } else if (this.playerLive) {
        podcastId = this.playerLive.livePodcastId;
        organisation = this.playerLive.organisation.id;
      }
      if (
        refresh &&
        podcastId &&
        this.generalComments.actualPodcastId !== podcastId
      ) {
        return;
      }
      const param= this.initCommentCurrentPodcast(podcastId);
      let first = param[0];
      let count = param[1];
      if (
        (!podcastId ||
          this.generalComments.actualPodcastId === podcastId) &&
        0 === first
      ){
        return;
      }
      await this.fetchComments(first, count, podcastId, organisation);
    },
  },
})