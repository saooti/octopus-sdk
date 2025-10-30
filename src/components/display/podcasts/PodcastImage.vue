<!--
  Component to display the image of a podcast.
  May also display additional information, for example when an error occured
  when processing the file (using PodcastPlayButton).
-->
<template>
  <div
    v-if="podcast"
    class="img-box img-box-podcast mb-3 flex-column justify-content-start align-items-start position-relative flex-shrink-0 float-start"
  >
    <router-link
      :to="{
        name: 'podcast',
        params: { podcastId: podcast.podcastId },
      }"
      :title="t('Episode name page', { name: podcast.title })"
    >
      <img
        v-lazy="useProxyImageUrl(podcast.imageUrl, '270')"
        width="270"
        height="270"
        aria-hidden="true"
        alt=""
        class="img-box img-box-podcast"
        :title="t('Episode name image', { name: podcast.title })"
      >
    </router-link>
    <div
      v-if="state.generalParameters.podcastmaker"
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
      {{ t("Recorded in live") }}
    </div>
    <PodcastPlayButton
      :podcast="podcast"
      :hide-play="hidePlay"
      :fetch-conference="fetchConference"
      :in-list="inList"
    />
    <button
      v-if="displayDescription && isMobile"
      class="background-icon bg-dark text-white"
      :title="isDescription ? t('Hide description') : t('Show description')"
      @click="showDescription"
    >
      <ChevronDownIcon :class="{ 'arrow-transform': !isDescription }" />
    </button>
  </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import PodcastPlayButton from "./PodcastPlayButton.vue";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import {useImageProxy} from "../../composable/useImageProxy";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  podcast: { default: () => ({}), type: Object as () => Podcast },
  hidePlay: { default: false, type: Boolean },
  displayDescription: { default: false, type: Boolean },
  arrowDirection: { default: "up", type: String },
  isAnimatorLive: { default: false, type: Boolean },
  fetchConference: { default: undefined, type: Object as () => Conference },
  /** Indicates that the podcast is displayed in a list */
  inList: { default: false, type: Boolean }
})

//Emits
const emit = defineEmits(["hideDescription", "showDescription"]);

//Data 
const isDescription = ref(false);
const isMobile = ref(false);

//Composables
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();

//Computed
const mainRubrique = computed(() => {
  return (
    undefined !== state.podcastPage.mainRubrique &&
    0 !== state.podcastPage.mainRubrique &&
    (props.podcast?.rubriqueIds?.includes(
      state.podcastPage.mainRubrique,
    ) as boolean)
  );
});
const isRecordedInLive = computed(() => {
  return (
    undefined === props.fetchConference &&
    undefined !== props.podcast.conferenceId &&
    "READY_TO_RECORD" !== props.podcast.processingStatus
  );
});
const statusText = computed(() => {
  if (!props.fetchConference) {
    return "";
  }

  switch (props.fetchConference.status) {
    case "PLANNED":
      return t("live in few time");

    case "PENDING":
      if (props.isAnimatorLive) {
        return t("Open studio");
      } else {
        return t("live upcoming");
      }

    case "RECORDING":
      return t("In live");

    case "DEBRIEFING":
      if ("READY_TO_RECORD" === props.podcast.processingStatus) {
        return t("Not recording");
      } else {
        return t("Debriefing");
      }

    case "ERROR":
      return t("In error");

    case "PUBLISHING":
      return t("Publishing");

    default:
      return "";
  }
});


//Watch
watch(()=>props.arrowDirection, () => {
  if ("up" === props.arrowDirection) {
    isDescription.value = true;
    showDescription();
  } else {
    isDescription.value = false;
    showDescription();
  }
});


onBeforeMount(()=>{
  isMobile.value = window.matchMedia("(hover: none)").matches;
})

//Methods
function showDescription(): void {
  if (isDescription.value) {
    emit("hideDescription");
  } else {
    emit("showDescription");
  }
  isDescription.value = !isDescription.value;
}
</script>

<style lang="scss">
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
    width: 44px;
    height: 44px;
    font-size: 0.7rem;
    right: 0;
    bottom: 0;
    margin: 5px;
    position: absolute;
    cursor: pointer;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
