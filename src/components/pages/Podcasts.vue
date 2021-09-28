<template>
  <div class="page-box">
    <div
      class="d-flex"
      :class="
        isEmissionChooser ? 'justify-content-between' : 'justify-content-center'
      "
    >
      <h1 v-if="undefined === titlePage" class="flex-shrink">
        {{ $t('All podcasts') }}
      </h1>
      <h1 v-else class="flex-shrink">{{ titlePage }}</h1>
      <EmissionChooser
        @selected="emissionSelected"
        v-if="isEmissionChooser"
        :defaultanswer="$t('No emission filter')"
        width="auto"
        class="ml-3"
      />
    </div>
    <ProductorSearch
      :organisationId="organisationId"
      :searchPattern="searchPattern"
      @updateOrganisationId="updateOrganisationId"
      @updateSearchPattern="updateSearchPattern"
      v-if="isProductorSearch"
    />
    <AdvancedSearch
      :isEducation="isEducation"
      :isEmission="false"
      :resetRubriquage="resetRubriquage"
      :isSearchBar="isProductorSearch"
      :sortCriteria="sortCriteria"
      @updateCategory="updateCategory"
      @updateRubriquageFilter="updateRubriquageFilter"
      @updateMonetization="updateMonetization"
      @updateFromDate="updateFromDate"
      @updateToDate="updateToDate"
      @updateSortCriteria="updateSortCriteria"
      @includeHidden="updateHidden"
      @notValid="updateNotValid"
      :organisationId="organisationId"
    />
    <PodcastList
      :showCount="true"
      :first="first"
      :size="size"
      :organisationId="organisationId"
      :query="searchPattern"
      :monetization="monetization"
      :emissionId="emissionId"
      :before="toDate"
      :after="fromDate"
      :sortCriteria="sortCriteria"
      :includeHidden="includeHidden"
      :notValid="notValid"
      :iabId="iabId"
      :rubriqueId="rubriqueId"
      :rubriquageId="rubriquageId"
      :noRubriquageId="noRubriquageId"
    />
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
// @ is an alias to /src
import PodcastList from '../display/podcasts/PodcastList.vue';
import { state } from '../../store/paramStore';
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import AdvancedSearch from '../display/filter/AdvancedSearch.vue';

import { Emission } from '@/store/class/emission';
import { Category } from '@/store/class/category';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
export default {
  components: {
    PodcastList,
    ProductorSearch,
    EmissionChooser: () => import('../display/emission/EmissionChooser.vue'),
    AdvancedSearch,
  },
  props: {
    firstRoute: { default: 0 as number},
    sizeRoute: { default: 12 as number},
    productor: { default: undefined as string|undefined},
    isEducation: { default: false as boolean},
  },

  data() {
    return {
      first: 0 as number,
      size: 49 as number,
      searchPattern: '' as string,
      organisationId: undefined as string|undefined,
      monetization: 'UNDEFINED' as string, // UNDEFINED, YES, NO
      emissionId: undefined as number|undefined,
      fromDate: undefined as string|undefined,
      toDate: undefined as string|undefined,
      resetRubriquage: false as boolean,
      includeHidden: false as boolean,
      sortCriteria: 'DATE' as string, // SCORE, DATE, POPULARITY, NAME, LAST_PODCAST_DESC
      notValid: false as boolean,
      iabId: undefined as number | undefined,
      noRubriquageId: [] as Array<number>,
      rubriquageId: [] as Array<number>,
      rubriqueId: [] as Array<number>,
    };
  },

  created() {
    if (this.firstRoute) {
      this.first = this.firstRoute;
    }
    if (this.sizeRoute) {
      this.size = this.sizeRoute;
    }
    if (this.productor) {
      this.organisationId = this.productor;
    } else if (this.$store.state.filter.organisationId) {
      this.organisationId = this.$store.state.filter.organisationId;
    }
    if (this.organisation && this.organisationRight) {
      this.includeHidden = true;
    }
    if(this.categoryFilter){
      this.iabId = this.categoryFilter.id;
    }
    if(this.rubriqueFilter.length){
      this.updateRubriquageFilter(this.rubriqueFilter);
    }
  },
  
  computed: {
    rubriqueFilter(): Array<RubriquageFilter>{
      return this.$store.state.filter.rubriqueFilter;
    },
    categoryFilter(): Category|undefined{
      return this.$store.state.filter.iab;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    myOrganisationId(): string {
      return state.generalParameters.organisationId;
    },
    organisationRight(): boolean {
      if (
        (this.authenticated && this.myOrganisationId === this.organisationId) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    filterOrga(): string|undefined {
      return this.$store.state.filter.organisationId;
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
    isProductorSearch(): boolean {
      return state.podcastsPage.ProductorSearch;
    },
    titlePage(): string|undefined {
      return state.podcastsPage.titlePage;
    },
    isEmissionChooser(): boolean {
      return state.podcastsPage.emissionChooser;
    },
  },
  methods: {
    updateCategory(value: number|undefined){
      this.iabId = value;
    },
    updateSortCriteria(value: string): void {
      this.sortCriteria = value;
    },
    updateHidden(value: boolean): void {
      this.includeHidden = value;
    },
    updateToDate(value: string): void {
      this.toDate = value;
    },
    updateFromDate(value: string): void {
      this.fromDate = value;
    },
    updateRubriquageFilter(value: Array<RubriquageFilter>){
      const length = value.length;
      const allRubriquageId: Array<number>= [];
      const noRubriquageId: Array<number>= [];
      const rubriqueId: Array<number>= [];
      for (let index = 0; index < length; index++) {
        if(-1===value[index].rubriqueId){
          noRubriquageId.push(value[index].rubriquageId);
        } else if(0===value[index].rubriqueId){
          allRubriquageId.push(value[index].rubriquageId);
        }else{
          rubriqueId.push(value[index].rubriqueId);
        }
      }
      this.rubriquageId = allRubriquageId;
      this.rubriqueId = rubriqueId;
      this.noRubriquageId = noRubriquageId;
    },
    updateOrganisationId(value: string): void {
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = [];
      this.rubriqueId = [];
      this.noRubriquageId = [];
      this.organisationId = value;
    },
    updateSearchPattern(value: string): void {
      if ('' !== value) {
        this.sortCriteria = 'SCORE';
      } else {
        this.sortCriteria = 'DATE';
      }
      this.searchPattern = value;
    },
    updateMonetization(value: string): void {
      this.monetization = value;
    },
    updateNotValid(value: boolean): void {
      this.notValid = value;
    },
    emissionSelected(emission: Emission): void {
      if (emission && emission.emissionId) {
        this.emissionId = emission.emissionId;
      } else {
        this.emissionId = undefined;
      }
    },
  },
};
</script>
