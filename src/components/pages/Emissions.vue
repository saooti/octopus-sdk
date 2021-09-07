<template>
  <div class="page-box">
    <h1 v-if="undefined === titlePage">{{ $t('All emissions') }}</h1>
    <h1 v-else>{{ titlePage }}</h1>
    <ProductorSearch
      :organisationId.sync="organisationId"
      :searchPattern="searchPattern"
      type="emission"
      @updateOrganisationId="updateOrganisationId"
      @updateSearchPattern="updateSearchPattern"
      v-if="isProductorSearch"
    />
    <AdvancedSearch
      :isEducation="isEducation"
      :resetRubriquage="resetRubriquage"
      :isEmission="true"
      :isSearchBar="isProductorSearch"
      :sortCriteria="sortEmission"
      @updateRubriquage="updateRubriquage"
      @updateRubrique="updateRubrique"
      @updateMonetization="updateMonetization"
      @updateFromDate="updateFromDate"
      @updateToDate="updateToDate"
      @updateSortCriteria="updateSortEmission"
      @includeHidden="updateHidden"
      :organisationId="organisationId"
    />
    <EmissionList
      :showCount="true"
      :first="first"
      :size="size"
      :query="searchPattern"
      :organisationId="organisationId"
      :monetization="monetization"
      :rubriqueId="rubriqueId"
      :rubriquageId="rubriquageId"
      :before="toDate"
      :after="fromDate"
      :sort="sortEmission"
      :noRubrique="noRubrique"
      :includeHidden="includeHidden"
      :iabId="categoryFilter?categoryFilter.id:undefined"
    />
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
// @ is an alias to /src
import EmissionList from '../display/emission/EmissionList.vue';
import AdvancedSearch from '../display/filter/AdvancedSearch.vue';
import { state } from '../../store/paramStore';

import Vue from 'vue';
import { Category } from '@/store/class/category';
export default Vue.extend({
  components: {
    ProductorSearch: () => import('../display/filter/ProductorSearch.vue'),
    EmissionList,
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
      size: 12 as number,
      searchPattern: '' as string,
      organisationId: undefined as string | undefined,
      monetization: 'UNDEFINED' as string, // UNDEFINED, YES, NO
      rubriquageId: undefined as number | undefined,
      rubriqueId: undefined as number | undefined,
      emissionId: undefined as number | undefined,
      fromDate: undefined as string | undefined,
      toDate: undefined as string | undefined,
      resetRubriquage: false as boolean,
      includeHidden: false as boolean,
      sortEmission: 'LAST_PODCAST_DESC' as string, //  SCORE, DATE, POPULARITY, NAME, LAST_PODCAST_DESC
      noRubrique: undefined as boolean | undefined,
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
  },
  
  computed: {
    categoryFilter(): Category|undefined{
      return this.$store.state.filter.iab;
    },
    isProductorSearch(): boolean {
      return state.podcastsPage.ProductorSearch;
    },
    isMonetizableFilter(): boolean {
      return state.podcastsPage.MonetizableFilter;
    },
    titlePage(): string|undefined {
      return state.emissionsPage.titlePage;
    },
  },
  methods: {
    updateHidden(value: boolean): void {
      this.includeHidden = value;
    },
    updateSortEmission(value: string): void {
      this.sortEmission = value;
    },
    updateToDate(value: string): void {
      this.toDate = value;
    },
    updateFromDate(value: string): void {
      this.fromDate = value;
    },
    updateRubriquage(value: number): void {
      if (-1 !== value) {
        this.rubriquageId = value;
      } else {
        this.rubriquageId = undefined;
      }
      this.noRubrique = undefined;
      this.rubriqueId = undefined;
    },
    updateRubrique(value: number): void {
      if (-1 === value) {
        this.noRubrique = true;
        this.rubriqueId = undefined;
      } else if (0 === value) {
        this.rubriqueId = undefined;
        this.noRubrique = undefined;
      } else {
        this.rubriqueId = value;
        this.noRubrique = undefined;
      }
    },
    updateOrganisationId(value: string | undefined): void {
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = undefined;
      this.rubriqueId = undefined;
      this.noRubrique = undefined;
      this.organisationId = value;
    },
    updateSearchPattern(value: string): void {
      if ('' !== value) {
        this.sortEmission = 'SCORE';
      } else {
        this.sortEmission = 'LAST_PODCAST_DESC';
      }
      this.searchPattern = value;
    },
    updateMonetization(value: string): void {
      this.monetization = value;
    },
  },
});
</script>
