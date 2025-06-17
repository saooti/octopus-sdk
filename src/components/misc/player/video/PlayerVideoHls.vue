<template>
  <div
    id="player-video-hls"
    class="video-player"
    :class="responsive ? 'video-responsive-wrapper' : ''"
  >
    <div v-if="errorPlay.length" class="video-live-error">{{ errorPlay }}</div>
    <video
      id="video-element-hls"
      ref="videoelement"
      class="video-js"
      playsinline
    ></video>
  </div>
</template>
<script setup lang="ts">
import { usePlayerStore } from "../../../../stores/PlayerStore";
import {usePlayerLogicProgress} from "../../../composable/player/usePlayerLogicProgress";
import videojs, { VideoJsPlayer } from "video.js";
import qualitySelectorHls from "videojs-quality-selector-hls";
if (undefined === videojs.getPlugin("qualitySelectorHls")) {
  videojs.registerPlugin("qualitySelectorHls", qualitySelectorHls);
}
import { computed, onMounted, onUnmounted, Ref, ref, useTemplateRef } from "vue";
import { useAuthStore } from "../../../../stores/AuthStore";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  hlsUrl: { default: "", type: String },
  responsive: { default: false, type: Boolean },
  isSecured: { default: true, type: Boolean },
})

//Data
const errorPlay = ref("");
const useVideoSrc = ref(false);
const player: Ref<VideoJsPlayer | undefined> = ref(false);
const playing = ref(false);
const isPaused = ref(false);
const stalledTimout: Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);
const videoElementRef = useTemplateRef('videoelement');


//Composables
const { t } = useI18n();
const { downloadId, initLiveDownloadId, onTimeUpdateProgress, endListeningProgress} = usePlayerLogicProgress();
const authStore = useAuthStore();
const playerStore = usePlayerStore();



//Computed
const videoElement = computed(() => {
  return videoElementRef?.value as HTMLVideoElement;
});
const videoOptions = computed(() => {
  return {
    autoplay: true,
    controls: true,
    liveui: true,
    sources: [
      {
        src: props.hlsUrl,
        type: "application/x-mpegURL",
      },
    ],
    html5: {
      vhs: {
        overrideNative: !videojs.browser.IS_SAFARI,
      },
      nativeAudioTracks: false,
      nativeVideoTracks: false,
    },
  };
});


onMounted(()=>{
  playerStore.playerUpdatePlayerHlsUrl(props.hlsUrl);
  useVideoSrc.value =
    "" !== videoElement.value.canPlayType("application/vnd.apple.mpegurl") &&
    !navigator.userAgent.includes("Android");
  playLive();
})

onUnmounted(()=>{
  if (playing.value) {
    stopLive();
  }
})


//Methods
function definedStalledTimeout() {
  isPaused.value = false;
  stalledTimout.value = setTimeout(() => {
    if (isPaused.value) {
      return;
    }
    videoClean();
    playLive();
  }, 15000);
}
async function playLive(): Promise<void> {
  clearTimeout(stalledTimout.value);
  definedStalledTimeout();
  await initLiveDownloadId();
  if (useVideoSrc.value) {
    playLiveIos();
    return;
  }
  if (props.isSecured && authStore.authParam.accessToken) {
    const globalXhrRequestHook = (options: any) => {
      options.beforeSend = (xhr: XMLHttpRequest) => {
        xhr.setRequestHeader("Authorization", "Bearer "+authStore.authParam.accessToken);
      };
      return options;
    };
    videojs.Vhs.xhr.onRequest(globalXhrRequestHook);
  }
  player.value = videojs(
    document.getElementById("video-element-hls") as Element,
    videoOptions.value,
    () => {
      player.value.qualitySelectorHls({ displayCurrentQuality: true });
      errorPlay.value = "";
      playing.value = true;
    },
  );
  player.value.on("error", (error: any) => {
    stopLive();
    if (error.description?.includes("403")) {
      errorPlay.value = t("Video is unavailable");
    } else {
      errorPlay.value = t("Podcast play error");
    }
  });
  player.value.on("seeking", () => {
    playerStore.playerUpdateSeekTime(player.value?.currentTime() ?? 0);
  });
  player.value.on("pause", () => {
    isPaused.value = true;
  });
  player.value.on("timeupdate", () => {
    clearTimeout(stalledTimout.value);
    definedStalledTimeout();
    onTimeUpdateVideo();
  });
  player.value.on("seeking", () => {
    playerStore.playerUpdateSeekTime(player.value?.currentTime() ?? 0);
  });
}

async function playLiveIos(): Promise<void> {
  videoElement.value.onloadedmetadata = () => {
    const playPromise = videoElement.value.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          errorPlay.value = "";
          playing.value = true;
        })
        .catch(() => {
          playing.value = false;
        });
    }
  };
  videoElement.value.onerror = async () => {
    stopLive();
    errorPlay.value = t("Podcast play error");
  };
  videoElement.value.ontimeupdate = async () => {
    clearTimeout(stalledTimout.value);
    definedStalledTimeout();
    onTimeUpdateVideo();
  };
  videoElement.value.onpause = async () => {
    isPaused.value = true;
  };
  videoElement.value.onseeking = async () => {
    playerStore.playerUpdateSeekTime(videoElement.value.currentTime);
  };
  if (props.isSecured && authStore.authParam.accessToken) {
    videoElement.value.src = props.hlsUrl + "access_token="+authStore.authParam.accessToken;
  }else{
    videoElement.value.src = props.hlsUrl;
  }
  videoElement.value.src = props.hlsUrl;
}

function videoClean(): void {
  if (useVideoSrc.value) {
    videoElement.value.pause();
    videoElement.value.removeAttribute("src");
    videoElement.value.load();
    return;
  }
  if (player.value) {
    player.value.dispose();
    //Redraw
    const video_parent = document.getElementById("player-video-hls");
    if (video_parent) {
      const video = document.createElement("video");
      video.id = "video-element-hls";
      video.className = "video-js";
      video.preload = "auto";
      video.setAttribute("playsinline", "true");
      video_parent.appendChild(video);
    }
  }
}
function stopLive(): void {
  clearTimeout(stalledTimout.value);
  errorPlay.value = "";
  videoClean();
  playing.value = false;
  endListeningProgress();
}
function onTimeUpdateVideo(): void {
  if (!downloadId.value) {
    return;
  }
  const currentTime =player.value?.currentTime() ?? videoElement.value.currentTime;
  onTimeUpdateProgress(currentTime);
}
</script>

<style lang="scss">
@use "video.js";
@use "../../../../style/videoPlayer";

.octopus-app {
  .video-live-error {
    text-align: center;
    width: 100%;
    font-size: 1rem;
    font-weight: bold;
    padding: 0.2rem 0;
    color: white;
    position: absolute;
    top: 0;
    background: var(--octopus-danger);
    z-index: 1;
  }

  .video-js {
    width: 500px;
    height: 281px;
  }
}
</style>
