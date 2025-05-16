<template>
  <section v-if="podcast" class="module-box">
    <RecordingItemButton
      v-if="!!podcastConference && isLiveReadyToRecord && isOctopusAndAnimator"
      :podcast="podcast"
      :live="true"
      :recording="podcastConference"
      @delete-item="removeDeleted"
      @validate-podcast="$emit('updatePodcast', $event)"
    />
    <EditBox
      v-else-if="editRight && isEditBox"
      :podcast="podcast"
      :display-studio-access="isDebriefing"
      @validate-podcast="$emit('updatePodcast', $event)"
    />
    <div class="mb-2 w-100">
      <PodcastImage
        :class="[
          isLiveReadyToRecord &&
          podcastConference &&
          'null' !== podcastConference &&
          podcastConference.status
            ? podcastConference.status.toLowerCase() + '-shadow'
            : '',
        ]"
        class="me-3"
        :hide-play="isLiveReadyToRecord"
        :podcast="podcast"
        :playing-podcast="playingPodcast"
        :fetch-conference="podcastConference"
        :is-animator-live="isOctopusAndAnimator"
      />
      <div class="d-flex justify-content-between flex-wrap mb-2">
        <time 
          v-if="0 !== date.length" :class="!isLiveReady ? 'me-5' : ''"
          :datetime="podcast.pubDate">
          {{ date }}
        </time>
        <div v-if="isLiveReady" class="text-danger">
          {{ $t("Episode record in live") }}
        </div>
        <div class="d-flex flex-column align-items-end">
          <time :datetime="durationIso">
            {{ duration }}
          </time>
          <ShareAnonymous v-if="!editRight" :podcast="podcast" :organisation-id="podcast.organisation.id"/>
        </div>
      </div>
      <h2 class="mb-3">
        {{ podcast.title }}
      </h2>
      <PodcastPlannedSpinner v-if="isPlannedInProcessor"/>
      <Countdown v-if="isCounter" :time-remaining="timeRemaining" />
      <!-- eslint-disable vue/no-v-html -->
      <div
        class="description-text html-wysiwyg-content"
        v-html="urlify(podcast.description)"
      />
      <!-- eslint-enable -->
      <div class="my-3">
        <div class="mb-1">
          {{ $t("Emission") + " : " }}
          <router-link
            :to="{
              name: 'emission',
              params: { emissionId: podcast.emission.emissionId },
            }"
            :title="$t('Series name page', { name: podcast.emission.name })"
          >
            {{ podcast.emission.name }}
          </router-link>
        </div>
        <ParticipantDescription :participants="podcast.animators" />
        <ParticipantDescription
          :participants="podcast.guests"
          :is-guest="true"
        />
        <div v-if="!isPodcastmaker" class="mb-1">
          {{ $t("Producted by : ") }}
          <router-link
            :to="{
              name: 'productor',
              params: { productorId: podcast.organisation.id },
            }"
          >
            {{ podcast.organisation.name }}
          </router-link>
        </div>
        <div v-if="'' !== photoCredit" class="mb-1">
          {{ $t("Photo credits") + " : " + photoCredit }}
        </div>
        <div v-if="'' !== audioCredit" class="mb-1">
          {{ $t("Audio credits") + " : " + audioCredit }}
        </div>
        <div v-if="'' !== authorCredit" class="mb-1">
          {{ $t("Author credits") + " : " + authorCredit }}
        </div>
        <a
          v-if="podcast.article && !isGarRole"
          class="btn d-flex align-items-center my-2 w-fit-content mb-1"
          :href="podcast.article"
          rel="noreferrer noopener"
          target="_blank"
          :title="$t('New window', {text : $t('See associated article')})"
        >
          <NewspaperVariantOutlineIcon class="me-1" />
          <div>{{ $t("See associated article") }}</div>
        </a>
        <PodcastPlayBar
          v-if="isProgressBar"
          :podcast="podcast"
        />
        <div v-if="editRight && !isPodcastmaker">
          <div
            v-if="
              podcast.annotations && 'RSS' === podcast.annotations.SOURCE_KIND
            "
            class="me-5 text-secondary"
          >
            {{ $t("From RSS") }}
          </div>
          <ErrorMessage v-if="'' !== errorMessage" :message="errorMessage" />
        </div>
        <div class="d-flex align-items-center flex-wrap">
          <LikeSection :edit-right="editRight" :podcast="podcast" />
          <DownloadPodcastButton v-if="isDownloadButton" :podcast="podcast" />
        </div>
      </div>
    </div>
    <TagList
      v-if="undefined !== podcast.tags && 0 !== podcast.tags.length"
      :tag-list="podcast.tags"
      :orga-id="podcast.organisation.id"
      :podcast-annotations="podcast.annotations"
    />
    <PodcastRubriqueList
      v-if="podcastRubriques?.length"
      :orga-id="podcast.organisation.id"
      :rubrique-ids="podcastRubriques"
    />
    <PodcastRawTranscript :podcast-id="podcast.podcastId" />
    <SubscribeButtons
      v-if="isPodcastmaker"
      class="mt-4"
      :emission="podcast.emission"
      :window-width="1000"
      :justify-center="false"
    />
  </section>
</template>

