<template>
  <div class="page-box">
    <h1 v-if="undefined === titlePage">{{ $t('All emissions') }}</h1>
    <h1 v-else>{{ titlePage }}</h1>
    <ProductorSearch
      v-model:organisationId="organisationId"
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
    />
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
// @ is an alias to /src
import EmissionList from '../display/emission/EmissionList.vue';
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import AdvancedSearch from '../display/filter/AdvancedSearch.vue';
import { state } from '../../store/paramStore.js';

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    ProductorSearch,
    EmissionList,
    AdvancedSearch,
  },

  props: ['isEducation'],

  created() {
    if (this.$route.query.first) {
      this.first = this.$route.query.first;
    } else {
      this.first = 0;
    }
    if (this.$route.query.size) {
      this.size = this.$route.query.size;
    } else {
      this.size = 12;
    }
    if (this.$route.query.productor) {
      this.organisationId = this.$route.query.productor;
    }
  },

  data() {
    return {
      first: undefined as any,
      size: undefined as any,
      searchPattern: '',
      organisationId: undefined as any,
      monetization: undefined as any,
      rubriquageId: undefined as any,
      rubriqueId: undefined as any,
      emissionId: undefined as any,
      fromDate: undefined as any,
      toDate: undefined as any,
      resetRubriquage: false,
      includeHidden: false,
      sortEmission: 'LAST_PODCAST_DESC',
      noRubrique: undefined as any,
    };
  },

  computed: {
    isProductorSearch() {
      return state.podcastsPage.ProductorSearch;
    },
    isMonetizableFilter() {
      return state.podcastsPage.MonetizableFilter;
    },
    titlePage() {
      return state.emissionsPage.titlePage;
    },
  },

  methods: {
    updateHidden(value: boolean) {
      this.includeHidden = value;
    },
    updateSortEmission(value: string) {
      this.sortEmission = value;
    },
    updateToDate(value: any) {
      this.toDate = value;
    },
    updateFromDate(value: any) {
      this.fromDate = value;
    },
    updateRubriquage(value: number) {
      if (-1 !== value) {
        this.rubriquageId = value;
      } else {
        this.rubriquageId = undefined;
      }
      this.noRubrique = undefined;
      this.rubriqueId = undefined;
    },
    updateRubrique(value: number) {
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
    updateOrganisationId(value: any) {
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = undefined;
      this.rubriqueId = undefined;
      this.noRubrique = undefined;
      this.organisationId = value;
    },
    updateSearchPattern(value: string) {
      if ('' !== value) {
        this.sortEmission = 'SCORE';
      } else {
        this.sortEmission = 'LAST_PODCAST_DESC';
      }
      this.searchPattern = value;
    },
    updateMonetization(value: any) {
      this.monetization = value;
    },
  },
});
</script>
