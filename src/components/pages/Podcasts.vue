<template>
  <div class="page-box">
    <div class="d-flex" :class="isEmissionChooser?'justify-content-between':'justify-content-center'">
      <h1 v-if="undefined === titlePage" class="flex-shrink">{{ $t('All podcasts') }}</h1>
      <h1 v-else class="flex-shrink">{{ titlePage }}</h1>
      <EmissionChooser @selected='emissionSelected' v-if="isEmissionChooser" :defaultanswer="$t('No emission filter')" width='auto' class="ml-3"/>
    </div>
    <ProductorSearch 
      :organisationId='organisationId' 
      :searchPattern='searchPattern'
      @updateOrganisationId='updateOrganisationId'
      @updateSearchPattern='updateSearchPattern'
      v-if="isProductorSearch" />
    <AdvancedSearch 
    :isEducation="isEducation"
    :isEmission='false'
    :resetRubriquage='resetRubriquage'
    :isSearchBar="isProductorSearch"
    :sortCriteria="sortCriteria"
    @updateRubriquage='updateRubriquage'
    @updateRubrique='updateRubrique'
    @updateMonetization='updateMonetization' 
    @updateFromDate='updateFromDate'
    @updateToDate='updateToDate'
    @updateSortCriteria='updateSortCriteria'
    @includeHidden='updateHidden'
    @notValid="updateNotValid"
    :organisationId='organisationId'/>
    <PodcastList 
    :showCount="true"
    :first="first" 
    :size="size" 
    :organisationId='organisationId' 
    :query='searchPattern' 
    :monetization="monetization" 
    :emissionId='emissionId'
    :rubriqueId='rubriqueId'
    :rubriquageId='rubriquageId'
    :before='toDate'
    :after='fromDate'
    :sortCriteria="sortCriteria"
    :includeHidden='includeHidden'
    :noRubrique='noRubrique'
    :notValid="notValid"/>
  </div>
</template>
<style lang="scss">
</style>
<script>
// @ is an alias to /src
import PodcastList from '../display/podcasts/PodcastList.vue';
import {state} from "../../store/paramStore.js";
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import AdvancedSearch from '../display/filter/AdvancedSearch.vue';
import EmissionChooser from '../display/emission/EmissionChooser.vue';

export default {
  components: {
    PodcastList,
    ProductorSearch,
    EmissionChooser,
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
      this.$data.size = 49;
    }
    if (this.$route.query.productor) {
      this.$data.organisationId = this.$route.query.productor;
    } else if (this.$store.state.filter.organisationId) {
      this.$data.organisationId = this.$store.state.filter.organisationId;
    }
    if(this.organisation && this.organisationRight){
			this.includeHidden = true;
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
      noRubrique: undefined,
      sortCriteria : 'DATE',
      notValid: false,
    };
  },

  computed:{
    authenticated(){
      return state.generalParameters.authenticated;
		},
    myOrganisationId(){
      return state.generalParameters.organisationId;
    },
    organisationRight() {
			if ((this.authenticated && this.myOrganisationId === this.organisationId) ||state.generalParameters.isAdmin)
				return true;
      return false;
		},
    filterOrga(){
      return this.$store.state.filter.organisationId;
    },
    organisation(){
      if(this.organisationId)
        return this.organisationId;
      if(this.filterOrga)
        return this.filterOrga;
      return undefined;
		},
    isProductorSearch(){
      return state.podcastsPage.ProductorSearch;
    },
    titlePage(){
      return state.podcastsPage.titlePage;
    },
    isEmissionChooser(){
      return state.podcastsPage.emissionChooser;
    },
  },

  methods:{
    updateSortCriteria(value){
      this.sortCriteria = value;
    },
    updateHidden(value){
      this.includeHidden = value;
    },
    updateToDate(value){
      this.toDate = value;
    },
    updateFromDate(value){
      this.fromDate = value;
    },
    updateRubriquage(value){
      if(-1 !== value){
        this.rubriquageId = value;
      }else{
        this.rubriquageId = undefined;
      }
      this.noRubrique = undefined;
      this.rubriqueId = undefined;
    },
    updateRubrique(value){
      if(-1 === value){
        this.noRubrique = true;
        this.rubriqueId = undefined;
      }else if(0 === value){
        this.rubriqueId = undefined;
        this.noRubrique = undefined;
      }else{
        this.rubriqueId = value;
        this.noRubrique = undefined;
      }
    },
    updateOrganisationId(value){
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = undefined;
      this.rubriqueId= undefined;
      this.noRubrique = undefined;
      this.organisationId = value;
    },
    updateSearchPattern(value){
      if("" !== value){
        this.sortCriteria = "SCORE";
      }else{
        this.sortCriteria = "DATE";
      }
      this.searchPattern =value;
    },
    updateMonetization(value){
      this.monetization = value;
    },
    updateNotValid(value){
      this.notValid = value
    },
    emissionSelected(emission){
      if (emission && emission.emissionId) {
        this.emissionId = emission.emissionId;
      } else {
        this.emissionId = undefined;
      }
    }
  }
};
</script>
