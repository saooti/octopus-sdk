<template>
  <div
    v-if="podcast"
    class="img-box img-box-podcast mb-3 flex-column justify-content-start align-items-start position-relative flex-shrink-0 float-start"
  >
    <img
      v-lazy="proxyImageUrl(podcast.imageUrl, '270')"
      width="270"
      height="270"
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
    <PodcastPlayButton 
      :podcast="podcast"
      :hidePlay="hidePlay"
      :fetchConference="fetchConference"
    />
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
import PodcastPlayButton from "./PodcastPlayButton.vue";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import imageProxy from "../../mixins/imageProxy";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastImage",
  components:{
    PodcastPlayButton
  },
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
    statusText(): string {
      if (!this.fetchConference) return '';
      switch (this.fetchConference.status) {
        case 'PLANNED':
          return this.$t('live in few time');
        case 'PENDING':
          if (this.isAnimatorLive) return this.$t('Open studio');
          return this.$t('live upcoming');
        case 'RECORDING':
          return this.$t('In live');
        case 'DEBRIEFING':
          /* if (!this.isAnimatorLive) return ''; */
          if ('READY_TO_RECORD' === this.podcast.processingStatus)
            return this.$t('Not recording');
          return this.$t('Debriefing');
        case 'ERROR':
          return this.$t('In error');
        case 'PUBLISHING':
          return this.$t('Publishing');
        default:
          return '';
      }
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
}
</style>
