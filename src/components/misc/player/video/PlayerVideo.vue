<template>
  <teleport to=".octopus-app">
    <template v-if="playerVideo">
      <button class="btn btn-transparent video-close" @click="closePlayer">
        <WindowCloseIcon />
      </button>
      <div class="video-wrapper">
        <PlayerYoutubeEmbed v-if="youtubeId" :youtube-id="youtubeId" />
        <PlayerVideoDigiteka v-else-if="!playerLive" :video-id="playerPodcast?.video?.videoId" />
        <PlayerVideoHls v-else :hls-url="hlsVideoUrl" />
      </div>
    </template>
  </teleport>
</template>
<script lang="ts">
import youtubeVideoHelper from "../../../../helper/youtubeVideoHelper";
import WindowCloseIcon from "vue-material-design-icons/WindowClose.vue";
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
const PlayerYoutubeEmbed = defineAsyncComponent(
  () => import("../video/PlayerYoutubeEmbed.vue"),
);
export default defineComponent({
  name: "PlayerVideo",

  components: {
    PlayerVideoDigiteka,
    PlayerVideoHls,
    PlayerYoutubeEmbed,
    WindowCloseIcon,
  },
  data() {
    return {
      youtubeId: undefined as string|undefined,
    };
  },
  computed: {
    ...mapState(useApiStore, ["hlsUrl"]),
    ...mapState(usePlayerStore, ["playerVideo", "playerLive", "playerPodcast"]),
    hlsVideoUrl(): string {
      if (!this.playerLive) {
        return "";
      }
      return `${this.hlsUrl}live/video_dev.${this.playerLive.conferenceId}/index.m3u8`;
    },
  },
  created(){
    this.youtubeId = youtubeVideoHelper.getYoutubeId((this.playerPodcast ?? this.playerLive )?.tags ?? []);
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

  @media (width <= 500px) {
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
