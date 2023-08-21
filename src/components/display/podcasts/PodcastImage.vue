<template>
  <div
    v-if="podcast"
    class="img-box img-box-podcast mb-3 flex-column justify-content-start align-items-start position-relative flex-shrink-0 float-start"
  >
    <img
      v-lazy="proxyImageUrl(podcast.imageUrl, '330')"
      width="330"
      height="330"
      class="img-box img-box-podcast"
      :alt="$t('Episode name image', { name: podcast.title })"
    />
    <div
      v-if="isPodcastmaker"
      :class="mainRubrique ? 'mainRubrique' : 'notMainRubrique'"
    />
    <div
      v-if="fetchConference"
      class="live-image-status"
      :class="
        fetchConference && 'null' !== fetchConference && fetchConference.status
          ? fetchConference.status.toLowerCase() + '-bg'
          : ''
      "
    >
      {{ statusText }}
    </div>
    <div v-if="isRecordedInLive" class="live-image-status recording-bg">
      {{ $t("Recorded in live") }}
    </div>
    <button
      v-if="hidePlay || recordingLive"
      class="image-play-button"
      :class="classicPodcastPlay ? '' : 'transparent-background'"
      @click="play(false)"
    >
      <div v-if="!isLiveToBeRecorded" class="icon-container">
        <div v-if="!playingPodcast" :title="$t('Play')" class="saooti-play" />
        <div
          v-if="!classicPodcastPlay"
          class="special-icon-play-button"
          :class="iconName"
        />
        <div
          v-if="playingPodcast"
          :class="'PLAYING' === playerStatus ? 'play-animation' : ''"
          class="bloc-paddle"
        >
          <span class="paddle1" />
          <span class="paddle2" />
          <span class="paddle3" />
        </div>
        <div class="ms-2">
          {{ durationString }}
        </div>
      </div>
      <div v-else class="icon-container play-button-error-icon">
        <div :title="textVisible" class="big-icon-error" :class="iconName" />
      </div>
      <div v-if="!classicPodcastPlay" class="live-image-status bg-dark">
        {{ textVisible }}
      </div>
    </button>
    <button
      v-if="isVideoPodcast"
      class="btn admin-button btn-play-video saooti-video"
      @click="play(true)"
    ></button>
    <div
      v-if="displayDescription && isMobile"
      class="background-icon bg-primary saooti-arrow-up"
      :class="isDescription ? 'saooti-arrow-down' : 'saooti-arrow-up'"
      :title="isDescription ? $t('Hide description') : $t('Show description')"
      @click="showDescription"
    />
  </div>
</template>

