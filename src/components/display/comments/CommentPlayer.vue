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

<script setup lang="ts">
import { CommentPodcast } from "@/stores/class/general/comment";
import {useSelenium} from "../../composable/useSelenium";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { computed, Ref, ref, watch } from "vue";
import { useCommentStore } from "../../../stores/CommentStore";

//Data 
const displayContent: Ref<CommentPodcast | undefined> = ref(undefined);
const commentsToDisplay: Ref<Array<CommentPodcast>> = ref([]);

//Composables
const { seleniumFormat } = useSelenium();
const playerStore = usePlayerStore();
const commentStore = useCommentStore();

//Computed
const podcastId = computed(() => playerStore.playerPodcast?.podcastId);


//Watch
watch(podcastId, () => {initComments()}, {immediate: true});


//Methods
async function initComments() {
  if (playerStore.playerPodcast?.podcastId) {
    commentsToDisplay.value = await commentStore.fetchCommentsForPlayer(
      playerStore.playerPodcast.podcastId,
    );
  }
}
function percentPosition(time: number): number {
  let realDuration = playerStore.playerTotal;
  if (playerStore.playerPodcast?.duration) {
    realDuration = Math.round(playerStore.playerPodcast.duration / 1000);
  }
  if (realDuration < playerStore.playerTotal) {
    time = time + (playerStore.playerTotal - realDuration);
  }
  return Math.round((time * 100) / playerStore.playerTotal);
}
</script>

<style lang="scss">
@use "../../../style/comments";

.octopus-app {
  .comment-player-container {
    position: relative;
    width: 100%;
    height: 60px;
    display: flex;

    @media (width <= 960px) {
      display: none;
    }
    
    .comment-border {
      width: auto;
      position: absolute;
      border-left: solid 1px white;
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
