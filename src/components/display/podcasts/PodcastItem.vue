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
      <div ref="descriptionPodcast" v-html="description" />
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

<script lang="ts">
import debounce from '../../../helper/debounceHelper';
import PodcastItemInfo from "./PodcastItemInfo.vue";
import PodcastImage from "./PodcastImage.vue";
import dayjs from "dayjs";
import { Podcast } from "@/stores/class/general/podcast";
import { defineComponent } from "vue";
import { Conference } from "@/stores/class/conference/conference";
export default defineComponent({
  name: "PodcastItem",

  components: {
    PodcastItemInfo,
    PodcastImage,
  },

  props: {
    podcast: { default: () => ({}), type: Object as () => Podcast },
    fetchConference: { default: undefined, type: Object as () => Conference },
  },

  data() {
    return {
      firstDisplayDesc: false as boolean,
      hoverDesc: false as boolean,
      arrowDirection: "up" as string,
      isDescriptionBig: false as boolean,
      debounceShowDescriptionEvent: undefined as undefined | (() => void),
      debounceHideDescriptionEvent: undefined as undefined | (() => void),
    };
  },

  computed: {
    displayDate(): string {
      return dayjs(this.podcast.pubDate).format();
    },
    description(): string {
      return this.podcast.description ?? "";
    },
    isMobile(): boolean {
      return window.matchMedia("(hover: none)").matches;
    },
  },
  created() {
    this.debounceShowDescriptionEvent = debounce(this.showDescription, 100);
    this.debounceHideDescriptionEvent = debounce(this.hideDescription, 100);
  },

  methods: {
    initDescription(): void {
      if (this.firstDisplayDesc /* || this.isMobile */) {
        return;
      }
      const podcastDesc = this.$refs.descriptionPodcast as HTMLElement;
      const podcastDescContainer = this.$refs
        .descriptionPodcastContainer as HTMLElement;
      if (podcastDesc?.clientHeight > podcastDescContainer?.clientHeight) {
        this.isDescriptionBig = true;
      }
      this.firstDisplayDesc = true;
    },
    showDescription(): void {
      this.arrowDirection = "down";
      this.hoverDesc = true;
      this.$nextTick(() => {
        this.initDescription();
      });
    },
    hideDescription(): void {
      this.arrowDirection = "up";
      this.hoverDesc = false;
    },
  },
});
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
