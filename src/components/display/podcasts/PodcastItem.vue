<template>
  <article
    class="podcast-item-container border"
    :data-pubdate="displayDate"
    :data-count="podcast.downloadCount"
  >
    <PodcastImage
      :podcast="podcast"
      :hide-play="hoverDesc && 0 !== description.length"
      :display-description="0 !== description.length"
      :arrow-direction="arrowDirection"
      :fetch-conference="fetchConference"
      @hide-description="hideDescription"
      @show-description="showDescription"
    />
    <div
      v-if="hoverDesc"
      ref="descriptionPodcastContainer"
      class="element-description description-podcast-item html-wysiwyg-content"
      :class="[
        hoverDesc && '' !== description ? 'visible' : 'invisible',
        !isMobile && isDescriptionBig ? 'after-element-description' : 'mobile-description-podcast-item',
      ]"
    >
      <!-- eslint-disable vue/no-v-html -->
      <div ref="descriptionPodcast" v-html="displayHelper.urlify(description)" />
      <!-- eslint-enable -->
    </div>
    <div
      @mouseenter="debounceShowDescriptionEvent"
      @mouseleave="debounceHideDescriptionEvent"
    >
      <PodcastItemInfo
        :podcast="podcast"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import debounce from '../../../helper/debounceHelper';
import PodcastItemInfo from "./PodcastItemInfo.vue";
import PodcastImage from "./PodcastImage.vue";
import dayjs from "dayjs";
import { Podcast } from "../../../stores/class/general/podcast";
import { computed, nextTick, onBeforeMount, ref, Ref, useTemplateRef } from "vue";
import { Conference } from "@/stores/class/conference/conference";

import displayHelper from "../../../helper/displayHelper";

//Props 
const props = defineProps<{
  podcast: Podcast;
  fetchConference?: Conference;
}>();

//Data 
const isMobile = ref(false);
const firstDisplayDesc = ref(false);
const hoverDesc = ref(false);
const arrowDirection = ref("up");
const isDescriptionBig = ref(false);
const debounceShowDescriptionEvent: Ref< undefined | (() => void)> = ref(undefined);
const debounceHideDescriptionEvent: Ref< undefined | (() => void)> = ref(undefined);
const descriptionPodcastRef = useTemplateRef('descriptionPodcast');
const descriptionPodcastContainerRef = useTemplateRef('descriptionPodcastContainer');

//Computed
const displayDate = computed(() => dayjs(props.podcast.pubDate).format());
const description = computed(() => props.podcast.description ?? "");

onBeforeMount(()=>{
  isMobile.value = window.matchMedia("(hover: none)").matches;
  debounceShowDescriptionEvent.value = debounce(showDescription, 100);
  debounceHideDescriptionEvent.value = debounce(hideDescription, 100);
})

//Methods
function initDescription(): void {
  if (firstDisplayDesc.value) {
    return;
  }
  const podcastDesc = descriptionPodcastRef?.value as HTMLElement;
  const podcastDescContainer = descriptionPodcastContainerRef?.value as HTMLElement;
  if (podcastDesc?.clientHeight > podcastDescContainer?.clientHeight) {
    isDescriptionBig.value = true;
  }
  firstDisplayDesc.value = true;
}
function showDescription(): void {
  arrowDirection.value = "down";
  hoverDesc.value = true;
  nextTick(() => {
    initDescription();
  });
}
function hideDescription(): void {
  arrowDirection.value = "up";
  hoverDesc.value = false;
}
</script>

<style lang="scss">

.octopus-app {
  .podcast-item-container {
    display: flex;
    flex-direction: column;
    border-radius: var(--octopus-border-radius);
    position: relative;
    width: var(--octopus-podcast-size);
    height: 20.5rem;
    overflow: hidden;
    text-align: left;
    background: var(--octopus-background);
    flex-shrink: 0;

    .description-podcast-item {
      --octopus-max-height-description: var(--octopus-podcast-size);

      padding: 1rem;
      background-color: oklch(from var(--octopus-background) l c h / 90%);
      position: absolute;
      width: var(--octopus-podcast-size);
      height: var(--octopus-podcast-size);
      margin-top:0;

      &.mobile-description-podcast-item {
        overflow: auto;
      }
    }

    @media (width <= 450px) {
      width: var(--octopus-image-size);
      height: 19rem;

      .description-podcast-item {
        height: var(--octopus-image-size);
        width: var(--octopus-image-size);
      }
    }
  }
}
</style>
