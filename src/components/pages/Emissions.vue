<template>
  <div class="page-box">
    <h1>{{ titleDisplay }}</h1>
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
      :include-hidden="includeHidden"
      @updateCategory="iabId = $event"
      @updateRubriquageFilter="updateRubriquageFilter"
      @updateMonetization="monetization = $event"
      @updateFromDate="fromDate = $event"
      @updateToDate="toDate = $event"
      @updateSortCriteria="sortEmission = $event"
      @includeHidden="includeHidden = $event"
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
import { orgaComputed } from '../mixins/orgaComputed';
import EmissionList from '../display/emission/EmissionList.vue';
import AdvancedSearch from '../display/filter/AdvancedSearch.vue';
import { state } from '../../store/paramStore';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent, defineAsyncComponent } from 'vue';
const ProductorSearch = defineAsyncComponent(() => import('../display/filter/ProductorSearch.vue'));
export default defineComponent({
  components: {
    ProductorSearch,
    EmissionList,
    AdvancedSearch,
  },
  mixins:[orgaComputed],
  props: {
    productor: { default: undefined, type: String},
    isEducation: { default: false, type: Boolean},
  },

  data() {
    return {
      first: 0 as number,
      size: 30 as number,
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
    titleDisplay(): string{
      return state.emissionsPage.titlePage??this.$t('All emissions');
    },
    isProductorSearch(): boolean{
      return (state.podcastsPage.ProductorSearch as boolean);
    },
    organisationRight(): boolean {
      return (true===this.authenticated && this.myOrganisationId === this.organisationId) ||
        true===state.generalParameters.isAdmin
    },
    organisation(): string|undefined {
      return this.organisationId??this.filterOrga;
    },
  },

  created() {
    this.initComponent();
  },
  methods: {
    initComponent(): void{
      this.iabId =this.$store.state.filter.iab?.id;
      this.organisationId = this.productor?? this.filterOrga;
      if (this.organisation && this.organisationRight) {
        this.includeHidden = true;
      }
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
    updateOrganisationId(value: string | undefined): void {
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = [];
      this.rubriqueId = [];
      this.noRubriquageId = [];
      this.organisationId = value;
    },
    updateSearchPattern(value: string): void {
      this.sortEmission = '' !== value ? 'SCORE' : 'LAST_PODCAST_DESC';
      this.searchPattern = value;
    },
  },
})
</script>