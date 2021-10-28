<template>
  <div class="page-box">
    <h1 v-if="undefined === titlePage">
      {{ $t('All emissions') }}
    </h1>
    <h1 v-else>
      {{ titlePage }}
    </h1>
    <ProductorSearch
      v-if="isProductorSearch"
      v-model:organisationId="organisationId"
      :search-pattern="searchPattern"
      type="emission"
      @updateOrganisationId="updateOrganisationId"
      @updateSearchPattern="updateSearchPattern"
    />
    <AdvancedSearch
      :is-education="isEducation"
      :reset-rubriquage="resetRubriquage"
      :is-emission="true"
      :is-search-bar="isProductorSearch"
      :sort-criteria="sortEmission"
      :organisation-id="organisationId"
      @updateCategory="updateCategory"
      @updateRubriquageFilter="updateRubriquageFilter"
      @updateMonetization="updateMonetization"
      @updateFromDate="updateFromDate"
      @updateToDate="updateToDate"
      @updateSortCriteria="updateSortEmission"
      @includeHidden="updateHidden"
    />
    <EmissionList
      :show-count="true"
      :first="first"
      :size="size"
      :query="searchPattern"
      :organisation-id="organisationId"
      :monetization="monetization"
      :before="toDate"
      :after="fromDate"
      :sort="sortEmission"
      :include-hidden="includeHidden"
      :iab-id="iabId"

      :rubrique-id="rubriqueId"
      :rubriquage-id="rubriquageId"
      :no-rubriquage-id="noRubriquageId"
    />
  </div>
</template>

<script lang="ts">
import EmissionList from '../display/emission/EmissionList.vue';
import AdvancedSearch from '../display/filter/AdvancedSearch.vue';
import { state } from '../../store/paramStore';

import { Category } from '@/store/class/category';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
import { defineComponent, defineAsyncComponent } from 'vue';
const ProductorSearch = defineAsyncComponent(() => import('../display/filter/ProductorSearch.vue'));
export default defineComponent({
  components: {
    ProductorSearch,
    EmissionList,
    AdvancedSearch,
  },
  props: {
    firstRoute: { default: 0, type: Number},
    sizeRoute: { default: 12, type: Number},
    productor: { default: undefined, type: String},
    isEducation: { default: false, type: Boolean},
  },

  data() {
    return {
      first: 0 as number,
      size: 12 as number,
      searchPattern: '' as string,
      organisationId: undefined as string | undefined,
      monetization: 'UNDEFINED' as string, // UNDEFINED, YES, NO
      emissionId: undefined as number | undefined,
      iabId: undefined as number | undefined,
      fromDate: undefined as string | undefined,
      toDate: undefined as string | undefined,
      resetRubriquage: false as boolean,
      includeHidden: false as boolean,
      sortEmission: 'LAST_PODCAST_DESC' as string, //  SCORE, DATE, POPULARITY, NAME, LAST_PODCAST_DESC
      noRubriquageId: [] as Array<number>,
      rubriquageId: [] as Array<number>,
      rubriqueId: [] as Array<number>,
    };
  },
  
  computed: {
    rubriqueFilter(): Array<RubriquageFilter>{
      return this.$store.state.filter.rubriqueFilter;
    },
    categoryFilter(): Category|undefined{
      return this.$store.state.filter.iab;
    },
    isProductorSearch(): boolean {
      return (state.podcastsPage.ProductorSearch as boolean);
    },
    isMonetizableFilter(): boolean {
      return (state.podcastsPage.MonetizableFilter as boolean);
    },
    titlePage(): string|undefined {
      return state.emissionsPage.titlePage;
    },
  },

  created() {
    if (this.firstRoute) {
      this.first = this.firstRoute;
    }
    if (this.sizeRoute) {
      this.size = this.sizeRoute;
    }
    if(this.categoryFilter){
      this.iabId = this.categoryFilter.id;
    }
    if (this.productor) {
      this.organisationId = this.productor;
    } else if (this.$store.state.filter.organisationId) {
      this.organisationId = this.$store.state.filter.organisationId;
    }
    if(this.rubriqueFilter.length){
      this.updateRubriquageFilter(this.rubriqueFilter);
    }
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
    updateCategory(value: number|undefined){
      this.iabId = value;
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
    updateOrganisationId(value: string | undefined): void {
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = [];
      this.rubriqueId = [];
      this.noRubriquageId = [];
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
})
</script>

<style lang="scss"></style>