<template>
  <div class="d-flex align-items-center flex-grow-1 ps-2">
    <PlayerImage />
    <PlayerPlayButton :player-error="playerError" />
    <div class="text-light player-grow-content">
      <div class="d-flex" :class="!radioUrl ? 'mb-1' : ''">
        <PlayerTitle
          class="flex-grow-1"
          :player-error="playerError"
          :hls-ready="hlsReady"
        />
        <div
          v-if="!playerError && (!radioUrl || isAdPlaying)"
          class="hide-phone"
        >
          {{ displayPlayTime }} / {{ displayTotalTime }}
        </div>
      </div>
      <PlayerChaptering />
      <PlayerProgressBar
        :show-timeline="showTimeline"
        :comments="comments"
        :display-alert-bar="displayAlertBar"
        :percent-live-progress="percentLiveProgress"
        :duration-live-position="durationLivePosition"
        :player-error="playerError"
        :listen-time="listenTime"
      />
    </div>
    <!-- <AdsSkipButton/> -->
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
import { playerDisplayTime } from "../../mixins/player/playerDisplayTime";
import imageProxy from "../../mixins/imageProxy";
import PlayerTimeline from "./elements/PlayerTimeline.vue";
import PlayerTitle from "./elements/PlayerTitle.vue";
import PlayerChaptering from "./chaptering/PlayerChaptering.vue";
/* import AdsSkipButton from "./ads/AdsSkipButton.vue"; */
import PlayerImage from "./elements/PlayerImage.vue";
import PlayerPlayButton from "./elements/PlayerPlayButton.vue";
import { defineAsyncComponent, defineComponent } from "vue";
const PlayerProgressBar = defineAsyncComponent(
  () => import("./progressbar/PlayerProgressBar.vue"),
);
export default defineComponent({
  name: "PlayerCompact",

  components: {
    PlayerProgressBar,
    PlayerTimeline,
    PlayerChaptering,
    PlayerImage,
    PlayerPlayButton,
    PlayerTitle,
    /* AdsSkipButton */
  },
  mixins: [playerDisplayTime, imageProxy],

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
}
</style>
