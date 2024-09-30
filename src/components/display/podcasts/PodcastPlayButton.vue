<template>
  <button
    v-if="!hidePlay || recordingLive"
    class="image-play-button"
    :class="[
      classicPodcastPlay ? '' : 'transparent-background',
      justButtons ? 'not-image' : '',
    ]"
    @mouseenter="hoverType = 'audio'"
    @mouseleave="hoverType = ''"
    @click="play(false)"
  >
    <div
      class="multiple-play-buttons-container"
      :class="[
        hoverType ? 'hover-type-' + hoverType : '',
        isVideoPodcast ? 'has-video' : '',
      ]"
    >
      <template v-if="!isLiveToBeRecorded">
        <div
          v-if="!playingPodcast || (playingPodcast && playerVideo)"
          :title="$t('Play')"
          class="saooti-play me-1"
        />
        <div
          v-if="playingPodcast"
          :class="'PLAYING' === playerStatus ? 'play-animation' : ''"
          class="bloc-paddle mx-1"
        >
          <span class="paddle1" />
          <span class="paddle2" />
          <span class="paddle3" />
        </div>
        <button
          v-if="isVideoPodcast && !playerVideo"
          :title="$t('Video')"
          class="btn-transparent d-flex align-items-center saooti-play-video"
          @mouseenter="hoverType = 'video'"
          @mouseleave="hoverType = 'audio'"
          @click.stop="play(true)"
        />
        <div
          v-if="!classicPodcastPlay"
          class="special-icon-play-button"
          :class="iconName"
        />
        <div class="ms-2">
          {{ durationString }}
        </div>
      </template>
      <div
        v-else
        :title="textVisible"
        class="big-icon-error"
        :class="iconName"
      />
    </div>
    <div v-if="!classicPodcastPlay" class="live-image-status bg-dark">
      {{ textVisible }}
    </div>
  </button>
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
  name: "PodcastPlayButton",
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
            !(state.generalParameters.authenticated as boolean)))
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
      if(isVideo && state.player.isVideoPage){
        this.$router.push('/main/pub/video/'+this.podcast.podcastId);
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
  },
});
</script>

<style lang="scss">
.octopus-app {
  .image-play-button.not-image {
    position: relative;
    width: auto;
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
  .transparent-background {
    background-color: #ffffff80;
  }

  .big-icon-error {
    font-size: 1.5rem;
  }
  .special-icon-play-button {
    width: 30px;
    height: 30px;
    background-color: #ffd663;
    color: black;
    border-radius: 50%;
    position: absolute;
    left: 4.9rem;
    bottom: 2.3rem;
    font-size: 0.9rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .has-video .special-icon-play-button {
    left: 7.4rem;
  }
}
</style>