<script lang="ts">
import NewspaperVariantOutlineIcon from "vue-material-design-icons/NewspaperVariantOutline.vue";
import PodcastImage from "./PodcastImage.vue";
import ParticipantDescription from "./ParticipantDescription.vue";
import PodcastRawTranscript from "./PodcastRawTranscript.vue";
import { state } from "../../../stores/ParamSdkStore";
import { useAuthStore } from "../../../stores/AuthStore";
import displayHelper from "../../../helper/displayHelper";
import {usePodcastView} from "../../composable/podcasts/usePodcastView";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";

import { defineComponent, defineAsyncComponent, toRefs } from "vue";
const ErrorMessage = defineAsyncComponent(
  () => import("../../misc/ErrorMessage.vue"),
);
const RecordingItemButton = defineAsyncComponent(
  () => import("@/components/display/studio/RecordingItemButton.vue"),
);
const EditBox = defineAsyncComponent(
  () => import("@/components/display/edit/EditBox.vue"),
);
const PodcastPlayBar = defineAsyncComponent(
  () => import("./PodcastPlayBar.vue"),
);
const SubscribeButtons = defineAsyncComponent(
  () => import("../sharing/SubscribeButtons.vue"),
);
const LikeSection = defineAsyncComponent(
  () => import("../comments/like/LikeSection.vue"),
);
const DownloadPodcastButton = defineAsyncComponent(
  () => import("./DownloadPodcastButton.vue"),
);
const PodcastPlannedSpinner = defineAsyncComponent(
  () => import("./PodcastPlannedSpinner.vue"),
);
const Countdown = defineAsyncComponent(() => import("../live/CountDown.vue"));
const TagList = defineAsyncComponent(() => import("./TagList.vue"));
const ShareAnonymous = defineAsyncComponent(() => import("../sharing/ShareAnonymous.vue"));
const PodcastRubriqueList = defineAsyncComponent(() => import("./PodcastRubriqueList.vue"));
import { mapState } from "pinia";
export default defineComponent({
  name: "PodcastModuleBox",
  components: {
    PodcastImage,
    ParticipantDescription,
    TagList,
    ErrorMessage,
    PodcastPlayBar,
    EditBox,
    RecordingItemButton,
    SubscribeButtons,
    Countdown,
    LikeSection,
    PodcastRawTranscript,
    DownloadPodcastButton,
    NewspaperVariantOutlineIcon,
    PodcastPlannedSpinner,
    PodcastRubriqueList,
    ShareAnonymous
  },

  props: {
    playingPodcast: { default: undefined, type: Object as () => Podcast },
    podcast: { default: undefined, type: Object as () => Podcast },
    podcastConference: { default: undefined, type: Object as () => Conference },
  },

  emits: ["updatePodcast"],

  setup(props){
    const propsRef = toRefs(props);
    const { 
      isLiveReadyToRecord,
      isCounter,
      timeRemaining,
      isPlannedInProcessor,
      date,
      duration,
      durationIso,
      isPodcastmaker,
      editRight
    } = usePodcastView(propsRef.podcast, propsRef.podcastConference);
    return { isPodcastmaker, editRight, isLiveReadyToRecord, isCounter, timeRemaining, isPlannedInProcessor, date, duration, durationIso }
  },

  data() {
    return {
    };
  },

  computed: {
    ...mapState(useAuthStore, ["isRoleLive", "isGarRole"]),
    podcastRubriques(){
      let rubriques = this.podcast?.rubriqueIds ?? [];
      if(this.podcast?.emission?.rubriqueIds){
        rubriques = [...new Set(rubriques.concat(this.podcast?.emission?.rubriqueIds))];
      }
      return rubriques;
    },
    errorMessage(): string {
      if (!this.podcast?.availability.visibility) {
        return this.$t("Podcast is not visible for listeners");
      }
      if ("ERROR" === this.podcast?.processingStatus) {
        return this.$t("Podcast in ERROR, please contact Saooti");
      }
      return this.podcastNotValid ? this.$t("Podcast not validated") : "";
    },
    isProgressBar(): boolean {
      return state.emissionsPage.progressBar as boolean;
    },
    isLiveReady(): boolean {
      return (
        undefined !== this.podcast?.conferenceId &&
        0 !== this.podcast?.conferenceId &&
        "READY" === this.podcast?.processingStatus
      );
    },
    isDebriefing(): boolean {
      return (
        undefined !== this.podcastConference &&
        "DEBRIEFING" === this.podcastConference.status
      );
    },
    isOctopusAndAnimator(): boolean {
      return !this.isPodcastmaker && this.editRight && this.isRoleLive;
    },
    podcastNotValid(): boolean {
      return (
        undefined !== this.podcast?.availability &&
        false === this.podcast?.valid
      );
    },
    photoCredit(): string {
      return (this.podcast?.annotations?.photoCredit as string) ?? "";
    },
    audioCredit(): string {
      return (this.podcast?.annotations?.audioCredit as string) ?? "";
    },
    authorCredit(): string {
      return (this.podcast?.annotations?.authorCredit as string) ?? "";
    },
    isEditBox(): boolean {
      return !((state.generalParameters.podcastmaker as boolean) ?? false);
    },
    isDownloadButton(): boolean {
      return state.podcastPage.downloadButton as boolean;
    },
  },
  methods: {
    urlify(text:string|undefined){
      return displayHelper.urlify(text);
    },
    removeDeleted(): void {
      if (this.isLiveReadyToRecord) {
        this.$router.push("/main/pub/lives");
      } else if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push("/");
      }
    },
  },
});
</script>
