<template>
  <div class="d-flex align-items-center flex-grow-1 ps-2">
    <PlayerImage />
    <PlayerPlayButton :player-error="playerError" />
    <div class="text-light player-grow-content">
      <div class="d-flex" :class="!radioUrl ? 'mb-1' : ''">
        <PlayerTitle :player-error="playerError" :hls-ready="hlsReady" />
        <div
          v-if="!playerError && (!radioUrl || isAdPlaying)"
          class="hide-phone ps-2 flex-shrink-0"
        >
          {{ displayPlayTime }} / {{ displayTotalTime }}
        </div>
      </div>
      <PlayerChaptering />
      <PlayerProgressBar
        :display-alert-bar="displayAlertBar"
        :percent-live-progress="percentLiveProgress"
        :duration-live-position="durationLivePosition"
        :player-error="playerError"
        :listen-time="listenTime"
      />
    </div>
    <PlayerSpeedButton v-if="!radioUrl" />
    <button
      id="player-up-btn"
      :title="'' != transcriptText ? $t('View transcript') : $t('Enlarge')"
      class="btn play-button-box btn-transparent text-light me-0"
      @click="changePlayerLargeVersion"
    >
      <ChevronUpIcon />
    </button>
    <button
      :title="$t('Close')"
      class="btn play-button-box btn-transparent text-light"
      @click="stopPlayer"
    >
      <WindowCloseIcon />
    </button>
  </div>
</template>
<script setup lang="ts">
import ChevronUpIcon from "vue-material-design-icons/ChevronUp.vue";
import WindowCloseIcon from "vue-material-design-icons/WindowClose.vue";
import {usePlayerDisplayTime} from "../../composable/player/usePlayerDisplayTime";
import PlayerTitle from "./elements/PlayerTitle.vue";
import PlayerChaptering from "./chaptering/PlayerChaptering.vue";
import PlayerImage from "./elements/PlayerImage.vue";
import PlayerPlayButton from "./elements/PlayerPlayButton.vue";
import PlayerSpeedButton from "./elements/PlayerSpeedButton.vue";
import { defineAsyncComponent} from "vue";
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
const emit = defineEmits(['stopPlayer', 'changePlayerLargeVersion']);

//Composables
const { 
  transcriptText,
  radioUrl,
  isAdPlaying,
  displayPlayTime,
  displayTotalTime,
 } = usePlayerDisplayTime();

function stopPlayer() {
  emit("stopPlayer");
}
function changePlayerLargeVersion() {
  emit("changePlayerLargeVersion");
}


</script>

<style lang="scss">
.octopus-app .player-grow-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  font-size: 0.8rem;
  padding: 0 0.5rem;
}
</style>
