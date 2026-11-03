<template>
    <!-- Leaving the whole card (not only the info) closes a hovered description, so it can be hovered itself (RGAA 10.13) -->
    <!-- eslint-disable-next-line vuejs-accessibility/mouse-events-have-key-events, vuejs-accessibility/no-static-element-interactions -- Hover is a mouse shortcut, keyboard uses the description button -->
    <article
        class="podcast-item-container border"
        :data-pubdate="displayDate"
        :data-count="podcast.downloadCount"
        @mouseleave="hoverDescription(false)"
    >
        <PodcastImage
            :podcast="podcast"
            :hide-play="descriptionOpen && hasDescription"
            :display-description="hasDescription"
            :description-expanded="descriptionOpen"
            :description-id="descriptionId"
            :fetch-conference="fetchConference"
            @toggle-description="toggleDescription"
        />
        <div
            v-show="descriptionOpen"
            :id="descriptionId"
            ref="descriptionPodcastContainer"
            class="element-description description-podcast-item html-wysiwyg-content"
            :class="[
                descriptionOpen && hasDescription ? 'visible' : 'invisible',
                !isMobile && isDescriptionBig ? 'after-element-description' : 'mobile-description-podcast-item',
            ]"
        >
            <!-- eslint-disable vue/no-v-html -->
            <div ref="descriptionPodcast" v-html="displayHelper.urlify(description)" />
            <!-- eslint-enable -->
        </div>
        <!-- eslint-disable-next-line vuejs-accessibility/mouse-events-have-key-events, vuejs-accessibility/no-static-element-interactions -- Hover is a mouse shortcut, keyboard uses the description button -->
        <div @mouseenter="hoverDescription(true)">
            <PodcastItemInfo
                :podcast="podcast"
                :show-emission-name="showEmissionName"
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
import { computed, nextTick, onBeforeMount, onBeforeUnmount, ref, useId, useTemplateRef, watch } from "vue";
import { Conference } from "@/stores/class/conference/conference";

import displayHelper from "../../../helper/displayHelper";
import ParamSdkStore from '@/stores/ParamSdkStore';

//Props 
const props = defineProps<{
    podcast: Podcast;
    fetchConference?: Conference;
    /** Also display emission name */
    showEmissionName?: boolean;
}>();

//Data 
const descriptionId = useId();
const isMobile = ref(false);
const firstDisplayDesc = ref(false);
const descriptionOpen = ref(false);
/** Whether the description was opened by hovering (so leaving the card closes it) */
let openedByHover = false;
const isDescriptionBig = ref(false);
const descriptionPodcastRef = useTemplateRef('descriptionPodcast');
const descriptionPodcastContainerRef = useTemplateRef('descriptionPodcastContainer');

//Computed
const displayDate = computed(() => dayjs(props.podcast.pubDate).format());
const description = computed(() => props.podcast.description ?? "");
const hasDescription = computed(() => 0 !== description.value.length && ParamSdkStore.state.generalParameters.disablePodcastDescriptionToggle !== true);

onBeforeMount(()=>{
    isMobile.value = window.matchMedia("(hover: none)").matches;
})

// Escape closes the description, even when only hovered (RGAA 10.13)
watch(descriptionOpen, open => {
    if (open) {
        document.addEventListener('keydown', onDocumentKeydown);
    } else {
        document.removeEventListener('keydown', onDocumentKeydown);
    }
});
onBeforeUnmount(() => document.removeEventListener('keydown', onDocumentKeydown));

//Methods
/** Mouse shortcut, debounced so moving between elements does not flicker */
const hoverDescription = debounce((open: boolean): void => {
    if (open && !descriptionOpen.value && hasDescription.value) {
        openedByHover = true;
        showDescription();
    } else if (!open && openedByHover) {
        hideDescription();
    }
}, 100);
function toggleDescription(): void {
    if (descriptionOpen.value) {
        hideDescription();
    } else {
        openedByHover = false;
        showDescription();
    }
}
function onDocumentKeydown(event: KeyboardEvent): void {
    if ('Escape' === event.key) {
        hideDescription(true);
    }
}
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
    descriptionOpen.value = true;
    nextTick(() => {
        initDescription();
    });
}
/**
 * @param restoreFocus If focus is inside the description, move it back to its button
 */
function hideDescription(restoreFocus = false): void {
    if (restoreFocus && descriptionPodcastContainerRef.value?.contains(document.activeElement)) {
        document.getElementById(`${descriptionId}-toggle`)?.focus();
    }
    openedByHover = false;
    descriptionOpen.value = false;
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
