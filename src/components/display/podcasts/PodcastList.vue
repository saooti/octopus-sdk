<template>
  <div class="d-flex flex-column align-items-center">
    <div
      v-if="loading"
      class="d-flex justify-content-center"
    >
      <div class="spinner-border mr-3" />
      <h3 class="mt-2">
        {{ $t('Loading podcasts ...') }}
      </h3>
    </div>
    <div v-if="loaded && !podcasts.length">
      <p>{{ $t('No podcast match your query') }}</p>
    </div>
    <div
      v-if="showCount && loaded && podcasts.length > 1"
      class="text-secondary mb-2"
    >
      {{ $t('Number podcasts', { nb: totalCount }) + sortText }}
    </div>
    <ul
      v-show="loaded"
      class="podcast-list"
    >
      <PodcastItem
        v-for="p in podcasts"
        :key="p.podcastId"
        :podcast="p"
      />
    </ul>
    <button
      v-show="!allFetched && loaded"
      class="btn"
      :class="buttonPlus ? 'btn-linkPlus mt-3' : 'btn-more'"
      :disabled="inFetching"
      :aria-label="$t('See more')"
      @click="displayMore"
    >
      <template v-if="buttonPlus">
        {{ $t('See more') }}
      </template>
      <div class="saooti-plus" />
    </button>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import podcastApi from '@/api/podcasts';
import PodcastItem from './PodcastItem.vue';
import { state } from '../../../store/paramStore';

import { Podcast } from '@/store/class/podcast';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastList',

  components: {
    PodcastItem,
  },

  props: {
    first: { default: 0 as number},
    size: { default: 12 as number },
    organisationId: { default: undefined as string | undefined },
    emissionId: { default: undefined as number | undefined },
    iabId: { default: undefined as number | undefined },
    participantId: { default: undefined as number | undefined },
    query: { default: undefined as string | undefined },
    monetization: { default: undefined as string | undefined },
    popularSort: { default: false as boolean },
    reload: { default: false as boolean },
    before: { default: undefined as string | undefined },
    after: { default: undefined as string | undefined },
    includeHidden: { default: false as boolean},
    showCount: { default: false as boolean },
    sortCriteria: { default: undefined as string | undefined },
    notValid: { default: undefined as boolean | undefined },
    rubriqueId: { default: () => ([]) as Array<number> },
    rubriquageId:{ default: () => ([]) as Array<number> },
    noRubriquageId: { default: () => ([]) as Array<number> },
  },
  emits: ['fetch', 'emptyList'],

  data() {
    return {
      loading: true as boolean,
      loaded: false as boolean,
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      podcasts: [] as Array<Podcast>,
      inFetching: false as boolean,
    };
  },
  
  computed: {
    allFetched(): boolean {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus(): boolean {
      return state.generalParameters.buttonPlus;
    },
    changed(): string {
      return `${this.first}|${this.size}|${this.organisation}|${this.emissionId}|${this.sortCriteria}|${this.sort}
      ${this.iabId}|${this.participantId}|${this.query}|${this.monetization}|${this.popularSort}|
      ${this.rubriqueId}|${this.rubriquageId}|${this.before}|${this.after}|${this.includeHidden}|${this.noRubriquageId}|${this.notValid}`;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
    sort(): string {
      if (this.popularSort) return 'POPULARITY';
      return this.sortCriteria;
    },
    sortText(): string {
      switch (this.sortCriteria) {
        case 'SCORE':
          return this.$t('sort by score').toString();
        case 'DATE':
          return this.$t('sort by date').toString();
        case 'NAME':
          return this.$t('sort by alphabetical').toString();
        default:
          return this.$t('sort by date').toString();
      }
    },
    isProduction(): boolean {
      return state.generalParameters.isProduction;
    },
  },
  watch: {
    changed(): void {
      this.fetchContent(true);
    },
    reload(): void {
      this.fetchContent(true);
    },
  },
  
  created() {
    this.fetchContent(true);
  },
  methods: {
    async fetchContent(reset: boolean): Promise<void> {
      this.inFetching = true;
      if (reset) {
        this.podcasts.length = 0;
        this.dfirst = 0;
        this.loading = true;
        this.loaded = false;
      }
      const param: any = {
        first: this.dfirst,
        size: this.dsize,
        organisationId: this.organisation,
        emissionId: this.emissionId,
        iabId: this.iabId,
        participantId: this.participantId,
        query: this.query,
        monetisable: this.monetization,
        sort: this.sort,
        before: this.before,
        after: this.after,
        noRubriquageId: this.noRubriquageId.length ? this.noRubriquageId : undefined,
        rubriqueId: this.rubriqueId.length ? this.rubriqueId : undefined,
        rubriquageId: this.rubriquageId.length ? this.rubriquageId : undefined,
      };
      if (undefined !== this.notValid) {
        param.validity = !this.notValid;
      }
      if (this.notValid && !this.isProduction) {
        param.publisherId = this.$store.state.profile.userId;
      }
      if (this.includeHidden) {
        param.includeHidden = this.includeHidden;
        const data = await podcastApi.fetchPodcastsAdmin(this.$store.state, param);
        this.afterFetching(reset, data);
      } else {
        const data = await octopusApi.fetchPodcasts(param);
        this.afterFetching(reset, data);
      }
    },
    afterFetching(reset: boolean, data: any): void {
      if (reset) {
        this.podcasts.length = 0;
        this.dfirst = 0;
        this.loading = true;
        this.loaded = false;
      }
      this.loading = false;
      this.loaded = true;
      this.podcasts = this.podcasts.concat(data.result).filter((p: Podcast|null) => {
        return null !== p;
      });
      this.$emit('fetch', this.podcasts);
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      if (0 === this.podcasts.length) {
        this.$emit('emptyList');
      }
      this.inFetching = false;
    },
    displayMore(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.fetchContent(false);
    },
  },
})
</script>
