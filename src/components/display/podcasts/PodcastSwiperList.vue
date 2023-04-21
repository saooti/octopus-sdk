<template>
  <PodcastInlineListTemplate
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
    :display-arrow="false"
    :popular-sort="popularSort"
    :button-text="buttonText"
    :button-plus="buttonPlus"
    :title="title"
    :href="href"
    :iab-id="iabId"
    :rubrique-id="rubriqueId"
    :no-rubriquage-id="noRubriquageId"
    @sortChrono="sortChrono"
    @sortPopular="sortPopular"
  >
    <template #list-inline>
      <ClassicLoading
        class="loading-size"
        :loading-text="loading?$t('Loading podcasts ...'):undefined"
      />
      <swiper
        v-if="!loading"
        :slides-per-view="numberItem"
        :space-between="0"
        :loop="allPodcasts.length>=numberItem"
        :navigation="true"
        :modules="modules"
      >
        <swiper-slide
          v-for="p in allPodcasts"
          :key="p.podcastId"
        >
          <PodcastItem
            class="flex-shrink-0 item-phone-margin"
            :podcast="p"
          />
        </swiper-slide>
      </swiper>
    </template>
  </PodcastInlineListTemplate>
</template>

<script lang="ts">
import PodcastInlineListTemplate from './PodcastInlineListTemplate.vue';
import octopusApi from '@saooti/octopus-api';
import domHelper from '../../../helper/dom';
import PodcastItem from './PodcastItem.vue';
import { state } from '../../../stores/ParamSdkStore';
import ClassicLoading from '../../form/ClassicLoading.vue';
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { useFilterStore } from '@/stores/FilterStore';
import { mapState } from 'pinia';
import { Podcast } from '@/stores/class/general/podcast';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastSwiperList',
  
  components: {
    PodcastInlineListTemplate,
    PodcastItem,
    ClassicLoading,
    Swiper,
    SwiperSlide,
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
  },
  emits: ['update:isArrow'],

  data() {
    return {
      loading: true as boolean,
      popularSort: false as boolean,
      allPodcasts: [] as Array<Podcast>,
      modules: [Navigation],
      numberItem: 5 as number
    };
  },
  computed: {
    ...mapState(useFilterStore, ['filterOrgaId']),
    organisation(): string|undefined {
      return this.organisationId ?this.organisationId: this.filterOrgaId;
    },
    watchVariable():string{
      return `${this.emissionId}|${this.organisationId}|${this.filterOrgaId}|${this.iabId}|${this.rubriqueId}|${this.rubriquageId}|${this.query}`;
    },
    sizeItem(): number {
      if (window.innerWidth <= 450) {
        return 12.5;
      }
      return state.generalParameters.podcastItem ? state.generalParameters.podcastItem: 16.5;
    },
  },
  watch: {
    watchVariable(): void {
      this.reset();
      this.fetchNext();
    },
  },
  
  created() {
    if (undefined !== this.requirePopularSort) {
      this.popularSort = this.requirePopularSort;
    }
    if (undefined !== this.isArrow) {
      this.$emit('update:isArrow', true);
    }
    window.addEventListener('resize', this.handleResize);
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },


  mounted() {
    this.handleResize();
    this.fetchNext();
  },
  methods: {
    handleResize(): void {
      if (!this.$el) return;
      const width = (this.$el as HTMLElement).offsetWidth - 95;
      const sixteen = domHelper.convertRemToPixels(this.sizeItem+ 0.5);
      this.numberItem = Math.max(1, Math.floor(width / sixteen));
    },
    async fetchNext(): Promise<void> {
      const data = await octopusApi.fetchDataWithParams<{count: number;result:Array<Podcast>;sort: string;}>(0, 'podcast/search',{
        first: 0,
        size: 10,
        organisationId: this.organisation,
        emissionId: this.emissionId,
        iabId: this.iabId,
        rubriqueId: this.rubriqueId.length ?this.rubriqueId:undefined,
        rubriquageId: this.rubriquageId.length ?this.rubriquageId : undefined,
        noRubriquageId: this.noRubriquageId.length ? this.noRubriquageId : undefined,
        sort: this.popularSort ? 'POPULARITY' : 'DATE',
        query: this.query,
        includeStatus:["READY","PROCESSING"]
      }, true);
      this.allPodcasts = this.allPodcasts.concat(
        data.result.filter((pod: Podcast|null) => null !== pod)
      );
      this.loading = false;
    },
    sortPopular(): void {
      if (this.popularSort) return;
      this.popularSort = true;
      this.reset();
      this.fetchNext();
    },
    sortChrono(): void {
      if (!this.popularSort) return;
      this.popularSort = false;
      this.reset();
      this.fetchNext();
    },
    reset(): void {
      this.loading = true;
      this.allPodcasts.length = 0;
    },
  },
})
</script>
<style lang="scss">
@import '@scss/_variables.scss';
.swiper {
  width: 100%;
  height: 100%;
}
.swiper-button-next, .swiper-button-prev{
  color: $octopus-primary-color !important;
  height: 100%;
  top: 0;
  bottom: 0;
  margin: 0;
}
.swiper-button-next{
  right: 0;
}
.swiper-button-prev{
  left: 0;
}
.swiper-slide-active{
  padding-left:27px;
  @media (max-width: 550px) {
    padding-left:0;
  }
}
.swiper-slide-next{
  padding-right:27px;
}
.swiper-button-lock{
  display: flex;
}
.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>