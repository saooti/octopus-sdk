<template>
  <div class="d-flex flex-column align-items-center">
    <div
      v-if="loading"
      class="d-flex justify-content-center"
    >
      <div class="spinner-border mr-3" />
      <h3 class="mt-2">
        {{ $t('Loading emissions ...') }}
      </h3>
    </div>
    <div
      v-if="showCount && loaded && emissions.length > 1"
      class="text-secondary mb-2"
    >
      {{ $t('Number emissions', { nb: displayCount }) + sortText }}
    </div>
    <ul
      v-if="!itemPlayer"
      class="emission-list"
      :class="smallItems ? 'threeEmissions' : 'twoEmissions'"
    >
      <EmissionItem
        v-for="e in emissions"
        :key="e.emissionId"
        :emission="e"
      />
    </ul>
    <ul
      v-show="
        (displayRubriquage && rubriques) || !(displayRubriquage && loaded)
      "
      v-else
      class="d-flex flex-wrap justify-content-around"
    >
      <EmissionPlayerItem
        v-for="e in emissions"
        :key="e.emissionId"
        :emission="e"
        class="m-3 flex-shrink"
        :class="mainRubriquage(e)"
        :rubrique-name="rubriquesId(e)"
        @emissionNotVisible="displayCount--"
      />
    </ul>
    <button
      v-show="!allFetched && loaded"
      class="btn"
      :class="buttonPlus ? 'btn-linkPlus' : 'btn-more'"
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
import emissionApi from '@/api/emissions';
import { state } from '../../../store/paramStore';

import { Emission } from '@/store/class/emission';
import { Rubrique } from '@/store/class/rubrique';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'EmissionList',

  components: {
    EmissionItem: () => import('./EmissionItem.vue'),
    EmissionPlayerItem: () => import('./EmissionPlayerItem.vue'),
  },

  props: {
    first: { default: 0 as number },
    size: { default: 12 as number },
    query: { default: undefined as string|undefined },
    iabId: { default: undefined as number | undefined },
    organisationId: { default: undefined as string|undefined },
    monetization: { default: 'UNDEFINED' as string },
    before: { default: undefined as string|undefined },
    after: { default: undefined as string|undefined },
    sort: { default: 'DATE' as string },
    showCount: { default: false as boolean },
    includeHidden: { default: false as boolean },
    rubriqueId: { default: () => ([]) as Array<number> },
    rubriquageId:{ default: () => ([]) as Array<number> },
    noRubriquageId: { default: () => ([]) as Array<number> },
  },

  data() {
    return {
      loading: true as boolean,
      loaded: false as boolean,
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      displayCount: 0 as number,
      emissions: [] as Array<Emission>,
      rubriques: undefined as Array<Rubrique>|undefined,
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
    smallItems(): boolean {
      return state.emissionsPage.smallItems;
    },
    itemPlayer(): boolean {
      return state.emissionsPage.itemPlayer;
    },
    displayRubriquage(): boolean {
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
      this.inFetching = true;
      if (reset) {
        this.emissions.length = 0;
        this.dfirst = 0;
        this.loading = true;
        this.loaded = false;
      }
      const param: any = {
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
      };
      if (this.includeHidden) {
        param.includeHidden = this.includeHidden;
        const data = await emissionApi.fetchEmissionsAdmin(this.$store.state, param);
        this.afterFetching(reset, data);
      } else {
        const data = await octopusApi.fetchEmissions(param);
        this.afterFetching(reset, data);
      }
    },
    afterFetching(reset: boolean, data: any): void {
      if (reset) {
        this.emissions.length = 0;
        this.dfirst = 0;
      }
      this.loading = false;
      this.loaded = true;
      this.displayCount = data.count;
      this.emissions = this.emissions.concat(data.result).filter((e: Emission|null) => {
        if (null === e) {
          this.displayCount--;
        }
        return null !== e;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      this.inFetching = false;
    },
    displayMore(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.fetchContent(false);
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
      return rubrique!.name;
    },
  },
})
</script>
