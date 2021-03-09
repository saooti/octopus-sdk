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
import EmissionChooser from '../display/emission/EmissionChooser.vue';

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    PodcastList,
    ProductorSearch,
    EmissionChooser,
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
      this.size = 49;
    }
    if (this.$route.query.productor) {
      this.organisationId = this.$route.query.productor;
    } else if (this.$store.state.filter.organisationId) {
      this.organisationId = this.$store.state.filter.organisationId;
    }
    if (this.organisation && this.organisationRight) {
      this.includeHidden = true;
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
      noRubrique: undefined as any,
      sortCriteria: 'DATE',
      notValid: false,
    };
  },

  computed: {
    authenticated():boolean {
      return state.generalParameters.authenticated;
    },
    myOrganisationId() {
      return state.generalParameters.organisationId;
    },
    organisationRight() {
      if (
        (this.authenticated && this.myOrganisationId === this.organisationId) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    filterOrga():any {
      return this.$store.state.filter.organisationId;
    },
    organisation():any {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
    isProductorSearch() {
      return state.podcastsPage.ProductorSearch;
    },
    titlePage() {
      return state.podcastsPage.titlePage;
    },
    isEmissionChooser() {
      return state.podcastsPage.emissionChooser;
    },
  },

  methods: {
    updateSortCriteria(value: string) {
      this.sortCriteria = value;
    },
    updateHidden(value: boolean) {
      this.includeHidden = value;
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
        this.sortCriteria = 'SCORE';
      } else {
        this.sortCriteria = 'DATE';
      }
      this.searchPattern = value;
    },
    updateMonetization(value: any) {
      this.monetization = value;
    },
    updateNotValid(value: boolean) {
      this.notValid = value;
    },
    emissionSelected(emission: { emissionId: any; }) {
      if (emission && emission.emissionId) {
        this.emissionId = emission.emissionId;
      } else {
        this.emissionId = undefined;
      }
    },
  },
});
</script>
