import { state } from "../../../stores/ParamSdkStore";
import octopusApi from "@saooti/octopus-api";
import { CommentPodcast } from "@/stores/class/general/comment";
import { defineComponent } from "vue";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useCommentStore } from "@/stores/CommentStore";
import { mapState } from "pinia";
import { FetchParam } from "@/stores/class/general/fetchParam";
import { InterfacePageable } from "@/stores/class/general/interfacePageable";
export const playerComment = defineComponent({
  data() {
    return {
      comments: [] as Array<CommentPodcast>,
    };
  },
  computed: {
    ...mapState(useCommentStore, [
      "commentActualPodcastId",
      "commentTotalCount",
      "commentLoaded",
    ]),
    ...mapState(usePlayerStore, ["playerPodcast", "playerLive"]),
    organisationId(): string | undefined {
      return state.generalParameters.organisationId;
    },
  },

  watch: {
    commentLoaded(): void {
      this.initComments(true);
    },
  },
  methods: {
    editRight(organisation: string): boolean {
      return (
        (true === state.generalParameters.isCommments &&
          this.organisationId === organisation) ||
        true === state.generalParameters.isAdmin
      );
    },
    initCommentCurrentPodcast(podcastId?: number): Array<number> {
      if (podcastId && this.commentActualPodcastId === podcastId) {
        this.comments = this.commentLoaded;
        if (
          this.commentLoaded &&
          this.commentLoaded.length < this.commentTotalCount
        ) {
          return [this.commentLoaded.length, this.commentTotalCount];
        }
      }
      return [0, 0];
    },
    async fetchComments(
      first: number,
      count: number,
      podcastId?: number,
      organisation?: string,
    ) {
      const size = 50;
      while (0 === first || this.comments.length < count) {
        const param: FetchParam = {
          first: first,
          size: size,
          podcastId: podcastId,
        };
        if (!this.editRight(organisation ?? "")) {
          param.status = ["Valid"];
        }
        const data = await octopusApi.postDataPublic<
          InterfacePageable<CommentPodcast>
        >(2, "getRootCom", param);
        first += size;
        count = data.totalElements;
        this.comments = this.comments
          .concat(data.content)
          .filter((c: CommentPodcast) => {
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
        podcastId = this.playerLive.podcastId;
        organisation = this.playerLive.organisation.id;
      }
      if (refresh && podcastId && this.commentActualPodcastId !== podcastId) {
        return;
      }
      const param = this.initCommentCurrentPodcast(podcastId);
      const first = param[0];
      const count = param[1];
      if (
        (!podcastId || this.commentActualPodcastId === podcastId) &&
        0 === first
      ) {
        return;
      }
      await this.fetchComments(first, count, podcastId, organisation);
    },
  },
});