<script lang="ts">
import DurationHelper from "../../../helper/duration";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import imageProxy from "../../mixins/imageProxy";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastImage",
  mixins: [imageProxy],
  props: {
    podcast: { default: () => ({}), type: Object as () => Podcast },
    hidePlay: { default: false, type: Boolean },
    displayDescription: { default: false, type: Boolean },
    arrowDirection: { default: "up", type: String },
    isAnimatorLive: { default: false, type: Boolean },
    fetchConference: { default: undefined, type: Object as () => Conference },
  },
  emits: ["hideDescription", "showDescription"],
  data() {
    return {
      isDescription: false as boolean,
    };
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerLive",
      "playerStatus",
      "playerVideo",
    ]),
    isVideoPodcast(): boolean {
      return (
        this.fetchConference?.videoProfile?.includes("video_") ||
        undefined !== this.podcast.video?.videoId
      );
    },
    playingPodcast() {
      return (
        this.playerPodcast?.podcastId === this.podcast.podcastId ||
        (this.fetchConference &&
          "null" !== this.fetchConference.toString() &&
          this.playerLive?.conferenceId === this.fetchConference.conferenceId)
      );
    },
    mainRubrique(): boolean {
      return (
        undefined !== state.podcastPage.mainRubrique &&
        0 !== state.podcastPage.mainRubrique &&
        (this.podcast?.rubriqueIds?.includes(
          state.podcastPage.mainRubrique,
        ) as boolean)
      );
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    isMobile(): boolean {
      return window.matchMedia("(hover: none)").matches;
    },
    isRecordedInLive(): boolean {
      return (
        undefined === this.fetchConference &&
        undefined !== this.podcast.conferenceId &&
        "READY_TO_RECORD" !== this.podcast.processingStatus
      );
    },
    isLiveToBeRecorded(): boolean {
      return (
        undefined === this.fetchConference &&
        undefined !== this.podcast.conferenceId &&
        "READY_TO_RECORD" === this.podcast.processingStatus
      );
    },
    classicPodcastPlay(): boolean {
      return (
        undefined !== this.podcast &&
        false !== this.podcast.valid &&
        ("READY_TO_RECORD" === this.podcast.processingStatus ||
          "READY" === this.podcast.processingStatus ||
          ("PROCESSING" === this.podcast.processingStatus &&
            !(state.generalParameters.authenticated as boolean))) &&
        !this.isLiveToBeRecorded &&
        undefined !== this.podcast.availability.visibility &&
        this.podcast.availability.visibility
      );
    },
    iconName(): string {
      if (this.isLiveToBeRecorded) return "saooti-clock";
      if ("READY" === this.podcast.processingStatus || this.fetchConference) {
        if (!this.podcast.valid) return "saooti-checkmark";
        if (
          !this.podcast.availability.visibility &&
          this.podcast.availability.date
        )
          return "saooti-clock";
        return "saooti-eye-blocked";
      }
      if (
        "PLANNED" === this.podcast.processingStatus ||
        "PROCESSING" === this.podcast.processingStatus
      )
        return "saooti-hourglass";
      if ("CANCELED" === this.podcast.processingStatus)
        return "saooti-cancel-circle";
      return "saooti-warning";
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
    statusText(): string {
      if (!this.fetchConference) return "";
      switch (this.fetchConference.status) {
        case "PLANNED":
          return this.$t("live in few time");
        case "PENDING":
          if (this.isAnimatorLive) return this.$t("Open studio");
          return this.$t("live upcoming");
        case "RECORDING":
          return this.$t("In live");
        case "DEBRIEFING":
          if ("READY_TO_RECORD" === this.podcast.processingStatus)
            return this.$t("Not recording");
          return this.$t("Debriefing");
        case "ERROR":
          return this.$t("In error");
        case "PUBLISHING":
          return this.$t("Publishing");
        default:
          return "";
      }
    },
    recordingLive(): boolean {
      return (
        undefined !== this.fetchConference &&
        -1 !== this.fetchConference.conferenceId &&
        ("RECORDING" === this.fetchConference.status ||
          "PENDING" === this.fetchConference.status)
      );
    },
    clickPlayGoPage(): boolean {
      return state.podcastPage.clickPlayGoPage as boolean;
    },
    durationString(): string {
      return DurationHelper.formatDuration(
        Math.round(this.podcast.duration / 1000),
      );
    },
  },
  watch: {
    arrowDirection(): void {
      if ("up" === this.arrowDirection) {
        this.isDescription = true;
        this.showDescription();
      } else {
        this.isDescription = false;
        this.showDescription();
      }
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
      if (this.clickPlayGoPage) {
        this.$router.push("/main/pub/podcast/" + this.podcast.podcastId);
      }
    },
    showDescription(): void {
      if (this.isDescription) {
        this.$emit("hideDescription");
      } else {
        this.$emit("showDescription");
      }
      this.isDescription = !this.isDescription;
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
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

  .background-icon {
    border-radius: 50%;
    width: 1rem;
    height: 1rem;
    font-size: 1rem;
    right: 0;
    bottom: 0;
    margin: 5px;
    position: absolute;
    cursor: pointer;
    z-index: 3;
  }
  .transparent-background {
    background-color: rgba(255, 255, 255, 0.5);
  }

  .btn.btn-play-video {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 0.5rem;
    background: $primaryColorLessTransparent !important;
    color: white !important;
  }

  .image-play-button .play-button-error-icon {
    background: #0000009d !important;
    cursor: default !important;
    /* align-self: center;
    margin-bottom: calc(50% - 1rem); */
    .big-icon-error {
      font-size: 1.5rem;
      position: relative;
    }
  }
  .special-icon-play-button {
    width: 30px;
    height: 30px;
    background-color: #ffd663;
    color: black;
    border-radius: 50%;
    position: absolute;
    left: 4.4rem;
    bottom: 2.2rem;
    font-size: 0.9rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
