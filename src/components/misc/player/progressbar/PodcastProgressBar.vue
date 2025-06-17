<template>
  <ProgressBar
    v-if="!playerError"
    :main-progress="percentProgress"
    :secondary-progress="percentLiveProgress"
    :alert-bar="displayAlertBar ? durationLivePosition : undefined"
    :class="classProgress"
    :in-player="true"
    @mouseup="seekTo"
  />
  <CommentPlayer v-if="showComments" />
</template>

<script setup lang="ts">
import { usePlayerStore } from "../../../../stores/PlayerStore";
import ProgressBar from "../../ProgressBar.vue";
import {  defineAsyncComponent, computed } from "vue";
const CommentPlayer = defineAsyncComponent(
  () => import("../../../display/comments/CommentPlayer.vue"),
);

//Props 
const props = defineProps({
  classProgress: { default: "", type: String },
  showComments: { default: false, type: Boolean },
  displayAlertBar: { default: false, type: Boolean },
  percentLiveProgress: { default: 0, type: Number },
  durationLivePosition: { default: 0, type: Number },
  playerError: { default: false, type: Boolean },
  listenTime: { default: 0, type: Number },
})

//Composables
const playerStore = usePlayerStore();


//Computed
const percentProgress = computed(() => {
  if (!playerStore.playerElapsed) {
    return 0;
  }
  return playerStore.playerElapsed * 100;
});


//Methods
function seekTo(event: MouseEvent): void {
  const audioPlayer: HTMLAudioElement | null =
    document.querySelector("#audio-player");
  if (!audioPlayer || null === event.currentTarget) {
    return;
  }
  const rect = (event.currentTarget as Element).getBoundingClientRect();
  const barWidth = (event.currentTarget as Element).clientWidth;
  const x = event.clientX - rect.left;
  const percentPosition = x / barWidth;
  if (playerStore.playerLive && percentPosition * 100 >= props.percentLiveProgress) return;
  const seekTime = playerStore.playerTotal * percentPosition;
  isSeekTo(audioPlayer, seekTime);
}
function isSeekTo(audioPlayer: HTMLAudioElement, seekTime: number): void {
  if (playerStore.playerPodcast || playerStore.playerLive) {
    playerStore.playerUpdateSeekTime(seekTime);
  } else {
    audioPlayer.currentTime = seekTime;
  }
}
</script>
