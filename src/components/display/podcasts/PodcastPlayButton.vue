<!--
  Component displaying the play button on a podcast.
  If the podcast is not available, an overlay is displayed with a message.
-->
<template>
  <div
    v-if="!hidePlay || recordingLive"
    :class="{ 'img-blur-background': displayBanner, 'allow-play': classicPodcastPlay }"
  >
    <div
      v-if="displayBanner"
      class="live-image-status bg-dark"
    >
      {{ textVisible }}
    </div>

    <div
      class="multi-buttons-play"
      :class="justButtons ? 'play-button-relative' : ''"
    >
      <template v-if="!isLiveToBeRecorded">
        <button 
          class="d-flex"
          :title="playingPodcast? t('Pause') : t('Play')"
          @mouseenter="hoverType = 'audio'"
          @mouseleave="hoverType = ''" 
          @click.prevent="play(false)"
        >
          <PlayIcon
            v-if="!playingPodcast || (playingPodcast && playerStore.playerVideo)"
            :size="playIconSize"
          />
          <PodcastIsPlaying v-if="playingPodcast && !playerStore.playerVideo" />
          <time
            v-if="!isVideoPodcast"
            class="ms-1 me-2"
            :datetime="durationIso"
          >
            {{ durationString }}
          </time>
        </button>
        <button 
          v-if="isVideoPodcast"
          :title="t('Video')" 
          :disabled="playerStore.playerVideo"
          @click.prevent="play(true)"
          @mouseenter="hoverType = 'video'"
          @mouseleave="hoverType = ''"
        >
          <PodcastIsPlaying v-if="playingPodcast && playerStore.playerVideo" />
          <PlayVideoIcon
            v-else
            :size="'video' === hoverType ? 50 : 40"
          />
          <time
            class="ms-2 me-2"
            :datetime="durationIso"
          >
            {{ durationString }}
          </time>
        </button>

        <div
          v-if="displayBanner"
          class="special-icon-play-button"
        >
          <component
            :is="iconName"
            :size="16"
          />
        </div>
      </template>
      <component
        :is="iconName"
        v-else
        :size="50"
        :title="textVisible"
      />
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
import { Podcast, PodcastProcessingStatus as ProcessingStatus } from "../../../stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { computed, defineAsyncComponent, ref } from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useResizePhone } from "../../composable/useResizePhone";
dayjs.extend(duration);
const PodcastIsPlaying = defineAsyncComponent(() => import("./PodcastIsPlaying.vue"));


//Props 
const props = defineProps({
  podcast: { default: () => ({}), type: Object as () => Podcast },
  hidePlay: { default: false, type: Boolean },
  fetchConference: { default: undefined, type: Object as () => Conference },
  justButtons: { default: false, type: Boolean },
  /** Indicates that the processing status of the episode may be shown */
  showProcessing: { default: false, type: Boolean }
})


//Data 
const hoverType = ref("");

//Composables
const { t } = useI18n();
const playerStore = usePlayerStore();
const router = useRouter();
const { isPhone } = useResizePhone();

//Computed
const isVideoPodcast = computed(() => {
  return (
    (props.fetchConference?.videoProfile?.includes("video_") &&
      ProcessingStatus.ReadyToRecord === props.podcast.processingStatus) ||
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
    ProcessingStatus.ReadyToRecord === props.podcast.processingStatus
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

/** Size of the play icon */
const playIconSize = computed(() => {
  if (isPhone.value) {
    return 36;
  } else if (hoverType.value === 'audio') {
    return 50;
  } else {
    return 40;
  }
});

/** Whether the podcast can be played */
const classicPodcastPlay = computed(() => {
  return (
    //isLiveValidAndVisible.value &&
    !isLiveToBeRecorded.value &&
    ProcessingStatus.Planned !== props.podcast.processingStatus
  );
});

const displayBanner = computed(() => {
  return props.justButtons !== true && !(
    isLiveValidAndVisible.value &&
    !isLiveToBeRecorded.value &&
    ProcessingStatus.Planned !== props.podcast.processingStatus
  ) || (ProcessingStatus.Processing === props.podcast.processingStatus && props.showProcessing);
});

const iconName = computed(() => {
  if (isLiveToBeRecorded.value) {
    return ClockOutlineIcon;
  }

  if (ProcessingStatus.Ready === props.podcast.processingStatus || props.fetchConference) {
    if (!props.podcast.valid) {
      return CheckIcon;
    }

    if (
      !props.podcast.availability.visibility &&
      props.podcast.availability.date
    ) {
      return ClockOutlineIcon;
    }

    return EyeOffOutlineIcon;
  }

  if (
    ProcessingStatus.Planned === props.podcast.processingStatus ||
    ProcessingStatus.Processing === props.podcast.processingStatus
  ) {
    return TimerSandEmptyIcon;
  }

  if (ProcessingStatus.Cancelled === props.podcast.processingStatus) {
    return CancelIcon;
  }

  return AlertIcon;
});

/** The text to display when the podcast is not ready */
const textVisible = computed(() => {
  if (isLiveToBeRecorded.value){
    return t("Podcast linked to waiting live");
  }
    
  if (ProcessingStatus.Ready === props.podcast.processingStatus || props.fetchConference) {
    if (!props.podcast.valid) {
      return t("Podcast to validate");
    }
    if (
      !props.podcast.availability.visibility &&
      props.podcast.availability.date
    ){
      return t("Podcast publish in future");
    }
    return t("Podcast no visible");
  }
  if (
    ProcessingStatus.Planned === props.podcast.processingStatus ||
    ProcessingStatus.Processing === props.podcast.processingStatus
  ){
    return t("Podcast in process");
  }
  if (ProcessingStatus.Cancelled === props.podcast.processingStatus){
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
  if (!props.podcast || props.podcast.duration <= 1) {
    return "";
  }
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
        ...{ 
          conferenceId: props.fetchConference?.conferenceId,
          hlsIdentifier: props.fetchConference?.hlsIdentifier,
        },
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
    // Allow pointer events to go through (allow click on image beneath blur)
    pointer-events: none;

    // Buttons intercept button events to allow start play
    &.allow-play button {
      pointer-events: all;
    }
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
    left: 0;
    font-size: 1rem;
    color: white;
    background-color: var(--octopus-primary-less-transparent);
    border-radius: var(--octopus-border-radius);

    @media (width <= 960px) {
      font-size: 0.8rem;
    }

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
