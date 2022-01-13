<template>
  <div class="d-flex flex-column align-items-center">
    <ClassicLoading
      :loading-text="loading?$t('Loading emissions ...'):undefined"
    />
    <template v-if="isLoadingMoreOrFinished">
      <div
        v-if="showCount && emissions.length > 1"
        class="text-secondary mb-2"
      >
        {{ $t('Number emissions', { nb: displayCount }) + sortText }}
      </div>
      <ul
        v-if="!itemPlayer"
        class="emission-list"
        :class="smallItems ? 'three-emissions' : 'two-emissions'"
      >
        <EmissionItem
          v-for="e in emissions"
          :key="e.emissionId"
          :emission="e"
        />
      </ul>
      <div
        v-show="
          (displayRubriquage && rubriques) || !(displayRubriquage)
        "
        v-else
        class="d-flex flex-wrap justify-content-around"
      >
        <EmissionPlayerItem
          v-for="e in emissions"
          :key="e.emissionId"
          :emission="e"
          class="m-3 flex-shrink-0"
          :class="mainRubriquage(e)"
          :rubrique-name="rubriquesId(e)"
          @emissionNotVisible="displayCount--"
        />
      </div>
      <button
        v-show="!allFetched"
        class="btn"
        :class="buttonPlus ? 'btn-link  m-4' : 'btn-more'"
        :disabled="loading"
        :title="$t('See more')"
        @click="fetchContent(false)"
      >
        <template v-if="buttonPlus">
          {{ $t('See more') }}
        </template>
        <div
          :class="buttonPlus?'ms-1':''"
          class="saooti-plus"
        />
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import { state } from '../../../store/paramStore';
import ClassicLoading from '../../form/ClassicLoading.vue';
import { Emission } from '@/store/class/general/emission';
import { Rubrique } from '@/store/class/rubrique/rubrique';
import { defineComponent, defineAsyncComponent } from 'vue';
import { FetchParam } from '@/store/class/general/fetchParam';
const EmissionItem = defineAsyncComponent(() => import('./EmissionItem.vue'));
const EmissionPlayerItem = defineAsyncComponent(() => import('./EmissionPlayerItem.vue'));
export default defineComponent({
  name: 'EmissionList',

  components: {
    EmissionItem,
    EmissionPlayerItem,
    ClassicLoading
  },

  props: {
    first: { default: 0, type: Number },
    size: { default: 12, type: Number },
    query: { default: undefined, type: String},
    iabId: { default: undefined, type: Number },
    organisationId: { default: undefined, type: String},
    monetization: { default: 'UNDEFINED', type: String},
    before: { default: undefined, type: String},
    after: { default: undefined, type: String},
    sort: { default: 'DATE', type: String},
    showCount: { default: false, type: Boolean },
    includeHidden: { default: false, type: Boolean },
    rubriqueId: { default: () => [], type: Array as ()=> Array<number> },
    rubriquageId:{ default: () => [], type: Array as ()=> Array<number> },
    noRubriquageId: { default: () => [], type: Array as ()=> Array<number> },
  },

  data() {
    return {
      loading: true as boolean,
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      displayCount: 0 as number,
      emissions: [] as Array<Emission>,
      rubriques: undefined as Array<Rubrique>|undefined,
    };
  },

  computed: {
    isLoadingMoreOrFinished():boolean{
      return !this.loading || this.emissions.length > 1;
    },
    allFetched(): boolean {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus(): boolean {
      return (state.generalParameters.buttonPlus as boolean);
    },
    smallItems(): boolean {
      return (state.emissionsPage.smallItems as boolean);
    },
    itemPlayer(): boolean {
      return (state.emissionsPage.itemPlayer as boolean);
    },
    displayRubriquage(): number|undefined {
      return state.emissionsPage.rubriquage;
    },
    changed(): string {
      return `${this.first}|${this.size}|${this.organisationId}|${this.query}|${this.monetization}|${this.includeHidden}
      ${this.iabId}|${this.rubriqueId}|${this.rubriquageId}|${this.before}|${this.after}|${this.sort}|${this.noRubriquageId}`;
    },
    sortText(): string {
      switch (this.sort) {
        case 'SCORE':
          return this.$t('sort by score').toString();
        case 'LAST_PODCAST_DESC':
          return this.$t('sort by date').toString();
        case 'NAME':
          return this.$t('sort by alphabetical').toString();
        default:
          return this.$t('sort by date').toString();
      }
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
  },
  watch: {
    changed(): void {
      this.fetchContent(true);
    },
  },

  

  mounted() {
    this.fetchContent(true);
    if (this.displayRubriquage) {
      this.fetchRubriques();
    }
  },
  methods: {
    async fetchContent(reset: boolean): Promise<void> {
      this.loading = true;
      if (reset) {
        this.emissions.length = 0;
        this.dfirst = 0;
      }
      const param: FetchParam = {
        first: this.dfirst,
        size: this.dsize,
        query: this.query,
        organisationId: this.organisation,
        monetisable: this.monetization,
        iabId: this.iabId,
        before: this.before,
        after: this.after,
        sort: this.sort,
        noRubriquageId: this.noRubriquageId.length ? this.noRubriquageId : undefined,
        rubriqueId: this.rubriqueId.length ? this.rubriqueId : undefined,
        rubriquageId: this.rubriquageId.length ? this.rubriquageId : undefined,
        includeHidden:this.includeHidden,
      };
      const data = await octopusApi.fetchEmissions(param);
      this.afterFetching(reset, data);
    },
    afterFetching(reset: boolean, data: {count: number, result: Array<Emission>, sort: string}): void {
      if (reset) {
        this.emissions.length = 0;
        this.dfirst = 0;
      }
      this.loading = false;
      this.displayCount = data.count;
      this.emissions = this.emissions.concat(data.result).filter((e: Emission|null) => {
        if (null === e) {
          this.displayCount--;
        }
        return null !== e;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      this.loading = false;
    },
    async fetchRubriques(): Promise<void> {
      const data = await octopusApi.fetchTopic(this.displayRubriquage);
      this.rubriques = data.rubriques;
    },
    mainRubriquage(emission: Emission): string {
      if (
        emission.rubriqueIds &&
        emission.rubriqueIds[0] === state.emissionsPage.mainRubrique
      )
        return 'partenaireRubrique';
      return '';
    },
    rubriquesId(emission: Emission): string|undefined {
      if (
        !this.displayRubriquage ||
        !emission.rubriqueIds ||
        0 === emission.rubriqueIds.length ||
        !this.rubriques ||
        !this.rubriques.length
      )
        return undefined;
      const rubrique = this.rubriques.find(
        (element: Rubrique) => element.rubriqueId === emission.rubriqueIds[0]
      );
      if(!rubrique){ return undefined; }
      return rubrique.name;
    },
  },
})
</script>

<style lang="scss"></style>