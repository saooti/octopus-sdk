<template>
  <div v-if="commentsToDisplay.length" class="comment-player-container">
    <div
      v-for="c in commentsToDisplay"
      :key="c.commentId"
      class="c-hand"
      @mouseenter="displayContent = c"
      @mouseleave="displayContent = undefined"
      @click="displayContent = c"
    >
      <div
        :style="'margin-left: ' + percentPosition(c.timeline ?? 0) + '%'"
        class="comment-border"
      />
      <div
        :style="
          'margin-left: calc(' + percentPosition(c.timeline ?? 0) + '% - 7px)'
        "
        class="status-comment"
        :data-selenium="'comment-' + seleniumFormat(c.poster.userName)"
      />
    </div>
    <div v-if="displayContent" class="d-flex align-itemx-center mt-4">
      <div class="text-primary flex-shrink-0">
        {{ displayContent.poster.userName }}
      </div>
      <div class="ms-1 me-1">-</div>
      <div class="text-truncate">
        {{ displayContent.content }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CommentPodcast } from "@/stores/class/general/comment";
import selenium from "../../mixins/selenium";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { useCommentStore } from "@/stores/CommentStore";
export default defineComponent({
  name: "CommentPlayer",
  mixins: [selenium],
  data() {
    return {
      displayContent: undefined as CommentPodcast | undefined,
      commentsToDisplay: [] as Array<CommentPodcast>,
    };
  },
  computed: {
    ...mapState(usePlayerStore, ["playerPodcast", "playerTotal"]),
    podcastId() {
      return this.playerPodcast?.podcastId;
    },
  },
  watch: {
    podcastId: {
      immediate: true,
      handler() {
        this.initComments();
      },
    },
  },
  methods: {
    ...mapActions(useCommentStore, ["fetchCommentsForPlayer"]),
    async initComments() {
      if (this.playerPodcast?.podcastId) {
        this.commentsToDisplay = await this.fetchCommentsForPlayer(
          this.playerPodcast.podcastId,
        );
      }
    },
    percentPosition(time: number): number {
      let realDuration = this.playerTotal;
      if (this.playerPodcast?.duration) {
        realDuration = Math.round(this.playerPodcast.duration / 1000);
      }
      if (realDuration < this.playerTotal) {
        time = time + (this.playerTotal - realDuration);
      }
      return Math.round((time * 100) / this.playerTotal);
    },
  },
});
</script>

<style lang="scss">
@import "../../../assets/comments.scss";
.octopus-app {
  .comment-player-container {
    position: relative;
    width: 100%;
    height: 60px;
    display: flex;
    @media (max-width: 960px) {
      display: none;
    }
    .comment-border {
      width: auto;
      position: absolute;
      border-left: solid 1px #ffffff;
      height: 10px;
    }
    .status-comment {
      margin-top: 10px;
      position: absolute;
      background: white;
    }
  }
}
</style>
