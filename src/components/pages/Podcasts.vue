<template>
  <div class="page-box">
    <div
      class="d-flex"
      :class="
        pageParameters.isEmissionChooser ? 'justify-content-between' : 'justify-content-center'
      "
    >
      <h1 class="flex-shrink-0">
        {{ titleDisplay }}
      </h1>
      <EmissionChooser
        v-if="pageParameters.isEmissionChooser"
        :defaultanswer="$t('No emission filter')"
        width="auto"
        class="ms-3"
        @selected="emissionSelected"
      />
    </div>
    <ProductorSearch
      v-if="pageParameters.isProductorSearch"
      :organisation-id="organisationId"
      :search-pattern="searchPattern"
      @updateOrganisationId="updateOrganisationId"
      @updateSearchPattern="updateSearchPattern"
    />
    <AdvancedSearch
      :is-education="isEducation"
      :is-emission="false"
      :reset-rubriquage="resetRubriquage"
      :is-search-bar="pageParameters.isProductorSearch"
      :sort-criteria="sortCriteria"
      :include-hidden="includeHidden"
      :organisation-id="organisationId"
      @updateCategory="iabId=$event"
      @updateRubriquageFilter="updateRubriquageFilter"
      @updateMonetization="monetization = $event"
      @updateFromDate="fromDate = $event"
      @updateToDate="toDate = $event"
      @updateSortCriteria="sortCriteria=$event"
      @includeHidden="includeHidden = $event"
      @notValid="notValid = $event"
    />
    <PodcastList
      :show-count="true"
      :first="first"
      :size="size"
      :organisation-id="organisationId"
      :query="searchPattern"
      :monetization="monetization"
      :emission-id="emissionId"
      :before="toDate"
      :after="fromDate"
      :sort-criteria="sortCriteria"
      :include-hidden="includeHidden"
      :not-valid="notValid"
      :iab-id="iabId"
      :rubrique-id="rubriqueId"
      :rubriquage-id="rubriquageId"
      :no-rubriquage-id="noRubriquageId"
    />
  </div>
</template>

<script lang="ts">
import { orgaComputed } from '../mixins/orgaComputed';
import PodcastList from '../display/podcasts/PodcastList.vue';
import { state } from '../../store/paramStore';
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import AdvancedSearch from '../display/filter/AdvancedSearch.vue';
import { Emission } from '@/store/class/general/emission';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';

import { defineComponent, defineAsyncComponent } from 'vue';
const EmissionChooser = defineAsyncComponent(() => import('../display/emission/EmissionChooser.vue'));
export default defineComponent({
  name:"Podcasts",
  components: {
    PodcastList,
    ProductorSearch,
    EmissionChooser,
    AdvancedSearch,
  },
  mixins:[orgaComputed],
  props: {
    productor: { default: undefined, type: String},
    isEducation: { default: false, type: Boolean},
    searchInit: { default: "", type: String}
  },
  data() {
    return {
      first: 0 as number,
      size: 30 as number,
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

  computed: {
    titleDisplay(): string{
      return state.podcastsPage.titlePage ?? this.$t('All podcasts');
    },
    organisationRight(): boolean {
      return (true===this.authenticated && this.myOrganisationId === this.organisationId) ||
        true===state.generalParameters.isAdmin;
    },
    organisation(): string|undefined {
      return this.organisationId ?this.organisationId: this.filterOrga;
    },
    pageParameters(){
      return {
        isProductorSearch: state.podcastsPage.ProductorSearch,
        isEmissionChooser: state.podcastsPage.emissionChooser
      }
    }
  },

  created() {
    this.initPodcastsPage();
  },
  
  methods: {
    initPodcastsPage(){
      this.searchPattern = this.searchInit ?? '';
      this.organisationId = this.productor ?this.productor: this.filterOrga;
      this.includeHidden = this.organisation && this.organisationRight ? true : false;
      this.iabId =this.$store.state.filter.iab?.id;
      if(this.$store.state.filter.rubriqueFilter.length){
        this.updateRubriquageFilter(this.$store.state.filter.rubriqueFilter);
      }
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
      this.sortCriteria = '' !== value ? 'SCORE' : 'DATE';
      this.searchPattern = value;
    },
    emissionSelected(emission: Emission): void {
      this.emissionId = emission && emission.emissionId ? emission.emissionId : undefined;
    },
  },
})
</script>