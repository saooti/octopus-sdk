<template>
  <section v-if="podcast" class="module-box">
    <RecordingItemButton
      v-if="!!podcastConference && isLiveReadyToRecord && isOctopusAndAnimator"
      :podcast="podcast"
      :live="true"
      :recording="podcastConference"
      @delete-item="removeDeleted"
      @validate-podcast="emit('updatePodcast', $event)"
    />
    <EditBox
      v-else-if="editRight && isEditBox"
      :podcast="podcast"
      :display-studio-access="isDebriefing"
      @validate-podcast="emit('updatePodcast', $event)"
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
        show-processing
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
          {{ t("Episode record in live") }}
        </div>
        <div class="d-flex flex-column align-items-end">
          <time :datetime="durationIso">
            {{ duration }}
          </time>
          <ShareAnonymous v-if="!editRight" :podcast="podcast" :organisation-id="podcast.organisation.id"/>
        </div>
      </div>
      <h2 :class="{ 'mb-3': !showSubtitle }">
        {{ podcast.title }}
      </h2>
      <h3 v-if="showSubtitle" class="mb-3 text-secondary">
        {{ podcast.annotations.subtitle }}
      </h3>
      
      <PodcastPlannedSpinner v-if="isPlannedInProcessor" />
      <Countdown v-if="isCounter" :time-remaining="timeRemaining" />
      <!-- eslint-disable vue/no-v-html -->
      <div
        v-if="showSummary"
        class="description-text html-wysiwyg-content"
        :class="{ 'mb-4': showSummary && showDescription }"
        v-html="urlify(podcast.summary)"
      />
      <div
        v-if="showDescription"
        class="description-text html-wysiwyg-content"
        v-html="urlify(podcast.description)"
      />
      <!-- eslint-enable -->
      <div class="my-3">
        <div class="mb-1">
          {{ t("Emission") + " : " }}
          <router-link
            :to="{
              name: 'emission',
              params: { emissionId: podcast.emission.emissionId },
            }"
            :title="t('Series name page', { name: podcast.emission.name })"
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
          {{ t("Producted by : ") }}
          <router-link
            :to="{
              name: 'productor',
              params: { productorId: podcast.organisation.id },
            }"
          >
            {{ podcast.organisation.name }}
          </router-link>
        </div>
        <div v-if="showSeasonNumber" class="mb-1">
          {{ `${t('Podcast - Season')} : ${podcast.seasonNumber}` }}
        </div>
        <div v-if="showSeasonEpisodeNumber" class="mb-1">
          {{ `${t('Podcast - Episode number')} : ${podcast.seasonEpisodeNumber}` }}
        </div>
        <div v-if="'' !== photoCredit" class="mb-1">
          {{ t("Photo credits") + " : " + photoCredit }}
        </div>
        <div v-if="'' !== audioCredit" class="mb-1">
          {{ t("Audio credits") + " : " + audioCredit }}
        </div>
        <div v-if="'' !== authorCredit" class="mb-1">
          {{ t("Author credits") + " : " + authorCredit }}
        </div>
        <a
          v-if="podcast.article && !authStore.isGarRole"
          class="btn d-flex align-items-center my-2 w-fit-content mb-1"
          :href="podcast.article"
          rel="noreferrer noopener"
          target="_blank"
          :title="t('New window', {text : t('See associated article')})"
        >
          <NewspaperVariantOutlineIcon class="me-1" />
          <div>{{ t("See associated article") }}</div>
        </a>
        <PodcastPlayBar
          v-if="state.emissionsPage.progressBar"
          :podcast="podcast"
        />
        <div v-if="editRight && !isPodcastmaker">
          <div
            v-if="
              podcast.annotations && 'RSS' === podcast.annotations.SOURCE_KIND
            "
            class="me-5 text-secondary"
          >
            {{ t("From RSS") }}
          </div>
          <ErrorMessage v-if="'' !== errorMessage" :message="errorMessage" />
        </div>
        <div class="d-flex align-items-center flex-wrap">
          <LikeSection :edit-right="editRight" :podcast="podcast" />
          <DownloadPodcastButton v-if="state.podcastPage.downloadButton" :podcast="podcast" />
        </div>
      </div>
    </div>
    <TagList
      v-if="showTags"
      :tag-list="tags"
      :orga-id="podcast.organisation.id"
      :podcast-annotations="podcast.annotations"
      :max="state.podcastPage.maxTags"
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
      :content="podcast.emission"
      :window-width="1000"
      :justify-center="false"
    />
  </section>
</template>

