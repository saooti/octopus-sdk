<template>
  <PodcastSwiperList
    :organisation-id="organisationId"
    :emission-id="emissionId"
    :iab-id="iabId"
    :title="title"
    :href="href"
    :button-text="buttonText"
    :is-arrow="isArrow"
    :require-popular-sort="requirePopularSort"
    :button-plus="buttonPlus"
    :rubrique-id="rubriqueId"
    :rubriquage-id="rubriquageId"
    :no-rubriquage-id="noRubriquageId"
    :query="query"
    :last-three-months="lastThreeMonths"
    @update:is-arrow="$emit('update:isArrow', $event)"
  />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
const PodcastSwiperList = defineAsyncComponent(
  () => import("./PodcastSwiperList.vue"),
);
export default defineComponent({
  name: "PodcastInlineList",

  components: {
    PodcastSwiperList,
  },
  props: {
    organisationId: { default: () => [], type: Array as () => Array<string> },
    emissionId: { default: undefined, type: Number },
    iabId: { default: undefined, type: Number },
    title: { default: "", type: String },
    href: { default: undefined, type: String },
    buttonText: { default: undefined, type: String },
    isArrow: { default: false, type: Boolean },
    requirePopularSort: { default: undefined, type: Boolean },
    buttonPlus: { default: false, type: Boolean },
    rubriqueId: { default: () => [], type: Array as () => Array<number> },
    rubriquageId: { default: () => [], type: Array as () => Array<number> },
    noRubriquageId: { default: () => [], type: Array as () => Array<number> },
    query: { default: undefined, type: String },
    podcastId: { default: undefined, type: Number },
    lastThreeMonths: { default: false, type: Boolean },
  },
  emits: ["update:isArrow"],
});
</script>
<style lang="scss">
.octopus-app .loading-size {
  height: 21.4rem;
}
</style>
