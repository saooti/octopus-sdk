<template>
  <div v-if="!hidePlay || recordingLive" :class="classicPodcastPlay ? '' : 'img-blur-background'">
    <div v-if="!classicPodcastPlay" class="live-image-status bg-dark">
      {{ textVisible }}
    </div>
    <div class="multi-buttons-play" :class="justButtons ? 'play-button-relative' : ''">
      <template v-if="!isLiveToBeRecorded">
        <button 
          class="d-flex"
          :title="playingPodcast? t('Pause') : t('Play')"
          @mouseenter="hoverType = 'audio'"
          @mouseleave="hoverType = ''" 
          @click="play(false)"
        >
          <PlayIcon
            v-if="!playingPodcast || (playingPodcast && playerStore.playerVideo)"
            :size="'audio' === hoverType ? 50 : 40"
          />
          <PodcastIsPlaying v-if="playingPodcast && !playerStore.playerVideo"/>
          <time v-if="!isVideoPodcast" class="ms-1" :datetime="durationIso">{{ durationString }}</time>
        </button>
        <button 
          v-if="isVideoPodcast"
          :title="t('Video')" 
          :disabled="playerStore.playerVideo"
          @click="play(true)"
          @mouseenter="hoverType = 'video'"
          @mouseleave="hoverType = ''"
        >
          <PlayVideoIcon v-if="!playerStore.playerVideo" :size="'video' === hoverType ? 50 : 40" />
          <PodcastIsPlaying v-if="playingPodcast && playerStore.playerVideo"/>
          <time class="ms-2" :datetime="durationIso">{{ durationString }}</time>
        </button>
        <div v-if="!classicPodcastPlay" class="special-icon-play-button">
          <component :is="iconName" :size="16" />
        </div>
      </template>
      <component :is="iconName" v-else :size="50" :title="textVisible" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PlayVideoIcon from "../../icons/PlayVideoIcon.vue";
import PlayIcon from "vue-material-design-icons/Play.vue";
import ClockOutlineIcon from "vue-material-design-icons/ClockOutline.vue";
import CheckIcon from "vue-material-design-icons/Check.vue";
import TimerSandEmptyIcon from "vue-material-design-icons/TimerSandEmpty.vue";
import EyeOffOutlineIcon from "vue-material-design-icons/EyeOffOutline.vue";
import CancelIcon from "vue-material-design-icons/Cancel.vue";
import AlertIcon from "vue-material-design-icons/Alert.vue";
import DurationHelper from "../../../helper/durationHelper";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import { useAuthStore } from "../../../stores/AuthStore";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { computed, defineAsyncComponent, ref } from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
dayjs.extend(duration);
const PodcastIsPlaying = defineAsyncComponent(() => import("./PodcastIsPlaying.vue"));


//Props 
const props = defineProps({
  podcast: { default: () => ({}), type: Object as () => Podcast },
  hidePlay: { default: false, type: Boolean },
  fetchConference: { default: undefined, type: Object as () => Conference },
  justButtons: { default: false, type: Boolean },
})


//Data 
const hoverType = ref("");

//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const playerStore = usePlayerStore();
const router = useRouter();

