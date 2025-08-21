<template>
  <teleport to=".octopus-app">
    <template v-if="playerStore.playerVideo">
      <button class="btn btn-transparent video-close" @click="closePlayer">
        <WindowCloseIcon />
      </button>
      <div class="video-wrapper">
        <PlayerYoutubeEmbed v-if="youtubeId" :youtube-id="youtubeId" />
        <PlayerVideoDigiteka v-else-if="!playerStore.playerLive" :video-id="playerStore.playerPodcast?.video?.videoId" />
        <PlayerVideoHls v-else :hls-url="hlsVideoUrl" :is-secured="isSecured"/>
      </div>
    </template>
  </teleport>
</template>
<script setup lang="ts">
import youtubeVideoHelper from "../../../../helper/youtubeVideoHelper";
import WindowCloseIcon from "vue-material-design-icons/WindowClose.vue";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { useApiStore } from "../../../../stores/ApiStore";
import { defineAsyncComponent, ref, Ref, computed, onMounted } from "vue";
const PlayerVideoDigiteka = defineAsyncComponent(
  () => import("../video/PlayerVideoDigiteka.vue"),
);
const PlayerVideoHls = defineAsyncComponent(
  () => import("../video/PlayerVideoHls.vue"),
);
const PlayerYoutubeEmbed = defineAsyncComponent(
  () => import("../video/PlayerYoutubeEmbed.vue"),
);

//Data 
const youtubeId: Ref<string|undefined> = ref(undefined);

//Composables
const apiStore = useApiStore();
const playerStore = usePlayerStore();


//Computed
const isSecured = computed(() => "SECURED" === playerStore.playerLive?.organisation?.privacy);
const hlsVideoUrl = computed(() => {
  if (!playerStore.playerHlsIdentifier) {
    return "";
  }
  return `${apiStore.hlsUrl}live/video_${playerStore.playerHlsIdentifier}/index.m3u8`;
});

onMounted(()=>{
  youtubeId.value = youtubeVideoHelper.getYoutubeId((playerStore.playerPodcast ?? playerStore.playerLive )?.tags ?? []);
})

//Methods
function closePlayer() {
  playerStore.playerPlay();
}
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
