<template>
  <ListPaginate
    id="podcastListPaginate"
    v-model:first="dfirst"
    v-model:rowsPerPage="dsize"
    v-model:isMobile="isMobile"
    :text-count="showCount && podcasts.length > 1 ? $t('Number podcasts', { nb: totalCount }) + sortText : undefined"
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading?$t('Loading podcasts ...'):undefined"
    :error-text="!loading && !podcasts.length?$t(`No podcast match your query`):undefined"
  >
    <template #list>
      <ul
        class="podcast-list"
      >
        <template
          v-for="p in displayArray"
          :key="p.podcastId"
        >
          <PodcastItem
            v-if="-1!==p.podcastId"
            :podcast="p"
          />
        </template>
      </ul>
    </template>
  </ListPaginate>
</template>

<script lang="ts">
import ListPaginate from '../list/ListPaginate.vue';
import { handle403 } from '../../mixins/handle403';
import octopusApi from '@saooti/octopus-api';
import PodcastItem from './PodcastItem.vue';
import { state } from '../../../store/paramStore';
import { Podcast } from '@/store/class/general/podcast';
import { defineComponent } from 'vue'
import { FetchParam } from '@/store/class/general/fetchParam';
import { AxiosError } from 'axios';
import { emptyPodcastData } from '@/store/typeAppStore';
export default defineComponent({
  name: 'PodcastList',

  components: {
    PodcastItem,
    ListPaginate
  },

  mixins: [handle403],

  props: {
    first: { default: 0, type: Number},
    size: { default: 30, type: Number},
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
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      podcasts: [] as Array<Podcast>,
      isMobile: false as boolean,
    };
  },

  computed: {
    displayArray(): Array<Podcast>{
      if(this.isMobile){
        return this.podcasts;
      }
      return this.podcasts.slice(this.dfirst, Math.min(this.dfirst + this.dsize,this.totalCount));
		},
    changed(): string {
      return `${this.first}|${this.size}|${this.organisation}|${this.emissionId}|${this.sortCriteria}|${this.sort}
      ${this.iabId}|${this.participantId}|${this.query}|${this.monetization}|${this.popularSort}|
      ${this.rubriqueId}|${this.rubriquageId}|${this.before}|${this.after}|${this.includeHidden}|${this.noRubriquageId}|${this.notValid}`;
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.$store.state.filter.organisationId) return this.$store.state.filter.organisationId;
      return undefined;
    },
    sort(): string {
      if (this.popularSort) return "POPULARITY";
      if (this.sortCriteria) return this.sortCriteria;
      return 'DATE';
    },
    sortText(): string {
      switch (this.sortCriteria) {
        case 'SCORE':return " "+this.$t('sort by score');
        case 'DATE':return " "+this.$t('sort by date');
        case 'NAME':return " "+this.$t('sort by alphabetical');
        default:return " "+this.$t('sort by date');
      }
    },
  },
  watch: {
    changed(): void {
      this.reloadList();
    },
    reload(): void {
      this.reloadList();
    },
    dsize():void{
      this.reloadList();
		},
		dfirst(): void{
			if(!this.podcasts[this.dfirst] || -1===this.podcasts[this.dfirst].podcastId){
				this.fetchContent(false);
			}
		},
  },
  async created() {
    await this.fetchContent(true);
  },
  methods: {
    reloadList(){
      this.dfirst = 0;
      this.fetchContent(true);
    },
    async fetchContent(reset: boolean): Promise<void> {
      this.loading = true;
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
      if (this.notValid && !(state.generalParameters.isProduction as boolean)) {
        param.publisherId = this.$store.state.profile.userId;
      }
      try {
        const data = await octopusApi.fetchPodcasts(param);
        this.afterFetching(reset, data);
      } catch (error) {
        this.handle403((error as AxiosError));
      }
    },
    afterFetching(reset: boolean, data:  {count: number, result: Array<Podcast>, sort: string}): void {
      if (reset) {
        this.podcasts.length = 0;
      }
      if(this.dfirst > this.podcasts.length){
        for (let i = this.podcasts.length-1, len = this.dfirst + this.dsize; i < len; i++) {
          this.podcasts.push(emptyPodcastData());
        }
      }
      const responsePodcasts= data.result.filter((p: Podcast|null) => {
        return null !== p;
      });
      this.podcasts = this.podcasts.slice(0, this.dfirst).concat(responsePodcasts).concat(this.podcasts.slice(this.dfirst+this.dsize, this.podcasts.length));
      this.$emit('fetch', this.podcasts);
      this.totalCount = data.count;
      if (0 === this.podcasts.length) {
        this.$emit('emptyList');
      }
      this.loading = false;
    },
  },
})
</script>