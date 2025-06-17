<template>
  <div
    class="d-flex flex-column align-items-center my-2 flex-grow-1 text-light position-relative overflow-y-auto"
  >
    <button
      :title="t('Reduce')"
      class="player-reduce-button btn bg-transparent text-light"
      @click="changePlayerLargeVersion"
    >
      <ChevronDownIcon :size="40" />
    </button>
    <PlayerImage :image-width="200" />
    <PlayerTitle
      :player-error="playerError"
      :hls-ready="hlsReady"
      title-class="h3"
    />
    <PlayerChaptering class="justify-content-center w-100" />
    <div class="player-grow-large-content">
      <PlayerProgressBar
        class-progress="large"
        :show-comments="true"
        :display-alert-bar="displayAlertBar"
        :percent-live-progress="percentLiveProgress"
        :duration-live-position="durationLivePosition"
        :player-error="playerError"
        :listen-time="listenTime"
      />
      <div
        v-if="!playerError && (!radioUrl || isAdPlaying)"
        class="d-flex justify-content-between"
      >
        <div>{{ displayPlayTime }}</div>
        <div>{{ displayTotalTime }}</div>
      </div>
      <RadioHistory v-if="radioUrl" />
    </div>

    <div
      v-if="'' != transcriptText && !isAdPlaying"
      class="flex-grow-1 d-flex align-items-center w-100"
    >
      <div class="flex-grow-1 p-1 text-center mx-3 transcript-bg rounded">
        {{ transcriptText }}
      </div>
    </div>
    <div class="d-flex align-items-center flex-grow-1">
      <button
        title="-15''"
        class="btn bg-transparent text-light"
        :disabled="isAdPlaying"
        @click="seekClick(-15)"
      >
        <Rewind15Icon :size="44" />
      </button>
      <PlayerPlayButton :player-error="playerError" :is-big-button="true" />

      <button
        title="+15''"
        class="btn bg-transparent text-light"
        :disabled="isAdPlaying"
        @click="seekClick(15)"
      >
        <FastForward15Icon :size="44" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Rewind15Icon from "vue-material-design-icons/Rewind15.vue";
import FastForward15Icon from "vue-material-design-icons/FastForward15.vue";
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import {usePlayerDisplayTime} from "../../composable/player/usePlayerDisplayTime";
import PlayerChaptering from "./chaptering/PlayerChaptering.vue";
import PlayerImage from "./elements/PlayerImage.vue";
import PlayerTitle from "./elements/PlayerTitle.vue";
import PlayerPlayButton from "./elements/PlayerPlayButton.vue";
import { defineAsyncComponent } from "vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useI18n } from "vue-i18n";
const RadioHistory = defineAsyncComponent(
  () => import("./radio/RadioHistory.vue"),
);
const PlayerProgressBar = defineAsyncComponent(
  () => import("./progressbar/PlayerProgressBar.vue"),
);

//Props
defineProps( {
  playerError: { default: false, type: Boolean },
  displayAlertBar: { default: false, type: Boolean },
  percentLiveProgress: { default: 0, type: Number },
  durationLivePosition: { default: 0, type: Number },
  listenTime: { default: 0, type: Number },
  hlsReady: { default: false, type: Boolean },
});

//Emits
const emit = defineEmits(['changePlayerLargeVersion']);


//Composables
const { 
  transcriptText,
  radioUrl,
  isAdPlaying,
  displayPlayTime,
  displayTotalTime,
 } = usePlayerDisplayTime();
const { t } = useI18n();
const playerStore = usePlayerStore();

//Methods
function changePlayerLargeVersion() {
  emit("changePlayerLargeVersion");
}
function seekClick(addTime: number): void {
  const audioPlayer: HTMLAudioElement | null =
    document.querySelector("#audio-player");
  if (!audioPlayer) {
    return;
  }
  const seekTo = audioPlayer.currentTime + addTime;
  if (playerStore.playerPodcast || playerStore.playerLive) {
    playerStore.playerUpdateSeekTime(seekTo > 0 ? seekTo : 0);
  }
  audioPlayer.currentTime = seekTo > 0 ? seekTo : 0;
}
</script>

<style lang="scss">
.octopus-app {
  .player-container .img-box {
    width: 10rem;
    height: 10rem;
  }

  .player-reduce-button {
    position: absolute;
    right: 0;
    font-size: 1.2rem !important;
  }

  .player-grow-large-content {
    width: 100%;
    padding: 1rem 2rem;

    @media (width <= 960px) {
      padding: 0.5rem;
    }
  }

  .transcript-bg {
    background: oklch(from var(--octopus-player-color) calc(l + 0.1) c h);
  }
}
</style>
