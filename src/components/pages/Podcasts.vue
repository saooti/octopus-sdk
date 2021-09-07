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
      @updateRubriquage="updateRubriquage"
      @updateRubrique="updateRubrique"
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
      :rubriqueId="rubriqueId"
      :rubriquageId="rubriquageId"
      :before="toDate"
      :after="fromDate"
      :sortCriteria="sortCriteria"
      :includeHidden="includeHidden"
      :noRubrique="noRubrique"
      :notValid="notValid"
      :iabId="categoryFilter?categoryFilter.id:undefined"
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

import Vue from 'vue';
import { Emission } from '@/store/class/emission';
import { Category } from '@/store/class/category';
export default Vue.extend({
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
      rubriquageId: undefined as number|undefined,
      rubriqueId: undefined as number|undefined,
      emissionId: undefined as number|undefined,
      fromDate: undefined as string|undefined,
      toDate: undefined as string|undefined,
      resetRubriquage: false as boolean,
      includeHidden: false as boolean,
      noRubrique: undefined as boolean|undefined,
      sortCriteria: 'DATE' as string, // SCORE, DATE, POPULARITY, NAME, LAST_PODCAST_DESC
      notValid: false as boolean,
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
  },
  
  computed: {
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
    updateOrganisationId(value: string): void {
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = undefined;
      this.rubriqueId = undefined;
      this.noRubrique = undefined;
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
});
</script>
