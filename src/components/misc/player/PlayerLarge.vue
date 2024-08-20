<template>
  <div
    class="d-flex flex-column align-items-center my-2 flex-grow-1 text-light position-relative overflow-y-auto"
  >
    <button
      :title="$t('Reduce')"
      class="player-reduce-button btn bg-transparent text-light saooti-down"
      @click="changePlayerLargeVersion"
    />
    <PlayerImage :image-width="200" />
    <PlayerTitle
      class="w-100 px-2 mt-2 text-center"
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
        class="btn fs-1 bg-transparent text-light saooti-recule"
        :disabled="isAdPlaying"
        @click="seekClick(-15)"
      />
      <PlayerPlayButton :player-error="playerError" :is-big-button="true" />

      <button
        title="+15''"
        class="btn fs-1 bg-transparent text-light saooti-avance"
        :disabled="isAdPlaying"
        @click="seekClick(15)"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { playerDisplayTime } from "../../mixins/player/playerDisplayTime";
import imageProxy from "../../mixins/imageProxy";
import PlayerChaptering from "./chaptering/PlayerChaptering.vue";
import PlayerImage from "./elements/PlayerImage.vue";
import PlayerTitle from "./elements/PlayerTitle.vue";
import PlayerPlayButton from "./elements/PlayerPlayButton.vue";
import { defineAsyncComponent, defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { usePlayerStore } from "@/stores/PlayerStore";
const RadioHistory = defineAsyncComponent(
  () => import("./radio/RadioHistory.vue"),
);
const PlayerProgressBar = defineAsyncComponent(
  () => import("./progressbar/PlayerProgressBar.vue"),
);
export default defineComponent({
  name: "PlayerLarge",

  components: {
    PlayerProgressBar,
    RadioHistory,
    PlayerChaptering,
    PlayerImage,
    PlayerPlayButton,
    PlayerTitle,
  },
  mixins: [playerDisplayTime, imageProxy],

  props: {
    playerError: { default: false, type: Boolean },
    displayAlertBar: { default: false, type: Boolean },
    percentLiveProgress: { default: 0, type: Number },
    durationLivePosition: { default: 0, type: Number },
    listenTime: { default: 0, type: Number },
    hlsReady: { default: false, type: Boolean },
  },

  emits: ["stopPlayer", "changePlayerLargeVersion"],
  data() {
    return {
      showTimeline: false as boolean,
    };
  },
  computed: {
    ...mapState(usePlayerStore, ["playerPodcast", "playerLive"]),
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerUpdateSeekTime"]),
    stopPlayer() {
      this.$emit("stopPlayer");
    },
    changePlayerLargeVersion() {
      this.$emit("changePlayerLargeVersion");
    },
    seekClick(addTime: number): void {
      const audioPlayer: HTMLAudioElement | null =
        document.querySelector("#audio-player");
      if (!audioPlayer) {
        return;
      }
      const seekTo = audioPlayer.currentTime + addTime;
      if (this.playerPodcast || this.playerLive) {
        this.playerUpdateSeekTime(seekTo > 0 ? seekTo : 0);
      }
      audioPlayer.currentTime = seekTo > 0 ? seekTo : 0;
    },
  },
});
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
    @media (max-width: 960px) {
      padding: 0.5rem;
    }
  }

  .saooti-recule,
  .saooti-avance {
    font-size: 2rem !important;
  }
  .transcript-bg {
    background: #3e3e3e;
  }
}
</style>
