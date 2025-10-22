<template>
  <section
    id="octopus-player-component"
    class="player-container"
    :class="{ 
      'player-video': playerStore.playerVideo,
      'overflow-hidden': !display
     }"
    :style="{ height: playerStore.playerHeight }"
    @transitionend="onHidden"
  >
    <audio
      id="audio-player"
      :src="!playerStore.playerLive && !playerStore.playerRadio ? audioUrlToPlay : undefined"
      autoplay
      @timeupdate="onTimeUpdate"
      @ended="onFinished"
      @playing="onPlay"
      @durationChange="onTimeUpdate"
      @error="onError"
      @seeked="onSeeked"
      @pause="onPause"
      @loadedmetadata="checkDelaytWithStitching"
    />
    <div id="ad-container"></div>
    <template v-if="displayWithTimeout">
      <PlayerVideo v-if="playerStore.playerVideo && isNotVideoPage" />
      <template v-else-if="!playerStore.playerVideo">
        <PlayerCompact
          v-if="!playerStore.playerLargeVersion"
          :player-error="playerError"
          :display-alert-bar="displayAlertBar"
          :percent-live-progress="percentLiveProgress"
          :duration-live-position="durationLivePosition"
          :listen-time="listenTime"
          :hls-ready="hlsReady"
          @stop-player="stopPlayer"
          @change-player-large-version="playerStore.playerUpdateLargeVersion(true)"
        />
        <PlayerLarge
          v-else
          :player-error="playerError"
          :display-alert-bar="displayAlertBar"
          :percent-live-progress="percentLiveProgress"
          :duration-live-position="durationLivePosition"
          :listen-time="listenTime"
          :hls-ready="hlsReady"
          @stop-player="stopPlayer"
          @change-player-large-version="playerStore.playerUpdateLargeVersion(false)"
        />
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import {usePlayerLogic} from "../../composable/player/usePlayerLogic";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { defineAsyncComponent, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
const PlayerVideo = defineAsyncComponent(
  () => import("./video/PlayerVideo.vue"),
);
const PlayerCompact = defineAsyncComponent(
  () => import("../player/PlayerCompact.vue"),
);
const PlayerLarge = defineAsyncComponent(
  () => import("../player/PlayerLarge.vue"),
);

//Emits
const emit = defineEmits(['hide']);

//Data
const displayWithTimeout= ref(false);
const forceHide= ref(false);

//Composable
const {
  audioUrlToPlay,
  listenTime,
  playerError,
  percentLiveProgress, 
  durationLivePosition,
  displayAlertBar,
  hlsReady, 
  checkDelaytWithStitching, 
  stopPlayer, 
  onError, 
  onTimeUpdate, 
  onSeeked, 
  onFinished, 
  onPlay
} = usePlayerLogic(forceHide);
const playerStore = usePlayerStore();
const route = useRoute();



// Computed
const display = computed(() => { return "STOPPED" !== playerStore.playerStatus;});
const isNotVideoPage = computed(() => { return "video" !== route.name});

// Watch
watch(()=>playerStore.playerHeight, async () => {
  emit("hide", 0 === playerStore.playerHeight);
});
watch(display, async () => {
  if (display.value) {
    displayWithTimeout.value = display.value;
  } else {
    setTimeout(() => {
      displayWithTimeout.value = display.value;
    }, 3000);
  }
});

//Methods
function onHidden(): void {
  if (forceHide.value) {
    playerStore.playerPlay();
    forceHide.value = false;
  }
}
function onPause() {
  if ("PLAYING" === playerStore.playerStatus) {
    playerStore.playerChangeStatus(true);
  }
}
</script>

<style lang="scss">
.octopus-app {
  .player-container {
    max-height: 94%;
    position: sticky;
    overflow: visible;
    z-index: 12;
    width: 100%;
    bottom: 0;
    display: flex;
    flex-direction: column;
    transition: height 1s;
    background: var(--octopus-player-color) !important;
    font-size: 1rem;

    .medium-text {
      font-size: 0.65rem;
    }

    .small-text {
      font-size: 0.5rem;
    }

    @media (width <= 960px) {
      .d-flex {
        flex-wrap: nowrap !important;
      }
    }
  }

  #ad-container {
    display: none;
  }
}
</style>
