<template>
  <div class="page-box">
    <h1 v-if="titlePage === undefined">{{ $t('All emissions') }}</h1>
    <h1 v-else>{{ titlePage }}</h1>
    <ProductorSearch 
      :organisationId.sync='organisationId' 
      :searchPattern='searchPattern'
      type='emission'
      @updateOrganisationId='updateOrganisationId'
      @updateSearchPattern='updateSearchPattern'
      v-if="isProductorSearch"/>
      <AdvancedSearch 
      :isEducation="isEducation"
      :resetRubriquage='resetRubriquage'
      :isEmission='true'
      :isSearchBar="isProductorSearch"
      :sortCriteria="sortEmission"
      @updateRubriquage='updateRubriquage'
      @updateRubrique='updateRubrique'
      @updateMonetization='updateMonetization' 
      @updateFromDate='updateFromDate'
      @updateToDate='updateToDate'
      @updateSortCriteria='updateSortEmission'
      @includeHidden='updateHidden'
      :organisationId='organisationId'/>
    <EmissionList
      :showCount="true"
      :first="first"
      :size="size"
      :query="searchPattern"
      :organisationId="organisationId"
      :monetization="monetization"
      :rubriqueId='rubriqueId'
      :rubriquageId='rubriquageId'
      :before='toDate'
      :after='fromDate'
      :sort='sortEmission'
      :noRubrique='noRubrique'
      :includeHidden='includeHidden'
    />
  </div>
</template>
<style lang="scss">
</style>
<script>
// @ is an alias to /src
import EmissionList from '../display/emission/EmissionList.vue';
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import AdvancedSearch from '../display/filter/AdvancedSearch.vue';
import {state} from "../../store/paramStore.js";

export default {
  components: {
    ProductorSearch,
    EmissionList,
    AdvancedSearch
  },

  props:["isEducation"],

  created() {
    if (this.$route.query.first) {
      this.$data.first = this.$route.query.first;
    } else {
      this.$data.first = 0;
    }
    if (this.$route.query.size) {
      this.$data.size = this.$route.query.size;
    } else {
      this.$data.size = 12;
    }
    if (this.$route.query.productor) {
      this.$data.organisationId = this.$route.query.productor;
    }
  },

  data() {
    return {
      first: undefined,
      size: undefined,
      searchPattern: '',
      organisationId: undefined,
      monetization: undefined,
      rubriquageId: undefined,
      rubriqueId: undefined,
      emissionId: undefined,
      fromDate: undefined,
      toDate: undefined,
      resetRubriquage: false,
      includeHidden : false,
      sortEmission : 'LAST_PODCAST_DESC',
      noRubrique: true,
    };
  },

  computed:{
    isProductorSearch(){
      return state.podcastsPage.ProductorSearch;
    },
    isMonetizableFilter(){
      return state.podcastsPage.MonetizableFilter;
    },
    titlePage(){
      return state.emissionsPage.titlePage;
    },
  },

  methods:{
    updateHidden(value){
      this.includeHidden = value;
    },
    updateSortEmission(value){
      this.sortEmission = value;
    },
    updateToDate(value){
      this.toDate = value;
    },
    updateFromDate(value){
      this.fromDate = value;
    },
    updateRubriquage(value){
      if(value !== -1){
        this.rubriquageId = value;
        this.noRubrique = false;
      }else{
        this.rubriquageId = undefined;
        this.noRubrique = true;
      }
      this.rubriqueId = undefined;
    },
    updateRubrique(value){
      if(value !== -1){
        this.rubriqueId = value;
        this.noRubrique = false;
      }else{
        this.noRubrique = true;
      }
    },
    updateOrganisationId(value){
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = undefined;
      this.rubriqueId= undefined;
      this.organisationId = value;
    },
    updateSearchPattern(value){
      if(value !== ""){
        this.sortEmission = "SCORE";
      }else{
        this.sortEmission = "LAST_PODCAST_DESC";
      }
      this.searchPattern =value;
    },
    updateMonetization(value){
      this.monetization = value;
    }
  },
};
</script>
