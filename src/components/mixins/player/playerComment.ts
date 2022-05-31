
import { mapState } from 'vuex';
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
import { CommentPodcast } from '@/store/class/general/comment';
import { StoreState } from '@/store/typeAppStore';
import { defineComponent } from 'vue';
import { FetchParam } from '@/store/class/general/fetchParam';
export const playerComment = defineComponent({
  data() {
    return {
      comments: [] as Array<CommentPodcast>,
    };
  },
  computed: {
    ...mapState({
      commentsLoaded(state: StoreState){ return state.comments.loadedComments},
      live(state: StoreState) { return state.player.live},
      podcast(state: StoreState) { return state.player.podcast}
    }),
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
      if (
        (state.generalParameters.isCommments &&
          this.organisationId === organisation) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    async initComments(refresh = false): Promise<void> {
      let podcastId, organisation;
      if (this.podcast) {
        podcastId = this.podcast.podcastId;
        organisation = this.podcast.organisation.id;
      } else if (this.live) {
        podcastId = this.live.livePodcastId;
        organisation = this.live.organisation.id;
      }
      if (
        refresh &&
        podcastId &&
        this.$store.state.comments.actualPodcastId !== podcastId
      ) {
        return;
      }
      let first = 0;
      let count = 0;
      const size = 50;
      if (
        podcastId &&
        this.$store.state.comments.actualPodcastId === podcastId
      ) {
        this.comments = this.commentsLoaded;
        if (
          this.commentsLoaded &&
          this.commentsLoaded.length < this.$store.state.comments.totalCount
        ) {
          first = this.commentsLoaded.length;
          count = this.$store.state.comments.totalCount;
        }
      }
      if (
        (!podcastId ||
          this.$store.state.comments.actualPodcastId === podcastId) &&
        0 === first
      )
        return;
      while (0 === first || this.comments.length < count) {
        const param: FetchParam = {
          first: first,
          size: size,
          podcastId: podcastId,
        };
        if (!this.editRight(organisation? organisation : '')) {
          param.status = ['Valid'];
        }
        const data = await octopusApi.fetchRootComments(param);
        first += size;
        count = data.totalElements;
        this.comments = this.comments.concat(data.content).filter((c: CommentPodcast) => {
          return null !== c;
        });
      }
    },
  },
})