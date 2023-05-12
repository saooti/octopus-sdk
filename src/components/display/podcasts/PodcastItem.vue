<template>
  <div
    class="podcast-item-container"
    :class="[
      podcastBorderBottom ? 'border-bottom' : '',
    ]"
    :data-pubdate="displayDate"
    :data-count="podcast.downloadCount"
  >
    <PodcastImage
      :podcast="podcast"
      :hide-play="!podcastItemDescription || (podcastItemDescription && (!hoverDesc || !description))"
      :display-description="0!==description.length && podcastItemDescription"
      :arrow-direction="arrowDirection"
      :fetch-conference="fetchConference"
      @hideDescription="hideDescription"
      @showDescription="showDescription"
    />
    <div
      v-if="podcastItemDescription && hoverDesc"
      ref="descriptionPodcastContainer"
      class="description-podcast-item html-wysiwyg-content"
      :class="[
        hoverDesc && ''!==description ? 'visible' : 'invisible',
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
    <div
      @mouseenter="showDescription"
      @mouseleave="hideDescription"
    >
      <PodcastItemInfo
        :podcast-id="podcast.podcastId"
        :title="podcast.title"
        :pub-date="podcast.pubDate"
        :podcast-organisation-id="podcast.organisation.id"
        :podcast-organisation-name="podcast.organisation.name"
        :duration="podcast.duration"
        :animators="podcast.animators"
      />
    </div>
  </div>
</template>

<script lang="ts">
import PodcastItemInfo from './PodcastItemInfo.vue';
import PodcastImage from './PodcastImage.vue';
import { state } from '../../../stores/ParamSdkStore';
import dayjs from 'dayjs';
import { Podcast } from '@/stores/class/general/podcast';
import { defineComponent } from 'vue'
import { Conference } from '@/stores/class/conference/conference';
export default defineComponent({
  name: 'PodcastItem',
  
  components: {
    PodcastItemInfo,
    PodcastImage,
  },

  props: {
    podcast: { default: ()=>({}), type: Object as ()=> Podcast},
    fetchConference: { default: undefined, type: Object as ()=>Conference},
  },

  data() {
    return {
      firstDisplayDesc : false as boolean,
      hoverDesc: false as boolean,
      arrowDirection: 'up' as string,
      isDescriptionBig: false as boolean,
    };
  },

  computed: {
    podcastBorderBottom(): boolean {
      return (state.podcastsPage.podcastBorderBottom as boolean);
    },
    podcastItemDescription(): boolean {
      return (state.podcastPage.podcastItemDescription as boolean);
    },
    displayDate(): string {
      return dayjs(this.podcast.pubDate).format();
    },
    description(): string {
      return this.podcast.description ?? '';
    },
  },

  methods: {
    initDescription():void{
      if(this.firstDisplayDesc){return;}
      const podcastDesc = (this.$refs.descriptionPodcast as HTMLElement);
      const podcastDescContainer = (this.$refs.descriptionPodcastContainer as HTMLElement);
      if (podcastDesc?.clientHeight > podcastDescContainer?.clientHeight) {
        this.isDescriptionBig = true;
      }
      this.firstDisplayDesc=true;
    },
    showDescription(): void {
      if(!this.podcastItemDescription){return}
      this.arrowDirection = 'down';
      this.hoverDesc = true;
      this.$nextTick(() => {
        this.initDescription();
      });
    },
    hideDescription(): void {
      if(!this.podcastItemDescription){return}
      this.arrowDirection = 'up';
      this.hoverDesc = false;
    },
  },
})
</script>

<style lang="scss">
@import '@scss/_variables.scss';
.octopus-app{
.podcast-item-container {
  border-radius: $octopus-borderradius;
  list-style: none;
  position: relative;
  width: $octopus-item-size;
  height: 23.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-align: left;
  background: #fff;
  flex-shrink: 0;
  border: 2px solid #eee;
 
  .description-podcast-item {
    padding: 1rem;
    color: #333;
    background-color: rgba(255, 255, 255, 0.92);
    height: $octopus-item-size;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9em;
    position: absolute;
    width: $octopus-item-size;
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
  @media (max-width: 450px) {
    width: $octopus-mobile-item-size;
    height: 18.8rem;
    .description-podcast-item{
      height: $octopus-mobile-item-size;
      width: $octopus-mobile-item-size;
    }
  }
}
}
</style>