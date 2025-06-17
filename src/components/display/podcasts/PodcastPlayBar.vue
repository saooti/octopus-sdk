<template>
  <div class="d-flex align-items-center">
    <PodcastPlayBasicButton v-if="displayButonPlay" :podcast="podcast"/>
    <div class="d-flex align-items-center podcast-play-bar flex-grow-1">
      <div class="me-2">
        {{ playedTime }}
      </div>
      <div class="position-relative flex-grow-1">
        <ProgressBar
          :main-progress="percentProgress"
          class="medium"
          @mouseup="seekTo"
        />
      </div>
      <div class="ms-2">
        {{ totalTime }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressBar from "../../misc/ProgressBar.vue";
import DurationHelper from "../../../helper/durationHelper";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { computed, defineAsyncComponent } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
const PodcastPlayBasicButton = defineAsyncComponent(() => import("./PodcastPlayBasicButton.vue"));


//Props 
const props = defineProps({
  podcast: { default: () => ({}), type: Object as () => Podcast },
  displayButonPlay:{ default: false, type: Boolean },
})

//Composables
const playerStore = usePlayerStore();

//Computed
const percentProgress = computed(() => {
  if (props.podcast?.podcastId !== playerStore.playerPodcast?.podcastId) {
    return 0;
  }
  return !playerStore.playerElapsed ? 0 : playerStore.playerElapsed * 100;
});
const playedTime = computed(() => {
  if (props.podcast?.podcastId === playerStore.playerPodcast?.podcastId) {
    if (
      playerStore.playerElapsed &&
      playerStore.playerElapsed > 0 &&
      playerStore.playerTotal &&
      playerStore.playerTotal > 0
    ) {
      return DurationHelper.formatDuration(
        Math.round(playerStore.playerElapsed * playerStore.playerTotal),
      );
    }
  }
  return "00:00";
});
const totalTime = computed(() => DurationHelper.formatDuration(Math.round(props.podcast.duration / 1000)));

//Methods
function seekTo(event: MouseEvent): void {
  if (
    !playerStore.playerPodcast ||
    props.podcast?.podcastId !== playerStore.playerPodcast.podcastId
  ) {
    return;
  }
  const rect = (event.currentTarget as Element).getBoundingClientRect();
  const barWidth = (event.currentTarget as Element).clientWidth;
  const x = event.clientX - rect.left;
  const percentPosition = x / barWidth;
  playerStore.playerUpdateSeekTime(playerStore.playerTotal * percentPosition);
}
</script>