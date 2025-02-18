<template>
  <div>
    <time 
      :datetime="pubDate"
      class="text-secondary h6 ms-2">
      {{ date }}
    </time>
    <router-link
      :to="{
        name: 'podcast',
        params: { podcastId: podcastId },
      }"
      class="text-dark flex-grow-1 title-podcast-item basic-line-clamp three-line"
      :title="$t('Episode name page', { name: title })"
    >
      {{ title }}
    </router-link>
    <PodcastPlayBar
      v-if="isProgressBar"
      :podcast-id="podcastId"
      :duration="duration"
      class="mx-2"
    />

    <div class="mx-2 d-flex align-items-center justify-content-between mt-2">
      <div v-if="isPodcastmaker" class="useless-div-for-podcastmaker" />
      <AnimatorsItem
        v-if="animators && 0 !== animators.length"
        class="w-0 flex-grow-1"
        :animator="animators[0]"
      />
      <router-link
        v-if="!isPodcastmaker"
        :to="{
          name: 'productor',
          params: { productorId: podcastOrganisationId },
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
import { state } from "../../../stores/ParamSdkStore";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import dayjs from "dayjs";
import { defineAsyncComponent, defineComponent } from "vue";
import { Participant } from "@/stores/class/general/participant";
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
    podcastId: { default: undefined, type: Number },
    title: { default: "", type: String },
    pubDate: { default: "", type: String },
    podcastOrganisationId: { default: "", type: String },
    podcastOrganisationName: { default: "", type: String },
    duration: { default: 0, type: Number },
    animators: { default: undefined, type: Object as () => Array<Participant> },
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
      return dayjs(this.pubDate).format("D MMMM YYYY");
    },
    editRight(): boolean {
      return this.isEditRights(this.podcastOrganisationId);
    },
    orgaNameDisplay(): string {
      if (this.podcastOrganisationName.length > 30) {
        return this.podcastOrganisationName.substring(0, 30) + "...";
      }
      return this.podcastOrganisationName;
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .title-podcast-item {
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
