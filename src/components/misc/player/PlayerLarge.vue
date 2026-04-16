<template>
  <div
    class="d-flex flex-column align-items-center my-2 flex-grow-1 player-text position-relative overflow-y-auto"
  >
    <button
      :title="t('Reduce')"
      class="player-reduce-button btn bg-transparent player-text"
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


    <!-- Transcription -->
    <div
      v-if="'' != transcriptText && !isAdPlaying"
      class="transcript"
    >
      <div class="flex-grow-1 p-1 text-center w-100 transcript-bg rounded">
        {{ transcriptText }}
      </div>
      <ClassicLoading
        v-if="generatingTranscriptLanguage"
        small
        spinner-color="white"
        :loading-text="$t('Player - Generating subtitles', { language: generatingTranscriptLanguage })"
      />

      <div
        v-if="transcriptInfo"
        class="flex-grow-1 p-1 text-center transcript-info rounded"
      >
        {{ transcriptInfo }}
      </div>
    </div>

    <!-- Buttons -->
    <div class="d-flex align-items-center flex-grow-1">
      <button
        title="-15''"
        class="btn bg-transparent player-text"
        :disabled="isAdPlaying"
        @click="seekClick(-15)"
      >
        <Rewind15Icon :size="44" />
      </button>
      <PlayerPlayButton :player-error="playerError" :is-big-button="true" />

      <button
        title="+15''"
        class="btn bg-transparent player-text"
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
import { computed, defineAsyncComponent } from "vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useI18n } from "vue-i18n";
import { state as sdkParams } from "../../../stores/ParamSdkStore";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { usePlayerTranscript } from "../../composable/player/usePlayerTranscript";

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
const { generatingTranscriptLanguage } = usePlayerTranscript();

/** Info message to display regarding transcript */
const transcriptInfo = computed((): string|undefined => {
  if (sdkParams.player.showAITranscriptWarning === true) {
    return t('Player - Transcription - AI Warning');
  }
});

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

<style scoped lang="scss">
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

  .transcript {
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
    width: 100%;
    
    .transcript-info {
      font-style: italic;
      font-size: 16px;
    }
  }

  .transcript-bg {
    background: var(--octopus-player-transcript-bg-color);
  }
}

.player-text {
  color: var(--octopus-player-text-color);
}
</style>
