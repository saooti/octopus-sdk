<template>
<div>
	<div class="d-flex justify-content-center mb-3" @click="showFilters = !showFilters">
		<div class="text-secondary c-hand">{{$t('Advanced filters')}}</div>
		<div class="text-secondary c-hand align-self-center large-font-size" :class="{'arrow-transform':showFilters}">
			<div class="saooti-arrow_down saooti-arrow_down-margin"></div>
		</div>
	</div>
  <div class="advanced-search-container" v-show="showFilters" >
		<div class="d-flex flex-column">
			<div class="primary-color mb-2">{{$t('Filter')}}</div>
			<MonetizableFilter @updateMonetization='updateMonetization' :isEducation="isEducation" :isEmission='isEmission' v-if="isMonetizableFilter"/>
			<div class="d-flex mt-3 align-items-center" v-if="organisationId && rubriquageDisplay">
				<div class="checkbox-saooti flex-shrink">  
					<input type="checkbox" class="custom-control-input" id="search-rubriquage-checkbox" v-model="isRubriquage">  
					<label class="custom-control-label" for="search-rubriquage-checkbox">{{ $t('By topic') }}</label>  
				</div>
				<template v-if="isRubriquage">
					<label class="wrap">
						<select class="basic-select ml-2 mb-0 border c-hand" v-model="rubriquageId" @change="onRubriquageSelected">
							<option :value="-1" class="primary-dark">{{$t('Without topic')}}</option>
							<option 
								v-for="rubriquage in rubriquageData" 
								v-show="0 !== rubriquage.rubriques.length"
								:key="rubriquage.rubriquageId" 
								:value="rubriquage.rubriquageId"
							>{{rubriquage.title}}</option>
						</select>
						<div class="saooti-arrow_down octopus-arrow-down-2 classic-select"></div>
					</label>
					<template v-if="rubriquageId && -1 !== rubriquageId">
						<div class="ml-3 flex-shrink">{{$t('By rubric')}}</div>
						<RubriqueChooser 
							class="ml-2"
							:multiple='false' 
							:rubriquageId='rubriquageId' 
							:allRubriques='getRubriques(rubriquageId)' 
							:defaultanswer='$t("No rubric filter")'
							:reset='reset'
							:withoutRubrique='true'
							width='auto'
							@selected="onRubriqueSelected"		
						/>
					</template>
				</template>
			</div>
			<div class="d-flex mt-3 align-items-center flex-wrap">
				<div class="mr-2" v-if="isEmission">{{$t('Emission with episode published :')}}</div>
				<div class="d-flex align-items-center">
					<div class="checkbox-saooti flex-shrink">  
						<input type="checkbox" class="custom-control-input" id="search-from-checkbox" v-model="isFrom">  
						<label class="custom-control-label" for="search-from-checkbox">{{ $t('From the :') }}</label>  
					</div>
					<Datetime
						type="datetime"
						moment-locale="fr"
						v-model="fromDate"
						class="theme-saooti pl-3 pr-3"
						@input="updateFromDate"
						input-format="D/MM/YYYY [à] HH[h]mm"
						:i18n="lang"
					/>
				</div>
				<div class="d-flex align-items-center">
					<div class="checkbox-saooti flex-shrink">  
						<input type="checkbox" class="custom-control-input" id="search-to-checkbox" v-model="isTo">  
						<label class="custom-control-label" for="search-to-checkbox">{{ $t('To the :') }}</label>  
					</div>
					<Datetime
						type="datetime"
						moment-locale="fr"
						v-model="toDate"
						class="theme-saooti pl-3"
						@input="updateToDate"
						input-format="D/MM/YYYY [à] HH[h]mm"
						:i18n="lang"
					/>
				</div>
			</div>
			<div class="d-flex flex-column mt-3" v-if="organisation && organisationRight && !isPodcastmaker">
				<div class="checkbox-saooti flex-shrink">  
					<input type="checkbox" class="custom-control-input" id="search-future-checkbox" v-model="isNotVisible" :disabled="isCheckboxNotValidate && isNotValidate">  
					<label class="custom-control-label" for="search-future-checkbox">{{ textNotVisible }}</label>  
				</div>
			</div>
			<div class="d-flex flex-column mt-3" v-if="isCheckboxNotValidate">
				<div class="checkbox-saooti flex-shrink">  
					<input type="checkbox" class="custom-control-input" id="search-not-validate-checkbox" v-model="isNotValidate">  
					<label class="custom-control-label" for="search-not-validate-checkbox">{{ textNotValidate }}</label>  
				</div>
			</div>
		</div>
		<div class="d-flex flex-column">
			<div class="primary-color mb-2 padding-left-custom-radio">{{$t('Sort')}}</div>
			<b-form-group>
				<b-form-radio-group v-model="sort" class="d-flex flex-column">
					<b-form-radio value="SCORE" v-if="isSearchBar">{{$t('Sort score')}}</b-form-radio>
					<b-form-radio value="LAST_PODCAST_DESC" v-if="isEmission">{{$t('Sort last')}}</b-form-radio>
					<b-form-radio value="DATE" v-else>{{$t('Sort last')}}</b-form-radio>
					<b-form-radio value="NAME">{{$t('Sort name')}}</b-form-radio>
				</b-form-radio-group>
			</b-form-group>
		</div>
  </div>
