<template>
  <div class="d-flex flex-column align-items-center">
    <ClassicLoading
      :loading-text="loading?$t('Loading podcasts ...'):undefined"
      :error-text="loaded && !podcasts.length?$t(`No podcast match your query`):undefined"
    />
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
      :class="buttonPlus ? 'btn-link' : 'btn-more'"
      :disabled="inFetching"
      :title="$t('See more')"
      @click="displayMore"
    >
      <template v-if="buttonPlus">
        {{ $t('See more') }}
      </template>
      <div
        :class="buttonPlus?'ms-1':''"
        class="saooti-plus"
      />
    </button>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import PodcastItem from './PodcastItem.vue';
import { state } from '../../../store/paramStore';
import ClassicLoading from '../../form/ClassicLoading.vue';
import { Podcast } from '@/store/class/general/podcast';
import { defineComponent } from 'vue'
import { FetchParam } from '@/store/class/general/fetchParam';
export default defineComponent({
  name: 'PodcastList',

  components: {
    PodcastItem,
    ClassicLoading
  },

  props: {
    first: { default: 0, type: Number},
    size: { default: 12, type: Number},
    organisationId: { default: undefined, type: String},
    emissionId: { default: undefined, type: Number},
    iabId: { default: undefined, type: Number},
    participantId: { default: undefined, type: Number},
    query: { default: undefined, type: String},
    monetization: { default: undefined, type: String},
    popularSort: { default: false, type: Boolean},
    reload: { default: false, type: Boolean},
    before: { default: undefined, type: String},
    after: { default: undefined, type: String},
    includeHidden: { default: false, type: Boolean},
    showCount: { default: false, type: Boolean },
    sortCriteria: { default: undefined, type: String},
    notValid: { default: undefined , type: Boolean},
    rubriqueId: { default: () => [], type: Array as ()=>Array<number> },
    rubriquageId:{ default: () => [], type: Array as ()=>Array<number> },
    noRubriquageId: { default: () => [], type: Array as ()=>Array<number> },
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
      return (state.generalParameters.buttonPlus as boolean);
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
      if (this.popularSort) return "POPULARITY";
      if (this.sortCriteria) return this.sortCriteria;
      return 'DATE';
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
      return (state.generalParameters.isProduction as boolean);
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
      const param: FetchParam = {
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
        includeHidden: this.includeHidden
      };
      if (undefined !== this.notValid) {
        param.validity = !this.notValid;
      }
      if (this.notValid && !this.isProduction) {
        param.publisherId = this.$store.state.profile.userId;
      }
      const data = await octopusApi.fetchPodcasts(param);
      this.afterFetching(reset, data);
    },
    afterFetching(reset: boolean, data:  {count: number, result: Array<Podcast>, sort: string}): void {
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

<style lang="scss"></style>