//Computed
const isVideoPodcast = computed(() => {
  return (
    (props.fetchConference?.videoProfile?.includes("video_") &&
      "READY_TO_RECORD" === props.podcast.processingStatus) ||
    undefined !== props.podcast.video?.videoId
  );
});
const playingLive = computed(() => {
  return (
    undefined !== props.fetchConference &&
    "null" !== props.fetchConference.toString() &&
    playerStore.playerLive?.conferenceId === props.fetchConference.conferenceId
  );
});
const playingPodcast = computed(() => {
  return (
    playerStore.playerPodcast?.podcastId === props.podcast.podcastId ||
    playingLive.value
  );
});
const isLiveToBeRecorded = computed(() => undefined === props.fetchConference && isLiveReadyToRecord.value);
const isLiveReadyToRecord = computed(() => {
  return (
    undefined !== props.podcast?.conferenceId &&
    0 !== props.podcast.conferenceId &&
    "READY_TO_RECORD" === props.podcast.processingStatus
  );
});
const isLiveValidAndVisible = computed(() => {
  return (
    undefined !== props.podcast &&
    false !== props.podcast.valid &&
    undefined !== props.podcast.availability.visibility &&
    props.podcast.availability.visibility
  );
});
const classicPodcastPlay = computed(() => {
  return (
    isLiveValidAndVisible.value &&
    !isLiveToBeRecorded.value &&
    ("READY_TO_RECORD" === props.podcast.processingStatus ||
      "READY" === props.podcast.processingStatus ||
      ("PROCESSING" === props.podcast.processingStatus &&
        undefined === authStore.authOrgaId))
  );
});
const iconName = computed(() => {
  if (isLiveToBeRecorded.value) return ClockOutlineIcon;
  if ("READY" === props.podcast.processingStatus || props.fetchConference) {
    if (!props.podcast.valid) return CheckIcon;
    if (
      !props.podcast.availability.visibility &&
      props.podcast.availability.date
    )
      return ClockOutlineIcon;
    return EyeOffOutlineIcon;
  }
  if (
    "PLANNED" === props.podcast.processingStatus ||
    "PROCESSING" === props.podcast.processingStatus
  )
    return TimerSandEmptyIcon;
  if ("CANCELED" === props.podcast.processingStatus) return CancelIcon;
  return AlertIcon;
});
const textVisible = computed(() => {
  if (isLiveToBeRecorded.value){
    return t("Podcast linked to waiting live");
  }
    
  if ("READY" === props.podcast.processingStatus || props.fetchConference) {
    if (!props.podcast.valid) return t("Podcast to validate");
    if (
      !props.podcast.availability.visibility &&
      props.podcast.availability.date
    ){
      return t("Podcast publish in future");
    }
    return t("Podcast no visible");
  }
  if (
    "PLANNED" === props.podcast.processingStatus ||
    "PROCESSING" === props.podcast.processingStatus
  ){
    return t("Podcast in process");
  }
  if ("CANCELED" === props.podcast.processingStatus){
    return t("Podcast in cancelled status");
  }
  return t("Podcast in error");
});
const recordingLive = computed(() => {
  return (
    undefined !== props.fetchConference &&
    -1 !== props.fetchConference.conferenceId &&
    ("RECORDING" === props.fetchConference.status ||
      "PENDING" === props.fetchConference.status)
  );
});
const durationString = computed(() => {
  return DurationHelper.formatDuration(
    Math.round(props.podcast.duration / 1000),
  );
});
const durationIso = computed(() => {
  if (!props.podcast || props.podcast.duration <= 1) return "";
  return dayjs.duration({ milliseconds: props.podcast.duration }).toISOString();
});

//Methods
function play(isVideo: boolean): void {
  if (isLiveToBeRecorded.value) {
    return;
  }
  if (playingPodcast.value && isVideo === playerStore.playerVideo) {
    playerStore.playerChangeStatus("PLAYING" === playerStore.playerStatus);
    return;
  }
  if (isVideo && state.player.isVideoPage) {
    router.push("/main/pub/video/" + props.podcast.podcastId);
    return;
  }
  if (!recordingLive.value) {
    playerStore.playerPlay(props.podcast, isVideo);
  } else {
    playerStore.playerPlay(
      {
        ...props.podcast,
        ...{ conferenceId: props.fetchConference?.conferenceId },
      },
      isVideo,
    );
  }
}
</script>

<style lang="scss">
.octopus-app {
  .img-blur-background{
    position: absolute;
    inset: 0;
    background-color:var(--octopus-background-transparent);
  }

  .live-image-status {
    text-align: center;
    width: 100%;
    font-size: 0.6rem;
    padding: 0.2rem 0;
    color: white;
    text-transform: uppercase;
    position: absolute;
    top: 0;
  }

  .special-icon-play-button {
    width: 30px;
    height: 30px;
    background-color: oklch(88.97% 0.1399 89.64deg);
    color: black;
    border-radius: 50%;
    position: absolute;
    right: -15px;
    top: -20px;
    font-size: 0.9rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .multi-buttons-play{
    display: flex;
    position: absolute;
    bottom: 0;
    font-size: 1rem;
    color: white;
    background-color: var(--octopus-primary-less-transparent);
    border-radius: var(--octopus-border-radius);

    button{
      color: white;
      background-color: transparent;
      border: 0;
      display: flex;
      align-items: center;
      padding:  0.2rem;
    }
  }

  .play-button-relative.multi-buttons-play{
    position: relative;
  }
}
</style>
