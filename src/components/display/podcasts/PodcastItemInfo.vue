<template>
  <div>
    <time 
      :datetime="podcast.pubDate"
      class="text-secondary h6 ms-2">
      {{ date }}
    </time>
    <router-link
      :to="{
        name: 'podcast',
        params: { podcastId: podcast.podcastId },
      }"
      class="text-dark flex-grow-1 podcast.title-podcast-item basic-line-clamp three-line"
      :podcast.title="$t('Episode name page', { name: podcast.title })"
    >
      {{ podcast.title }}
    </router-link>
    <PodcastPlayBar
      v-if="isProgressBar"
      :display-btn="true"
      :podcast="podcast"
      class="me-2"
    />

    <div class="mx-2 d-flex align-items-center justify-content-between mt-2">
      <div v-if="isPodcastmaker" class="useless-div-for-podcastmaker" />
      <AnimatorsItem
        v-if="podcast.animators && 0 !== podcast.animators.length"
        class="w-0 flex-grow-1"
        :animator="podcast.animators[0]"
      />
      <router-link
        v-if="!isPodcastmaker"
        :to="{
          name: 'productor',
          params: { productorId: podcast.organisation.id },
        }"
        class="text-dark producer-podcast-item"
      >
        {{ "© " + orgaNameDisplay }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import AnimatorsItem from "./AnimatorsItem.vue";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import dayjs from "dayjs";
import { defineAsyncComponent, defineComponent } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
const PodcastPlayBar = defineAsyncComponent(
  () => import("./PodcastPlayBar.vue"),
);
export default defineComponent({
  name: "PodcastItemInfo",

  components: {
    AnimatorsItem,
    PodcastPlayBar,
  },

  props: {
    podcast: { default: () => ({}), type: Object as () => Podcast },
  },

  setup(){
    const { isPodcastmaker, isEditRights } = useOrgaComputed();
    return { isPodcastmaker, isEditRights }
  },

  computed: {
    isProgressBar(): boolean {
      return state.emissionsPage.progressBar as boolean;
    },
    date(): string {
      return dayjs(this.podcast.pubDate).format("D MMMM YYYY");
    },
    editRight(): boolean {
      return this.isEditRights(this.podcast.organisation.id);
    },
    orgaNameDisplay(): string {
      if (this.podcast.organisation.name.length > 30) {
        return this.podcast.organisation.name.substring(0, 30) + "...";
      }
      return this.podcast.organisation.name;
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .podcast.title-podcast-item {
    font-weight: 700;
    margin: 0.25rem 0.5rem 0.5rem;
    flex-grow: 1;
    font-size: 0.9rem;
    min-height: 3rem;
    line-height: 1rem;
  }

  .producer-podcast-item {
    font-size: 0.55rem;
    color: var(--octopus-gray-text);
    flex-shrink: 0;
  }
}
</style>
