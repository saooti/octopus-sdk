<template>
  <div v-if="!hidePlay || recordingLive" :class="classicPodcastPlay ? '' : 'img-blur-background'">
    <div v-if="!classicPodcastPlay" class="live-image-status bg-dark">
      {{ textVisible }}
    </div>
    <div class="multi-buttons-play" :class="justButtons ? 'play-button-relative' : ''">
      <template v-if="!isLiveToBeRecorded">
        <button 
          class="d-flex"
          :title="playingPodcast? $t('Pause') : $t('Play')"
          @mouseenter="hoverType = 'audio'"
          @mouseleave="hoverType = ''" 
          @click="play(false)"
        >
          <PlayIcon
            v-if="!playingPodcast || (playingPodcast && playerVideo)"
            :size="'audio' === hoverType ? 50 : 40"
          />
          <PodcastIsPlaying v-if="playingPodcast && !playerVideo"/>
          <span v-if="!isVideoPodcast" class="ms-1">{{ durationString }}</span>
        </button>
        <button 
          v-if="isVideoPodcast"
          :title="$t('Video')" 
          :disabled="playerVideo"
          @click="play(true)"
          @mouseenter="hoverType = 'video'"
          @mouseleave="hoverType = ''"
        >
          <PlayVideoIcon v-if="!playerVideo" :size="'video' === hoverType ? 50 : 40" />
          <PodcastIsPlaying v-if="playingPodcast && playerVideo"/>
          <span class="ms-2">{{ durationString }}</span>
        </button>
        <div v-if="!classicPodcastPlay" class="special-icon-play-button">
          <component :is="iconName" :size="16" />
        </div>
      </template>
      <component :is="iconName" v-else :size="50" :title="textVisible" />
    </div>
  </div>
</template>

