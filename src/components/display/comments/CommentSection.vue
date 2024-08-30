<template>
  <div v-show="displayCommentSection" class="module-box">
    <div class="d-flex align-items-center">
      <h2 class="mb-0 me-2">{{ $t("Podcast's comments") }}</h2>
      <button
        :title="$t('Refresh')"
        class="btn btn-transparent saooti-refresh"
        @click="reload = !reload"
      />
    </div>
    <CommentInput
      v-if="canPostComment"
      :podcast="podcast"
      @new-comment="newComment"
    />
    <CommentList
      v-model:nbComments="nbComments"
      class="mt-5"
      :podcast="podcast"
      :reload="reload"
      :config="configPodcast"
      :event-to-handle="eventToHandle"
    />
  </div>
</template>

<script lang="ts">
import { state } from "../../../stores/ParamSdkStore";
import cookies from "../../mixins/cookies";
import { Podcast } from "@/stores/class/general/podcast";
import { defineAsyncComponent, defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useCommentStore } from "@/stores/CommentStore";
import {
  CommentMessage,
  CommentsConfig,
} from "@/stores/class/config/commentsConfig";
import { CommentPodcast } from "@/stores/class/general/comment";
const CommentList = defineAsyncComponent(() => import("./CommentList.vue"));
const CommentInput = defineAsyncComponent(() => import("./CommentInput.vue"));
export default defineComponent({
  name: "CommentSection",
  components: {
    CommentList,
    CommentInput,
  },
  mixins: [cookies],
  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
  },
  data() {
    return {
      reload: false as boolean,
      configPodcast: undefined as CommentsConfig | undefined,
      nbComments: 0 as number,
      eventToHandle: undefined as CommentMessage | undefined,
    };
  },
  computed: {
    ...mapState(useCommentStore, [
      "commentEventToHandle",
      "commentInitialized",
      "commentPodcastId",
    ]),
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
    displayCommentSection(): boolean {
      return this.canPostComment || this.nbComments > 0;
    },
    canPostComment(): boolean {
      return this.getCanPostComment(
        this.configPodcast,
        this.podcast,
        this.authenticated,
      );
    },
    eventActive(): boolean {
      return undefined !== this.podcast?.conferenceId;
    },
  },
  watch: {
    commentEventToHandle: {
      deep: true,
      handler(): void {
        if (
          !this.commentEventToHandle.length ||
          this.commentPodcastId !== this.podcast?.podcastId
        )
          return;
        this.eventToHandle = this.commentEventToHandle[0];
        this.commentEventHandled();
      },
    },
  },
  created() {
    this.fetchPodcastCommentsConfig();
  },
  methods: {
    ...mapActions(useCommentStore, [
      "getCommentsConfig",
      "getCanPostComment",
      "commentEventHandled",
      "initialize",
      "initComments",
    ]),
    async fetchPodcastCommentsConfig() {
      if (!this.podcast?.podcastId) {
        return;
      }
      this.configPodcast = await this.getCommentsConfig(this.podcast);
      if (!this.eventActive) {
        return;
      }
      this.initLiveComments();
    },
    async initLiveComments(): Promise<void> {
      if (!this.podcast?.podcastId || !this.podcast?.organisation.id) {
        return;
      }
      if (!this.commentInitialized) {
        await this.initialize();
      }
      await this.initComments(
        this.podcast.podcastId,
        this.podcast.organisation.id,
      );
    },
    newComment(comment: CommentPodcast) {
      if (this.eventActive) {
        return;
      }
      this.eventToHandle = { type: "CREATE", comment: comment };
    },
  },
});
</script>
