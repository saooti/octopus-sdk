<template>
  <PodcastInlineListTemplate
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
    :display-arrow="true"
    :popular-sort="popularSort"
    :button-text="buttonText"
    :button-plus="buttonPlus"
    :title="title"
    :href="href"
    :iab-id="iabId"
    :rubrique-id="rubriqueId"
    :previous-available="previousAvailable"
    :next-available="nextAvailable"
    :no-rubriquage-id="noRubriquageId"
    @sortChrono="sortChrono"
    @sortPopular="sortPopular"
    @displayPrevious="displayPrevious"
    @displayNext="displayNext"
  >
    <template #list-inline>
      <ClassicLoading
        :loading-text="loading?$t('Loading podcasts ...'):undefined"
      />
      <transition-group
        v-show="loaded"
        :name="transitionName"
        class="element-list-inline"
        tag="ul"
        :class="[
          alignLeft ? 'justify-content-start' : '',
          overflowScroll ? 'overflowScroll' : '',
        ]"
        :css="isInlineAnimation"
      >
        <PodcastItem
          v-for="p in podcasts"
          :key="p.podcastId"
          class="flex-shrink-0 item-phone-margin"
          :podcast="p"
          :class="[alignLeft ? 'me-3' : '']"
        />
      </transition-group>
    </template>
  </PodcastInlineListTemplate>
</template>

<script lang="ts">
import PodcastInlineListTemplate from './PodcastInlineListTemplate.vue';
import octopusApi from '@saooti/octopus-api';
import domHelper from '../../../helper/dom';
import PodcastItem from './PodcastItem.vue';
import ClassicLoading from '../../form/ClassicLoading.vue';
const PHONE_WIDTH = 960;
import { state } from '../../../store/paramStore';
import { Podcast } from '@/store/class/general/podcast';
import { imageProxy } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastInlineListClassic',
  
  components: {
    PodcastItem,
    ClassicLoading,
    PodcastInlineListTemplate
  },
  mixins:[imageProxy],
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
      loaded: true as boolean,
      index: 0 as number,
      first: 0 as number,
      size: 5 as number,
      totalCount: 0 as number,
      popularSort: false as boolean,
      allPodcasts: [] as Array<Podcast>,
      direction: 1 as number,
      alignLeft: false as boolean,
    };
  },
  computed: {
    podcasts(): Array<Podcast> {
      return this.allPodcasts.slice(this.index, this.index + this.size);
    },
    sizeItem(): number {
      return state.generalParameters.podcastItem ? (state.generalParameters.podcastItem as number): 13;
    },
    overflowScroll(): boolean {
      return (state.emissionPage.overflowScroll as boolean);
    },
    isInlineAnimation(): boolean {
      return (state.generalParameters.isInlineAnimation as boolean);
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    organisation(): string|undefined {
      return this.organisationId ?this.organisationId: this.filterOrga;
    },
    previousAvailable(): boolean {
      return this.index > 0;
    },
    nextAvailable(): boolean {
      return this.index + this.size < this.totalCount;
    },
    transitionName(): string {
      return this.direction > 0 ? 'out-left' : 'out-right';
    },
    watchVariable():string{
      return `${this.emissionId}|${this.organisationId}|${this.filterOrga}|${this.iabId}|${this.rubriqueId}|${this.rubriquageId}|${this.query}`;
    }
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
    async fetchNext(): Promise<void> {
      const data =  await octopusApi.fetchDataWithParams<{count: number;result:Array<Podcast>;sort: string;}>(0, 'podcast/search',{
         first: this.first,
        size: this.size + 1,
        organisationId: this.organisation,
        emissionId: this.emissionId,
        iabId: this.iabId,
        rubriqueId: this.rubriqueId.length ?this.rubriqueId:undefined,
        rubriquageId: this.rubriquageId.length ?this.rubriquageId : undefined,
        noRubriquageId: this.noRubriquageId.length ? this.noRubriquageId : undefined,
        sort: this.popularSort ? 'POPULARITY' : 'DATE',
        query: this.query,
      }, true);
      this.loading = false;
      this.loaded = true;
      this.totalCount = data.count;
      if (this.allPodcasts.length + data.result.length < this.totalCount) {
        const nexEl = data.result.pop() as Podcast;
        if(nexEl){
          this.preloadImage(nexEl.imageUrl?nexEl.imageUrl:'');
        }
      }
      this.allPodcasts = this.allPodcasts.concat(
        data.result.filter((pod: Podcast|null) => null !== pod)
      );
      this.alignLeft = this.allPodcasts.length <= 3;
      this.first += this.size;
    },
    displayPrevious(): void {
      this.direction = -1;
      if (this.previousAvailable) {
        this.index -= 1;
      }
    },
    displayNext(): void {
      this.direction = 1;
      if (!this.nextAvailable) return;
      if (
        this.first - (this.index + this.size) < 2 &&
        this.allPodcasts.length < this.totalCount
      ) {
        this.fetchNext();
      }
      this.index += 1;
    },
    handleResize(): void {
      if (!this.$el) return;
      if (this.overflowScroll) {
        this.size = 20;
        return;
      }
      if (window.innerWidth <= PHONE_WIDTH) {
        this.size = 10;
        return;
      }
      const width = (this.$el as HTMLElement).offsetWidth;
      const sixteen = domHelper.convertRemToPixels(this.sizeItem + 0.8);
      this.size = Math.floor(width / sixteen);
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
      this.loaded = true;
      this.index = 0;
      this.first = 0;
      this.totalCount = 0;
      this.allPodcasts.length = 0;
    },
    preloadImage(url: string): void {
      const img = new Image();
      img.src = this.proxyImageUrl(url,'260');
    },
  },
})
</script>