<script lang="ts">
import PlayVideoIcon from "../../icons/PlayVideoIcon.vue";
import PlayIcon from "vue-material-design-icons/Play.vue";
import ClockOutlineIcon from "vue-material-design-icons/ClockOutline.vue";
import CheckIcon from "vue-material-design-icons/Check.vue";
import TimerSandEmptyIcon from "vue-material-design-icons/TimerSandEmpty.vue";
import EyeOffOutlineIcon from "vue-material-design-icons/EyeOffOutline.vue";
import CancelIcon from "vue-material-design-icons/Cancel.vue";
import AlertIcon from "vue-material-design-icons/Alert.vue";
import DurationHelper from "../../../helper/duration";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import imageProxy from "../../mixins/imageProxy";
import { useAuthStore } from "../../../stores/AuthStore";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
const PodcastIsPlaying = defineAsyncComponent(() => import("./PodcastIsPlaying.vue"));
export default defineComponent({
  name: "PodcastPlayButton",
  components: {
    AlertIcon,
    ClockOutlineIcon,
    CheckIcon,
    TimerSandEmptyIcon,
    EyeOffOutlineIcon,
    CancelIcon,
    PlayIcon,
    PlayVideoIcon,
    PodcastIsPlaying
  },
  mixins: [imageProxy],
  props: {
    podcast: { default: () => ({}), type: Object as () => Podcast },
    hidePlay: { default: false, type: Boolean },
    fetchConference: { default: undefined, type: Object as () => Conference },
    justButtons: { default: false, type: Boolean },
  },
  data() {
    return {
      hoverType: "" as string,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authOrgaId"]),
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerLive",
      "playerStatus",
      "playerVideo",
    ]),
    isVideoPodcast(): boolean {
      return (
        (this.fetchConference?.videoProfile?.includes("video_") &&
          "READY_TO_RECORD" === this.podcast.processingStatus) ||
        undefined !== this.podcast.video?.videoId
      );
    },
    playingLive(): boolean {
      return (
        undefined !== this.fetchConference &&
        "null" !== this.fetchConference.toString() &&
        this.playerLive?.conferenceId === this.fetchConference.conferenceId
      );
    },
    playingPodcast() {
      return (
        this.playerPodcast?.podcastId === this.podcast.podcastId ||
        this.playingLive
      );
    },
    isLiveToBeRecorded(): boolean {
      return undefined === this.fetchConference && this.isLiveReadyToRecord;
    },
    isLiveReadyToRecord(): boolean {
      return (
        undefined !== this.podcast?.conferenceId &&
        0 !== this.podcast.conferenceId &&
        "READY_TO_RECORD" === this.podcast.processingStatus
      );
    },
    isLiveValidAndVisible(): boolean {
      return (
        undefined !== this.podcast &&
        false !== this.podcast.valid &&
        undefined !== this.podcast.availability.visibility &&
        this.podcast.availability.visibility
      );
    },
    classicPodcastPlay(): boolean {
      return (
        this.isLiveValidAndVisible &&
        !this.isLiveToBeRecorded &&
        ("READY_TO_RECORD" === this.podcast.processingStatus ||
          "READY" === this.podcast.processingStatus ||
          ("PROCESSING" === this.podcast.processingStatus &&
            undefined === this.authOrgaId))
      );
    },
    iconName(): string {
      if (this.isLiveToBeRecorded) return "ClockOutlineIcon";
      if ("READY" === this.podcast.processingStatus || this.fetchConference) {
        if (!this.podcast.valid) return "CheckIcon";
        if (
          !this.podcast.availability.visibility &&
          this.podcast.availability.date
        )
          return "ClockOutlineIcon";
        return "EyeOffOutlineIcon";
      }
      if (
        "PLANNED" === this.podcast.processingStatus ||
        "PROCESSING" === this.podcast.processingStatus
      )
        return "TimerSandEmptyIcon";
      if ("CANCELED" === this.podcast.processingStatus) return "CancelIcon";
      return "AlertIcon";
    },
    textVisible(): string {
      if (this.isLiveToBeRecorded)
        return this.$t("Podcast linked to waiting live");
      if ("READY" === this.podcast.processingStatus || this.fetchConference) {
        if (!this.podcast.valid) return this.$t("Podcast to validate");
        if (
          !this.podcast.availability.visibility &&
          this.podcast.availability.date
        )
          return this.$t("Podcast publish in future");
        return this.$t("Podcast no visible");
      }
      if (
        "PLANNED" === this.podcast.processingStatus ||
        "PROCESSING" === this.podcast.processingStatus
      )
        return this.$t("Podcast in process");
      if ("CANCELED" === this.podcast.processingStatus)
        return this.$t("Podcast in cancelled status");
      return this.$t("Podcast in error");
    },
    recordingLive(): boolean {
      return (
        undefined !== this.fetchConference &&
        -1 !== this.fetchConference.conferenceId &&
        ("RECORDING" === this.fetchConference.status ||
          "PENDING" === this.fetchConference.status)
      );
    },
    durationString(): string {
      return DurationHelper.formatDuration(
        Math.round(this.podcast.duration / 1000),
      );
    },
  },

  methods: {
    ...mapActions(usePlayerStore, ["playerChangeStatus", "playerPlay"]),
    play(isVideo: boolean): void {
      if (this.isLiveToBeRecorded) {
        return;
      }
      if (this.playingPodcast && isVideo === this.playerVideo) {
        this.playerChangeStatus("PLAYING" === this.playerStatus);
        return;
      }
      if (isVideo && state.player.isVideoPage) {
        this.$router.push("/main/pub/video/" + this.podcast.podcastId);
        return;
      }
      if (!this.recordingLive) {
        this.playerPlay(this.podcast, isVideo);
      } else {
        this.playerPlay(
          {
            ...this.podcast,
            ...{ conferenceId: this.fetchConference?.conferenceId },
          },
          isVideo,
        );
      }
    },
  },
});
</script>

<style lang="scss">
@use '@scss/variables' as octopusVariables;
.octopus-app {
  .img-blur-background{
    position: absolute;
    inset: 0;
    background-color: #ffffff80;
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
    background-color: #ffd663;
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
    background-color: octopusVariables.$primaryColorLessTransparent;
    border-radius: octopusVariables.$octopus-borderradius;
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
