<template>
  <div class="d-flex align-items-center flex-grow-1 ps-2">
    <router-link v-if="isImage && podcastImage" :to="podcastShareUrl">
      <img
        v-lazy="proxyImageUrl(podcastImage, '48')"
        width="48"
        height="48"
        :alt="$t('Podcast image')"
        class="player-image"
      />
    </router-link>
    <button
      v-if="!playerError"
      :title="$t('Play')"
      :class="{
        'saooti-play': isPaused,
        'saooti-pause': isPlaying,
        'p-0': !isPaused && !isPlaying,
      }"
      class="btn play-button-box text-light bg-primary"
      @click="switchPausePlay"
    >
      <ClassicSpinner v-if="!isPaused && !isPlaying" :small="true" />
    </button>
    <div class="text-light player-grow-content">
      <div class="d-flex" :class="!radioUrl ? 'mb-1' : ''">
        <div v-if="playerError" class="text-warning mx-2">
          {{ $t("Podcast play error") + " - " }}
        </div>
        <div class="flex-grow-1 text-truncate">
          {{ podcastTitle }}
        </div>
        <div v-if="!playerError && !radioUrl" class="hide-phone">
          {{ playedTime }} / {{ totalTime }}
        </div>
      </div>
      <PlayerChaptering />
      <PlayerProgressBar
        v-if="!radioUrl"
        :show-timeline="showTimeline"
        :comments="comments"
        :display-alert-bar="displayAlertBar"
        :percent-live-progress="percentLiveProgress"
        :duration-live-position="durationLivePosition"
        :player-error="playerError"
        :listen-time="listenTime"
      />
      <RadioProgressBar v-else />
    </div>
    <button
      :title="'' != transcriptText ? $t('View transcript') : $t('Enlarge')"
      class="btn play-button-box btn-transparent text-light saooti-up me-0"
      @click="changePlayerLargeVersion"
    />
    <button
      :title="$t('Close')"
      class="btn play-button-box btn-transparent text-light saooti-remove"
      @click="stopPlayer"
    />
    <PlayerTimeline
      v-if="!radioUrl"
      v-model:showTimeline="showTimeline"
      :comments="comments"
    />
  </div>
</template>
<script lang="ts">
import { CommentPodcast } from "@/stores/class/general/comment";
import { playerDisplay } from "../../mixins/player/playerDisplay";
import imageProxy from "../../mixins/imageProxy";
import ClassicSpinner from "../ClassicSpinner.vue";
import PlayerTimeline from "./PlayerTimeline.vue";
import PlayerChaptering from "./PlayerChaptering.vue";
import { defineAsyncComponent, defineComponent } from "vue";
const RadioProgressBar = defineAsyncComponent(
  () => import("./radio/RadioProgressBar.vue"),
);
const PlayerProgressBar = defineAsyncComponent(
  () => import("./PlayerProgressBar.vue"),
);
export default defineComponent({
  name: "PlayerCompact",

  components: {
    PlayerProgressBar,
    RadioProgressBar,
    PlayerTimeline,
    ClassicSpinner,
    PlayerChaptering,
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
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .player-grow-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
    font-size: 0.8rem;
    padding: 0 0.5rem;
  }
  .player-image {
    border-radius: $octopus-borderradius;
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 0.5rem;
    cursor: pointer;
    /** PHONES*/
    @media (max-width: 450px) {
      height: 1.8rem;
      width: 1.8rem;
    }
  }
  .play-button-box {
    height: 2.2rem;
    width: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
    border-radius: 50% !important;
    font-size: 1rem !important;
    flex-shrink: 0;
    cursor: pointer;
  }
}
</style>
