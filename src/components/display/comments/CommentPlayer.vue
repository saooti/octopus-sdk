<template>
  <div class="comment-player-container comment-item-container">
    <div
      class="c-hand"
      v-for="c in comments"
      :key="c.comId"
      @mouseenter="displayContent = c"
      @mouseleave="displayContent = undefined"
      @click="displayContent = c"
    >
      <div
        :style="'margin-left: ' + percentPosition(c.timeline) + '%'"
        class="comment-border"
      ></div>
      <div
        :style="'margin-left: calc(' + percentPosition(c.timeline) + '% - 7px)'"
        :class="'status-' + c.status"
        :data-selenium="'comment-' + seleniumFormat(c.name)"
      ></div>
    </div>
    <div class="comment-content" v-if="displayContent">
      <div class="primary-color flex-shrink">{{ displayContent.name }}</div>
      <div class="ml-1 mr-1">-</div>
      <div class="text-truncate">{{ displayContent.content }}</div>
    </div>
  </div>
</template>

<style lang="scss">
.comment-player-container {
  position: relative;
  width: 100%;
  height: 3rem;
  display: flex;
  @media (max-width: 960px) {
    display: none;
  }
  .comment-border {
    width: auto;
    position: absolute;
    border-left: solid 1px #555;
    height: 20px;
  }
  .status-Valid,
  .status-Invalid,
  .status-Pending {
    margin-top: 20px;
    position: absolute;
  }
  .comment-content {
    margin-top: auto;
    font-size: 0.7rem;
    display: flex;
  }
}
</style>

<script lang="ts">
import { CommentPodcast } from '@/store/class/comment';
import { selenium } from '../../mixins/functions';
export default {
  name: 'CommentPlayer',
  mixins:[selenium],

  components: {},
  props: {
    comments: { default: undefined as Array<CommentPodcast>|undefined },
    totalTime: { default: 0 as number},
  },

  data() {
    return {
      displayContent: undefined as CommentPodcast|undefined,
    };
  },
  methods: {
    percentPosition(time: number): number {
      let realDuration = this.totalTime;
      if (
        this.$store.state.player.podcast &&
        this.$store.state.player.podcast.duration
      ) {
        realDuration = Math.round(
          this.$store.state.player.podcast.duration / 1000
        );
      }
      if (realDuration < this.totalTime) {
        time = time + (this.totalTime - realDuration);
      }
      return Math.round((time * 100) / this.totalTime);
    },
  },
};
</script>
