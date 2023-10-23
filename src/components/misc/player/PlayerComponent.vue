<template>
  <div
    class="player-container"
    :class="playerVideo ? 'player-video' : ''"
    :style="{ height: playerHeight }"
    @transitionend="onHidden"
  >
    <template v-if="display">
      <PlayerVideo v-if="playerVideo" />
      <template v-else>
        <audio
          id="audio-player"
          :src="!playerLive && !playerRadio ? audioUrlToPlay : undefined"
          autoplay
          @timeupdate="onTimeUpdate"
          @ended="onFinished"
          @playing="onPlay"
          @durationChange="onTimeUpdate"
          @error="onError"
          @seeked="onSeeked"
          @pause="onPause"
        />
        <PlayerCompact
          v-if="!playerLargeVersion"
          :player-error="playerError"
          :comments="comments"
          :display-alert-bar="displayAlertBar"
          :percent-live-progress="percentLiveProgress"
          :duration-live-position="durationLivePosition"
          :listen-time="listenTime"
          :hls-ready="hlsReady"
          @stop-player="stopPlayer"
          @change-player-large-version="playerUpdateLargeVersion(true)"
        />
        <PlayerLarge
          v-else
          :player-error="playerError"
          :comments="comments"
          :display-alert-bar="displayAlertBar"
          :percent-live-progress="percentLiveProgress"
          :duration-live-position="durationLivePosition"
          :listen-time="listenTime"
          :hls-ready="hlsReady"
          @stop-player="stopPlayer"
          @change-player-large-version="playerUpdateLargeVersion(false)"
        />
      </template>
    </template>
  </div>
</template>
<script lang="ts">
import { CommentPodcast } from "@/stores/class/general/comment";
import { playerLogic } from "../../mixins/player/playerLogic";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
const PlayerVideo = defineAsyncComponent(() => import("./PlayerVideo.vue"));
const PlayerCompact = defineAsyncComponent(() => import("../player/PlayerCompact.vue"));
const PlayerLarge = defineAsyncComponent(() => import("../player/PlayerLarge.vue"));
export default defineComponent({
  name: "PlayerComponent",

  components: {
    PlayerCompact,
    PlayerLarge,
    PlayerVideo,
  },
  mixins: [playerLogic],
  emits: ["hide"],
  data() {
    return {
      forceHide: false as boolean,
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      downloadId: null as string | null,
      playerError: false as boolean,
      listenError: false as boolean,
      percentLiveProgress: 0 as number,
      durationLivePosition: 0 as number,
      displayAlertBar: false as boolean,
      comments: [] as Array<CommentPodcast>,
      audioUrlToPlay: "" as string,
      hlsReady: false as boolean,
    };
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerStatus",
      "playerHeight",
      "playerLargeVersion",
      "playerVideo",
    ]),
    display() {
      return "STOPPED" !== this.playerStatus;
    },
  },

  watch: {
    playerHeight(): void {
      this.$emit("hide", 0 === this.playerHeight);
    },
  },

  methods: {
    ...mapActions(usePlayerStore, [
      "playerPlay",
      "playerUpdateLargeVersion",
      "playerChangeStatus",
    ]),
    onHidden(): void {
      if (this.forceHide) {
        this.playerPlay();
        this.forceHide = false;
      }
    },
    onPause() {
      if ("PLAYING" === this.playerStatus) {
        this.playerChangeStatus(true);
      }
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .player-container {
    max-height: 94%;
    position: sticky;
    overflow: hidden;
    z-index: 12;
    width: 100%;
    bottom: 0;
    display: flex;
    flex-direction: column;
    transition: height 1s;
    background: #282828 !important;
    font-size: 1rem;

    @media (max-width: 960px) {
      .d-flex {
        flex-wrap: nowrap !important;
      }
    }
  }
}
</style>
