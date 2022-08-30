<template>
  <li
    class="podcast-item-container"
    :class="[
      podcastShadow ? 'shadow-element' : '',
      podcastBorderBottom ? 'border-bottom' : '',
    ]"
    :data-pubdate="displayDate"
    :data-count="podcast.downloadCount"
  >
    <PodcastImage
      :podcast="podcast"
      :hide-play="!podcastItemDescription || (podcastItemDescription && (!hover || !description))"
      :display-description="0!==description.length && podcastItemDescription"
      :arrow-direction="arrowDirection"
      @hideDescription="hideDescription"
      @showDescription="showDescription"
    />
    <div
      v-if="podcastItemDescription"
      ref="descriptionPodcastContainer"
      class="description-podcast-item html-wysiwyg-content"
      :class="[
        hover && ''!==description ? 'visible' : 'invisible',
        isDescriptionBig ? 'after-podcast-description' : '',
      ]"
    >
      <!-- eslint-disable vue/no-v-html -->
      <div
        ref="descriptionPodcast"
        v-html="description"
      />
    <!-- eslint-enable -->
    </div>
    <PodcastItemInfo
      :podcast-id="podcast.podcastId"
      :title="podcast.title"
      :pub-date="podcast.pubDate"
      :podcast-organisation-id="podcast.organisation.id"
      :podcast-organisation-name="podcast.organisation.name"
      :duration="podcast.duration"
      :animators="podcast.animators"
      @mouseenter="showDescription"
      @mouseleave="hideDescription"
    />
  </li>
</template>

<script lang="ts">
import PodcastItemInfo from './PodcastItemInfo.vue';
import PodcastImage from './PodcastImage.vue';
import { state } from '../../../store/paramStore';
import moment from 'moment';
import { Podcast } from '@/store/class/general/podcast';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastItem',
  
  components: {
    PodcastItemInfo,
    PodcastImage,
  },

  props: {
    podcast: { default: ()=>({}), type: Object as ()=> Podcast},
  },

  data() {
    return {
      hover: false as boolean,
      arrowDirection: 'up' as string,
      isDescriptionBig: false as boolean,
    };
  },

  computed: {
    podcastShadow(): boolean {
      return (state.podcastsPage.podcastShadow as boolean);
    },
    podcastBorderBottom(): boolean {
      return (state.podcastsPage.podcastBorderBottom as boolean);
    },
    podcastItemDescription(): boolean {
      return (state.podcastPage.podcastItemDescription as boolean);
    },
    displayDate(): string {
      return moment(this.podcast.pubDate).format('X');
    },
    description(): string {
      return this.podcast.description ?? '';
    },
  },

  mounted() {
    if(!this.podcastItemDescription){return}
    const podcastDesc = (this.$refs.descriptionPodcast as HTMLElement);
    const podcastDescContainer = (this.$refs.descriptionPodcastContainer as HTMLElement);
    if (podcastDesc?.clientHeight > podcastDescContainer?.clientHeight) {
      this.isDescriptionBig = true;
    }
  },
  methods: {
    showDescription(): void {
      if(!this.podcastItemDescription){return}
      this.arrowDirection = 'down';
      this.hover = true;
    },
    hideDescription(): void {
      if(!this.podcastItemDescription){return}
      this.arrowDirection = 'up';
      this.hover = false;
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
.podcast-item-container {
  border-radius: 0.8rem;
  list-style: none;
  position: relative;
  width: 13rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-align: left;
  background: #fff;
  flex-shrink: 0;
 
  .description-podcast-item {
    padding: 1rem;
    color: #333;
    background-color: rgba(255, 255, 255, 0.92);
    height: 13rem;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9em;
    position: absolute;
    width: 13rem;
    word-break: break-word;
    &.after-podcast-description:after {
      content: '...';
      position: absolute;
      padding-left: 1rem;
      right: 0;
      bottom: 0;
      width: 100%;
      font-size: 1rem;
      font-weight: bolder;
      text-align: center;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff 40%);
    }
  }
  @media (max-width: 960px) {
    margin: 0.5rem !important;
  }
}
}
</style>