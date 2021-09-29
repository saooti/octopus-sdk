<template>
  <div
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
    class="d-flex flex-column p-3 list-episode"
  >
    <h2>{{ title }}</h2>
    <div class="d-flex justify-content-between">
      <div class="d-flex">
        <button
          class="btn btn-underline"
          :class="{ active: popularSort }"
          @click="sortPopular()"
        >
          {{ $t('Most popular') }}
        </button>
        <button
          class="btn btn-underline"
          :class="{ active: !popularSort }"
          @click="sortChrono()"
        >
          {{ $t('Last added') }}
        </button>
      </div>
      <div
        v-if="!isArrow"
        class="hide-phone"
      >
        <button
          class="btn btn-arrow"
          :class="{ disabled: !previousAvailable }"
          :aria-label="$t('Display previous')"
          @click="displayPrevious()"
        >
          <div class="saooti-arrow-left2" />
        </button>
        <button
          class="btn btn-arrow"
          :class="{ disabled: !nextAvailable }"
          :aria-label="$t('Display next')"
          @click="displayNext()"
        >
          <div class="saooti-arrow-right2" />
        </button>
      </div>
    </div>
    <div
      v-if="loading"
      class="d-flex justify-content-center"
    >
      <div class="spinner-border mr-3" />
      <h3 class="mt-2">
        {{ $t('Loading podcasts ...') }}
      </h3>
    </div>
    <transition-group
      v-show="loaded"
      :name="transitionName"
      class="podcast-list-inline"
      tag="ul"
      :class="[alignLeft ? 'justify-content-start' : '']"
    >
      <PodcastItem
        v-for="p in podcasts"
        :key="p.podcastId"
        class="flex-shrink item-phone-margin"
        :podcast="p"
        :class="[alignLeft ? 'mr-3' : '']"
      />
    </transition-group>
    <router-link
      class="btn btn-link"
      :class="buttonPlus ? 'btn-linkPlus' : ''"
      :to="refTo"
    >
      {{ buttonText }}
      <div
        v-if="buttonPlus"
        class="saooti-plus"
      />
    </router-link>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import domHelper from '../../../helper/dom';
import PodcastItem from './PodcastItem.vue';

const PHONE_WIDTH = 960;

import { Podcast } from '@/store/class/podcast';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastInlineList',
  props: {
    organisationId: { default: undefined as string|undefined},
    emissionId: { default: undefined as number|undefined},
    iabId: { default: undefined as number|undefined},
    title: { default: '' as string},
    href: { default: undefined as string|undefined},
    buttonText: { default: false as boolean},
    isArrow: { default: false as boolean},
    requirePopularSort: { default:undefined as boolean|undefined},
    buttonPlus: { default:false as boolean},
    rubriqueId: { default: () => ([]) as Array<number> },
    rubriquageId:{ default: () => ([]) as Array<number> },
  },
  emits: ['update:isArrow'],

  components: {
    PodcastItem
  },
  data() {
    return {
      loading: true as boolean,
      loaded: true as boolean,
      index: 0 as number,
      first: 0 as number,
      size: 5 as number,
      totalCount: 0 as number,
      popularSort: true as boolean,
      allPodcasts: [] as Array<Podcast>,
      direction: 1 as number,
      alignLeft: false as boolean,
    };
  },
  computed: {
    podcasts(): Array<Podcast> {
      return this.allPodcasts.slice(this.index, this.index + this.size);
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
    rubriqueQueryParam(): string|undefined{
      if(this.$store.state.filter && this.$store.state.filter.rubriqueFilter && this.$store.state.filter.rubriqueFilter.length){
        return this.$store.state.filter.rubriqueFilter.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
      }
      return undefined;
    },
    refTo(): any {
      if (this.href) return this.href;
      if(this.iabId){
        return {
          name: 'category',
          params: { iabId: this.iabId },
          query: { productor: this.$store.state.filter.organisationId },
        };
      }
      return {
          name: 'podcasts',
          query: { productor: this.$store.state.filter.organisationId, 
                  iabId: this.$store.state.filter.iab ? this.$store.state.filter.iab.id : undefined,
                  rubriquesId: this.rubriqueQueryParam},
        };
    },
    previousAvailable(): boolean {
      return this.index > 0;
    },
    nextAvailable(): boolean {
      return this.index + this.size < this.totalCount;
    },
    transitionName(): string {
      return this.direction > 0 ? 'out-left' : 'out-right';
    }
  },
  watch: {
    emissionId(): void {
      this.reset();
      this.fetchNext();
    },
    organisationId(): void {
      this.reset();
      this.fetchNext();
    },
    filterOrga(): void {
      this.reset();
      this.fetchNext();
    },
    iabId(): void {
      this.reset();
      this.fetchNext();
    },
    rubriqueId(): void {
      this.reset();
      this.fetchNext();
    },
    rubriquageId(): void {
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
      const data = await octopusApi.fetchPodcasts({
        first: this.first,
        size: this.size + 1,
        organisationId: this.organisation,
        emissionId: this.emissionId,
        iabId: this.iabId,
        rubriqueId: this.rubriqueId,
        rubriquageId: this.rubriquageId,
        sort: this.popularSort ? 'POPULARITY' : 'DATE',
      });
      this.loading = false;
      this.loaded = true;
      this.totalCount = data.count;
      if (this.allPodcasts.length + data.result.length < this.totalCount) {
        const nexEl = data.result.pop();
        this.preloadImage(nexEl.imageUrl);
      }
      this.allPodcasts = this.allPodcasts.concat(
        data.result.filter((pod: Podcast|null) => null !== pod)
      );
      if (this.allPodcasts.length <= 3) {
        this.alignLeft = true;
      } else {
        this.alignLeft = false;
      }
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
      if (window.innerWidth <= PHONE_WIDTH) {
        this.size = 10;
        return;
      }
      const width = (this.$el as HTMLElement).offsetWidth;
      const sixteen = domHelper.convertRemToPixels(13.7);
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
      img.src = url;
    },
  },
})
</script>
