<template>
  <div v-if="podcast" class="module-box">
    <div class="mb-2 d-flex">
      <div class="w-100">
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
          <div v-if="0 !== date.length" :class="!isLiveReady ? 'me-5' : ''">
            {{ date }}
          </div>
          <div>
            {{ duration }}
          </div>
          <div v-if="isLiveReady" class="text-danger">
            {{ $t("Episode record in live") }}
          </div>
        </div>
        <h2 class="mb-3">
          {{ podcast.title }}
        </h2>
        <Countdown v-if="isCounter" :time-remaining="timeRemaining" />
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="descriptionText html-wysiwyg-content"
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
            class="btn d-flex align-items-center my-2 width-fit-content mb-1"
            :href="podcast.article"
            rel="noopener"
            target="_blank"
          >
            <NewspaperVariantOutlineIcon class="me-1" />
            <div>{{ $t("See associated article") }}</div>
          </a>
          <PodcastPlayBar
            v-if="isProgressBar"
            :podcast-id="podcast.podcastId"
            :duration="podcast.duration"
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
    </div>
    <TagList
      v-if="undefined !== podcast.tags && 0 !== podcast.tags.length && !isPhone"
      :tag-list="podcast.tags"
      :podcast-annotations="podcast.annotations"
    />
    <PodcastRawTranscript :podcast-id="podcast.podcastId" />
    <SubscribeButtons
      v-if="isPodcastmaker"
      class="mt-4"
      :emission="podcast.emission"
      :window-width="1000"
      :justify-center="false"
    />
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
  </div>
</template>

<script lang="ts">
import NewspaperVariantOutlineIcon from "vue-material-design-icons/NewspaperVariantOutline.vue";
import PodcastImage from "./PodcastImage.vue";
import ParticipantDescription from "./ParticipantDescription.vue";
import PodcastRawTranscript from "./PodcastRawTranscript.vue";
import { state } from "../../../stores/ParamSdkStore";
import { useAuthStore } from "../../../stores/AuthStore";
import displayMethods from "../../mixins/displayMethods";
import podcastView from "../../mixins/podcast/podcastView";
import { orgaComputed } from "../../mixins/orgaComputed";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";

import { defineComponent, defineAsyncComponent } from "vue";
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
const Countdown = defineAsyncComponent(() => import("../live/CountDown.vue"));
const TagList = defineAsyncComponent(() => import("./TagList.vue"));
import resizePhone from "../../mixins/resizePhone";
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
  },

  mixins: [displayMethods, orgaComputed, resizePhone, podcastView],

  props: {
    playingPodcast: { default: undefined, type: Object as () => Podcast },
    podcast: { default: undefined, type: Object as () => Podcast },
    podcastConference: { default: undefined, type: Object as () => Conference },
  },

  emits: ["updatePodcast"],

  data() {
    return {
      isPhone: false as boolean,
      windowWidth: 0 as number,
    };
  },

  computed: {
    ...mapState(useAuthStore, ["isRoleLive", "isGarRole"]),
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
    editRight(): boolean {
      return this.isEditRights(this.podcast?.organisation.id);
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
