<template>
  <div
    class="d-flex flex-column align-items-center my-2 flex-grow-1 text-light position-relative overflow-y-auto"
  >
    <button
      :title="$t('Reduce')"
      class="player-reduce-button btn bg-transparent text-light saooti-down"
      @click="changePlayerLargeVersion"
    />
    <router-link v-if="isImage && podcastImage" :to="podcastShareUrl">
      <img
        v-lazy="proxyImageUrl(podcastImage, '200')"
        width="200"
        height="200"
        :alt="$t('Podcast image')"
        class="img-box"
      />
    </router-link>
    <div class="d-flex w-100 px-2 mt-2 text-center">
      <div v-if="playerError" class="text-warning mx-2">
        {{ $t("Podcast play error") + " - " }}
      </div>
      <div class="flex-grow-1 text-truncate h3">
        {{ podcastTitle }}
      </div>
    </div>
    <div class="player-grow-large-content">
      <PlayerProgressBar
        v-if="!radioUrl"
        ref="progressbar"
        class-progress="large"
        :show-timeline="showTimeline"
        :comments="comments"
        :display-alert-bar="displayAlertBar"
        :percent-live-progress="percentLiveProgress"
        :duration-live-position="durationLivePosition"
        :player-error="playerError"
        :listen-time="listenTime"
      />
      <RadioProgressBar v-else />
      <div class="d-flex justify-content-between">
        <div>{{ playedTime }}</div>
        <div>{{ totalTime }}</div>
      </div>
      <RadioHistory v-if="radioUrl" />
    </div>

    <div
      v-if="'' != transcriptText"
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
        @click="seekClick(-15)"
      />
      <button
        v-if="!playerError"
        :title="$t('Play')"
        :class="{
          'saooti-play': isPaused,
          'saooti-pause': isPlaying,
          '': !isPaused && !isPlaying,
        }"
        class="btn play-big-button-box text-light bg-primary"
        @click="switchPausePlay"
      >
        <ClassicSpinner v-if="!isPaused && !isPlaying" />
      </button>
      <button
        title="+15''"
        class="btn fs-1 bg-transparent text-light saooti-avance"
        @click="seekClick(15)"
      />
    </div>
    <PlayerTimeline v-model:showTimeline="showTimeline" :comments="comments" />
  </div>
</template>
<script lang="ts">
import ClassicSpinner from "../ClassicSpinner.vue";
import { playerDisplay } from "../../mixins/player/playerDisplay";
import imageProxy from "../../mixins/imageProxy";
import PlayerTimeline from "./PlayerTimeline.vue";
import { defineAsyncComponent, defineComponent } from "vue";
import { CommentPodcast } from "@/stores/class/general/comment";
const RadioProgressBar = defineAsyncComponent(
  () => import("./radio/RadioProgressBar.vue"),
);
const RadioHistory = defineAsyncComponent(
  () => import("./radio/RadioHistory.vue"),
);
const PlayerProgressBar = defineAsyncComponent(
  () => import("./PlayerProgressBar.vue"),
);
export default defineComponent({
  name: "PlayerLarge",

  components: {
    PlayerProgressBar,
    RadioProgressBar,
    PlayerTimeline,
    ClassicSpinner,
    RadioHistory,
  },
  mixins: [playerDisplay, imageProxy],

  props: {
    playerError: { default: false, type: Boolean },
    comments: { default: () => [], type: Array as () => Array<CommentPodcast> },
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
  methods: {
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
      (
        this.$refs.progressbar as InstanceType<typeof PlayerProgressBar>
      ).isSeekTo(audioPlayer, seekTo > 0 ? seekTo : 0);
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
  .play-big-button-box {
    height: 5rem;
    width: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
    border-radius: 50% !important;
    font-size: 2.5rem !important;
    flex-shrink: 0;
    cursor: pointer;
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
