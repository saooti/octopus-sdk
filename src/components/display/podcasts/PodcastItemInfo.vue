<template>
  <div>
    <div class="text-secondary h6 ms-2">
      {{ date }}
    </div>
    <router-link
      :to="{
        name: 'podcast',
        params: { podcastId: podcastId },
        query: { productor: filterOrgaId },
      }"
      class="text-dark flex-grow-1 title-podcast-item"
    >
      {{ title }}
    </router-link>
    <PodcastPlayBar v-if="isProgressBar" :podcast-id="podcastId" :duration="duration" class="mx-2" />

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
          query: { productor: filterOrgaId },
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
import { orgaComputed } from "../../mixins/orgaComputed";
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

  mixins: [orgaComputed],

  props: {
    podcastId: { default: undefined, type: Number },
    title: { default: "", type: String },
    pubDate: { default: "", type: String },
    podcastOrganisationId: { default: "", type: String },
    podcastOrganisationName: { default: "", type: String },
    duration: { default: 0, type: Number },
    animators: { default: undefined, type: Object as () => Array<Participant> },
  },

  computed: {
    isProgressBar(): boolean {
      return state.emissionsPage.progressBar as boolean;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    date(): string {
      return dayjs(this.pubDate).format("D MMMM YYYY, HH[h]mm");
    },
    editRight(): boolean {
      return (
        (true === this.authenticated &&
          this.myOrganisationId === this.podcastOrganisationId) ||
        true === state.generalParameters.isAdmin
      );
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
    overflow: hidden;
    display: -webkit-box;
    flex-grow: 1;
    font-size: 0.9rem;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    min-height: 3rem;
    line-height: 1rem;
    word-break: break-word;
  }

  .producer-podcast-item {
    font-size: 0.55rem;
    color: #666;
    flex-shrink: 0;
  }
}
</style>
