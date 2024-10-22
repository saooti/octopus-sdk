<template>
  <teleport to=".octopus-app">
    <template v-if="playerVideo">
      <button
        class="btn btn-transparent video-close saooti-remove"
        @click="closePlayer"
      />
      <div class="video-wrapper">
        <PlayerVideoDigiteka v-if="!playerLive" :video-id="videoId" />
        <PlayerVideoHls v-else :hls-url="hlsUrl" />
      </div>
    </template>
  </teleport>
</template>
<script lang="ts">
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { useApiStore } from "../../../../stores/ApiStore";
import { mapState, mapActions } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
const PlayerVideoDigiteka = defineAsyncComponent(
  () => import("../video/PlayerVideoDigiteka.vue"),
);
const PlayerVideoHls = defineAsyncComponent(
  () => import("../video/PlayerVideoHls.vue"),
);
export default defineComponent({
  name: "PlayerVideo",

  components: {
    PlayerVideoDigiteka,
    PlayerVideoHls,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(useApiStore, ["hlsUrl"]),
    ...mapState(usePlayerStore, ["playerVideo", "playerLive", "playerPodcast"]),
    hlsUrl(): string {
      if (!this.playerLive) {
        return "";
      }
      return `${this.hlsUrl}live/video_dev.${this.playerLive.conferenceId}/index.m3u8`;
    },
    videoId(): string | undefined {
      return this.playerPodcast?.video?.videoId;
    },
  },

  methods: {
    ...mapActions(usePlayerStore, ["playerPlay"]),
    closePlayer() {
      this.playerPlay();
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .video-wrapper {
    border-radius: 1rem;
    overflow: hidden;
    position: fixed;
    bottom: 2.5rem;
    right: 0;
    z-index: 10;
  }
  .video-close {
    position: fixed;
    bottom: 16.5rem;
    right: 1rem;
  }
  @media (max-width: 500px) {
    .video-close {
      bottom: 10.5rem;
    }
    .video-wrapper iframe {
      width: 100%;
      max-height: 150px;
    }
  }
}
</style>
