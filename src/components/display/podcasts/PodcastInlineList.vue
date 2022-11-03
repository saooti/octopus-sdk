<template>
  <PodcastInlineListClassic
    v-if="listTypeClassic"
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
    :podcast-id="podcastId"
    @update:isArrow="$emit('update:isArrow',$event)"
  />
  <PodcastSwiperList
    v-else
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
    @update:isArrow="$emit('update:isArrow',$event)"
  />
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import { defineAsyncComponent, defineComponent } from 'vue';
const PodcastInlineListClassic = defineAsyncComponent(() => import('./PodcastInlineListClassic.vue'));
const PodcastSwiperList = defineAsyncComponent(() => import('./PodcastSwiperList.vue'));
export default defineComponent({
  name: 'PodcastInlineList',
  
  components: {
    PodcastInlineListClassic,
    PodcastSwiperList,
  },
  props: {
    organisationId: { default: undefined, type: String},
    emissionId: { default: undefined, type: Number},
    iabId: { default: undefined, type: Number},
    title: { default: '', type: String},
    href: { default: undefined, type: String},
    buttonText: { default: undefined, type: String},
    isArrow: { default: false, type: Boolean},
    requirePopularSort: { default:undefined, type: Boolean},
    buttonPlus: { default:false, type: Boolean},
    rubriqueId: { default: () => [], type: Array as ()=> Array<number> },
    rubriquageId:{ default: () => [], type: Array as ()=> Array<number> },
    noRubriquageId: { default: () => [], type: Array as ()=> Array<number> },
    query: { default: undefined, type: String},
    podcastId: { default: undefined, type: Number},
  },
  emits: ['update:isArrow'],
  computed:{
    listTypeClassic(): boolean {
      return (state.podcastPage.listTypeClassic as boolean);
    },
  }
})
</script>
<style lang="scss">
.octopus-app .loading-size{
  height: 21.4rem;
}
</style>