<script setup lang="ts">
import NewspaperVariantOutlineIcon from "vue-material-design-icons/NewspaperVariantOutline.vue";
import PodcastImage from "./PodcastImage.vue";
import ParticipantDescription from "./ParticipantDescription.vue";
import PodcastRawTranscript from "./PodcastRawTranscript.vue";
import { state } from "../../../stores/ParamSdkStore";
import { useAuthStore } from "../../../stores/AuthStore";
import displayHelper from "../../../helper/displayHelper";
import {usePodcastView} from "../../composable/podcasts/usePodcastView";
import { Podcast } from "../../../stores/class/general/podcast";
import { Conference } from "../../../stores/class/conference/conference";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useSeasonsManagement } from "../../composable/useSeasonsManagement";
import { SeasonMode } from "../../../stores/class/general/emission";

import { defineAsyncComponent, toRefs, computed } from "vue";
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

//Props 
const props = defineProps<{
  podcast: Podcast;
  playingPodcast?: Podcast;
  podcastConference?: Conference;
}>();

//Emits
const emit = defineEmits(["updatePodcast"]);

//Composables
const { t } = useI18n();
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
const authStore = useAuthStore();
const router = useRouter();
const { areSeasonsEnabled } = useSeasonsManagement();

//Computed
const podcastRubriques = computed(() => {
  let rubriques = props.podcast?.rubriqueIds ?? [];
  if(props.podcast?.emission?.rubriqueIds){
    rubriques = [...new Set(rubriques.concat(props.podcast?.emission?.rubriqueIds))];
  }
  return rubriques;
});
const errorMessage = computed(() => {
  if (!props.podcast?.availability.visibility) {
    return t("Podcast is not visible for listeners");
  }
  if ("ERROR" === props.podcast?.processingStatus) {
    return t("Podcast in ERROR, please contact Saooti");
  }
  return podcastNotValid.value ? t("Podcast not validated") : "";
});
const isLiveReady = computed(() => {
  return (
    undefined !== props.podcast?.conferenceId &&
    0 !== props.podcast?.conferenceId &&
    "READY" === props.podcast?.processingStatus
  );
});
const isDebriefing = computed(() => {
  return (
    undefined !== props.podcastConference &&
    "DEBRIEFING" === props.podcastConference.status
  );
});
const isOctopusAndAnimator = computed(() => {
  return !isPodcastmaker.value && editRight.value && authStore.isRoleLive;
});
const podcastNotValid = computed(() => {
  return (
    undefined !== props.podcast?.availability &&
    false === props.podcast?.valid
  );
});
const photoCredit = computed(() => formatCredits(props.podcast?.annotations?.photoCredit as string|undefined));
const audioCredit = computed(() => formatCredits(props.podcast?.annotations?.audioCredit as string|undefined));
const authorCredit = computed(() => formatCredits(props.podcast?.annotations?.authorCredit as string|undefined));
const isEditBox = computed(() => !((state.generalParameters.podcastmaker as boolean) ?? false));
/** The tags to display */
const tags = computed(() => {
  const tags = [];
  if(props.podcast.tags) {
    tags.push(...props.podcast.tags);
  }
  // Also display tags defined on emission
  if(props.podcast.emission.tags) {
    tags.push(...props.podcast.emission.tags);
  }
  return tags;
});

const showSeasonNumber = computed((): boolean => {
  return areSeasonsEnabled(props.podcast.emission) && props.podcast.seasonNumber !== undefined;
});

const showSeasonEpisodeNumber = computed((): boolean => {
  return props.podcast.emission.seasonMode === SeasonMode.SEASON_WITH_PODCAST_NUMBERING && props.podcast.seasonEpisodeNumber !== undefined;
});

/** Indicates whether to show subtitle */
const showSubtitle = computed((): boolean => {
  return props.podcast.annotations.subtitle && state.podcastPage?.hideSubtitle !== true;
});

/** Indicates whether to show description */
const showDescription = computed((): boolean => {
  return state.podcastPage?.descriptionOrSummary !== 'summary';
});

/** Indicates whether to show summary */
const showSummary = computed((): boolean => {
  return props.podcast.summary && state.podcastPage?.descriptionOrSummary !== 'description' && state.podcastPage?.descriptionOrSummary !== undefined;
});

//Methods
function formatCredits(credits: string|undefined): string {
  if (credits === undefined) {
    return '';
  }
  return credits.split(',').map(s => s.trim()).join(', ');
}
function urlify(text:string|undefined){
  return displayHelper.urlify(text);
}
function removeDeleted(): void {
  if (isLiveReadyToRecord.value) {
    router.push("/main/pub/lives");
  } else if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
}

const showTags = computed((): boolean => {
  if (state.podcastPage.hideTags === true) {
    return false;
  }

  return undefined !== tags.value && 0 !== tags.value.length;
});
</script>