</div>
</template>
<style lang="scss">
/* input {
    border: 0.1rem solid #dee2e6;
    border-radius: 0.3rem;
    padding: 0.5rem;
} */
.saooti-arrow_down-margin {
	margin: 3px 0 0;
}
.padding-left-custom-radio{
	padding-left: 1.5rem;
	@media (max-width: 720px) {
		padding-left: 0;
		margin-top: 1rem;
	}
}
.large-font-size{
  font-size: 1.3rem;
}
.arrow-transform{
  transform: rotate(180deg);
}
.advanced-search-container{
  background: #fff;
  border-radius: 0.8rem;
  display: flex;
  width: 100%;
  padding: 1rem 2rem;
  margin-bottom: 1rem;
	justify-content: space-around;
	@media (max-width: 720px) {
		flex-wrap: wrap;
		justify-content: flex-start;
	}
  .checkbox-saooti .custom-control-label::after {
    top: 0.22rem;
}
  .checkbox-saooti .custom-control-label::before {
    top: 0.22rem;
}

@media (max-width: 450px) {
	flex-direction: column;
  .vdatetime {
    padding: 0.5em 0 !important;
	width: 100%;
	input {
		width: 100%;
	}
}

  .checkbox-saooti {
	margin-left: 0rem !important;
}
    padding: 1rem;
	.basic-select {	  
		width: 100%;
		margin: 0 !important;
  }

  label.wrap {
	width: 100%;
    margin: 0.5em 0;
	position: relative;
  }
  }

  @media (min-width: 401px) {
	label.wrap { 
		position: relative;
		margin:0;
	}
  }
	input:not([id*='rubriqueChooser']){
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.2em 0.5em;
	}
	select{       
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
}

</style>
<script>
// @ is an alias to /src

import MonetizableFilter from './MonetizableFilter.vue';
import RubriqueChooser from '../rubriques/RubriqueChooser.vue';
import { Datetime } from 'vue-datetime';
import {state} from "../../../store/paramStore.js";
import octopusApi from "@saooti/octopus-api";
const moment = require('moment');
 
export default {
  components: {
		MonetizableFilter,
		RubriqueChooser,
		Datetime
	},
	
	props: ['organisationId', 'isEmission', 'resetRubriquage', 'isSearchBar', 'sortCriteria', 'isEducation', 'includeHidden'],

  created() {
		this.fetchTopics();
		if(!this.isEmission){
			this.isNotVisible = this.includeHidden;
		}
	},
	
	mounted(){
		this.sort = this.sortCriteria;
	},

  data() {
    return {
			isRubriquage:false,
			rubriquageId : undefined,
			rubriqueId : undefined,
			rubriquageData: [],
			isFrom: false,
			isTo: false,
			lang: {
        ok: this.$t('Validate'),
        cancel: this.$t('Cancel'),
			},
			fromDate: moment().subtract(10, "days").toISOString(),
			toDate: moment().toISOString(),
			isNotVisible: false,
			isNotValidate:false,
			showFilters : false,
			reset: false,
			sort: '',
    };
  },

  computed:{
    isMonetizableFilter(){
      return state.podcastsPage.MonetizableFilter;
		},
		rubriquageDisplay(){
			if(0 === this.rubriquageData.length)
				return false;
			let found = false;
			for (let index = 0; index < this.rubriquageData.length; index++) {
				if(0 !== this.rubriquageData[index].rubriques.length){
					found = true;
					break;
				}
			}
			return found;
		},
		myOrganisationId(){
      return state.generalParameters.organisationId;
    },
    authenticated(){
      return state.generalParameters.authenticated;
		},
		isProduction(){
			return state.generalParameters.isProduction;
		},
		isContribution(){
			return state.generalParameters.isContribution;
		},
		organisationRight() {
			if ((this.authenticated && this.myOrganisationId === this.organisationId) ||state.generalParameters.isAdmin)
				return true;
      return false;
		},
		isPodcastmaker(){
      return state.generalParameters.podcastmaker;
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
		textNotVisible(){
			if(this.isEmission)
				return this.$t('Consider podcasts no visible');
			return this.$t('See podcasts no visible');
		},
		isCheckboxNotValidate(){
			return this.organisation && this.organisationRight && this.isContribution && !this.isPodcastmaker && !this.isEmission && this.isNotVisible;
		},
		textNotValidate(){
			if(this.isProduction)
				return this.$t('Display all podcasts to validate');
			return this.$t('Display my podcasts to validate');
		}
  },

  methods:{
		updateFromDate(){
			if(moment(this.fromDate).startOf('minute').toISOString() === moment().subtract(10, "days").startOf('minute').toISOString())
				return;

			if(this.isFrom){
				this.$emit('updateFromDate', this.fromDate);
			}else{
				this.isFrom = true;
			}
		},
		updateToDate(){
			if(moment(this.toDate).startOf('minute').toISOString() === moment().startOf('minute').toISOString())
				return;

			if(this.isTo){
				this.$emit('updateToDate', this.toDate);
			}else{
				this.isTo = true;
			}
		},
		getRubriques(rubriquageId){
			let topicIndex = this.rubriquageData.findIndex(element => element.rubriquageId === rubriquageId);
			return this.rubriquageData[topicIndex].rubriques;
		},
		onRubriqueSelected(rubrique){
			if(rubrique.rubriqueId === this.rubriqueId)
				return;
			this.rubriqueId = rubrique.rubriqueId;
			if(0 === this.rubriqueId){
				this.$emit('updateRubrique', undefined);
			}else{
				this.$emit('updateRubrique', rubrique.rubriqueId);
			}
		},
		onRubriquageSelected(){
			this.reset = !this.reset;
			this.rubriqueId = 0;
			if(this.isRubriquage){
				this.$emit('updateRubriquage', this.rubriquageId);
			}
		},
    updateMonetization(value){
      this.$emit('updateMonetization', value);
		},
		async fetchTopics(){
			if(!this.organisation)
				return;
			const data = await octopusApi.fetchTopics(this.organisation);
			this.rubriquageData = data;
			if(0 === data.length)
				return;

			for (let index = 0; index < this.rubriquageData.length; index++) {
				if(0 !== this.rubriquageData[index].rubriques.length){
					this.rubriquageId = this.rubriquageData[index].rubriquageId;
					break;
				}
			}
		},
	},
	watch:{
		organisation(){
			if(this.organisation && this.organisationRight && !this.isEmission){
				this.isNotVisible = true;
			}else{
				this.isNotVisible = false;
			}
			this.fetchTopics();
		},
		isFrom(newVal){
			if(newVal){
				this.$emit('updateFromDate', this.fromDate);
			}else{
				this.$emit('updateFromDate', undefined);
			}
		},
		isTo(newVal){
			if(newVal){
				this.$emit('updateToDate', this.toDate);
			}else{
				this.$emit('updateToDate', undefined);
			}
		},
		isRubriquage(newVal){
			if(newVal){
				this.$emit('updateRubriquage', this.rubriquageId);
			}else{
				this.$emit('updateRubriquage', undefined);
				this.$emit('updateRubrique', undefined);
			}
		},
		sort(newVal){
			this.$emit('updateSortCriteria', newVal);
		},
		resetRubriquage(){
			this.isRubriquage = false;
		},
		isNotVisible(newVal){
			this.$emit('includeHidden', newVal);
		},
		isNotValidate(newVal){
			this.$emit('notValid', newVal);
		},
		sortCriteria(){
			this.sort = this.sortCriteria;
		}
	}
};
</script>
