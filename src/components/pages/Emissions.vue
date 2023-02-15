<template>
  <div class="page-box">
    <h1>{{ titleDisplay }}</h1>
    <ProductorSearch
      v-if="isProductorSearch"
      v-model:organisationId="organisationId"
      v-model:search-pattern="searchPattern"
      type="emission"
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
      :first="0"
      :size="30"
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
import { state } from '../../stores/ParamSdkStore';
import { useFilterStore } from '@/stores/FilterStore';
import { mapState } from 'pinia';
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
      isInit: false as boolean,
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
    ...mapState(useFilterStore, ['filterIab', 'filterRubrique']),
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
      return this.organisationId?this.organisationId:this.filterOrgaId;
    },
  },
  watch:{
    organisationId(): void {
      if(!this.isInit){return;}
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = [];
      this.rubriqueId = [];
      this.noRubriquageId = [];
    },
    searchPattern(value: string): void {
      this.sortEmission = '' !== value ? 'SCORE' : 'DATE';
    },
  },

  created() {
    this.initComponent();
  },
  methods: {
    initComponent(): void{
      this.iabId =this.filterIab?.id;
      this.organisationId = this.productor ?this.productor: this.filterOrgaId;
      if (this.organisation && this.organisationRight) {
        this.includeHidden = true;
      }
      if(this.filterRubrique.length){
        this.updateRubriquageFilter(this.filterRubrique);
      }
      this.$nextTick(() => {
        this.isInit = true;
      });
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
  },
})
</script>