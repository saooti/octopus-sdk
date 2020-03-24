<template>
<div>
	<div class="d-flex justify-content-center mb-3" @click="showFilters = !showFilters">
		<div class="text-secondary c-hand">{{$t('Advanced filters')}}</div>
		<div class="text-secondary c-hand align-self-center large-font-size" :class="{'arrow-transform':showFilters}">
			<div class="saooti-arrow_drop_down"></div>
		</div>
	</div>
  <div class="advanced-search-container" v-if="showFilters" >
    <MonetizableFilter @updateMonetization='updateMonetization' :isEmission='isEmission' v-if="isMonetizableFilter"/>
		<div class="d-flex mt-3 align-items-center" v-if="organisationId && rubriquageDisplay">
			<div class="checkbox-saooti flex-shrink">  
				<input type="checkbox" class="custom-control-input" id="search-rubriquage-checkbox" v-model="isRubriquage">  
				<label class="custom-control-label" for="search-rubriquage-checkbox">{{ $t('By topic') }}</label>  
      </div>
			<template v-if="isRubriquage">
				<label class="wrap">
					<select class="basic-select ml-2 mb-0 border" @change="onRubriquageSelected">
						<option 
							v-for="rubriquage in rubriquageData" 
							v-show="rubriquage.rubriques.length"
							:key="rubriquage.rubriquageId" 
							:value="rubriquage.rubriquageId"
						>{{rubriquage.title}}</option>
					</select>
					<div class="saooti-arrow_down octopus-arrow-down-2"></div>
				</label>
				<div class="ml-3 flex-shrink">{{$t('By rubric')}}</div>
				<RubriqueChooser 
					class="ml-2"
					:multiple='false' 
					:rubriquageId='rubriquageId' 
					:allRubriques='getRubriques(rubriquageId)' 
					:defaultanswer='$t("No rubric filter")'
					:reset='reset'
					width='auto'
					@selected="onRubriqueSelected"		
				/>
			</template>
		</div>
		<div class="d-flex mt-3 align-items-center" v-if="!isEmission">
			<div class="checkbox-saooti flex-shrink">  
				<input type="checkbox" class="custom-control-input" id="search-from-checkbox" v-model="isFrom">  
				<label class="custom-control-label" for="search-from-checkbox">{{ $t('From the :') }}</label>  
      </div>
			<Datetime
				type="datetime"
				moment-locale="fr"
				v-model="fromDate"
				class="theme-saooti pl-3"
				@input="updateFromDate"
				:i18n="lang"
      />
			<div class="checkbox-saooti flex-shrink ml-3">  
				<input type="checkbox" class="custom-control-input" id="search-to-checkbox" v-model="isTo">  
				<label class="custom-control-label" for="search-to-checkbox">{{ $t('To the :') }}</label>  
      </div>
			<Datetime
				type="datetime"
				moment-locale="fr"
				v-model="toDate"
				class="theme-saooti pl-3"
				@input="updateToDate"
				:i18n="lang"
      />
		</div>
		<div class="d-flex flex-column mt-3" v-if="organisationRight && false">
			<div class="checkbox-saooti flex-shrink">  
				<input type="checkbox" class="custom-control-input" id="search-visible-checkbox" v-model="isVisible" :disabled='lastCheckbox(isVisible)'>  
				<label class="custom-control-label" for="search-visible-checkbox">{{ $t('Visible') }}</label>  
      </div>
			<div class="checkbox-saooti flex-shrink">  
				<input type="checkbox" class="custom-control-input" id="search-inCreate-checkbox" v-model="isInCreate" :disabled='lastCheckbox(isInCreate)'>  
				<label class="custom-control-label" for="search-inCreate-checkbox">{{ $t('In creation') }}</label>  
      </div>
			<div class="checkbox-saooti flex-shrink">  
				<input type="checkbox" class="custom-control-input" id="search-future-checkbox" v-model="isFuture" :disabled='lastCheckbox(isFuture)'>  
				<label class="custom-control-label" for="search-future-checkbox">{{ $t('Publish in future') }}</label>  
      </div>
			<div class="checkbox-saooti flex-shrink">  
				<input type="checkbox" class="custom-control-input" id="search-error-checkbox" v-model="isError" :disabled='lastCheckbox(isError)'>  
				<label class="custom-control-label" for="search-error-checkbox">{{ $t('In error') }}</label>  
      </div>
		</div>
  </div>
</div>
</template>
<style lang="scss">
.large-font-size{
  font-size: 1.3rem;
}
.arrow-transform{
  transform: rotate(180deg);
}
.advanced-search-container{
	background: #fff;
  border-radius: 2rem;
	display: flex;
	flex-direction: column;
  width: 100%;
	padding: 1rem;
	margin: 1rem;
	label.wrap { 
		position: relative;
		margin:0;
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
	
	props: ['organisationId', 'isEmission'],

  created() {
		this.fetchTopics();
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
			isVisible: true,
			isInCreate: false,
			isFuture: false,
			isError: false,
			showFilters : false,
			reset: false,
    };
  },

  computed:{
    isMonetizableFilter(){
      return state.podcastsPage.MonetizableFilter;
		},
		rubriquageDisplay(){
			if(this.rubriquageData.length !== 0){
				let found = false;
				for (let index = 0; index < this.rubriquageData.length; index++) {
					if(this.rubriquageData[index].rubriques.length !== 0){
						found = true;
						break;
					}
				}
				return found;
			}
			return false;
		},
		myOrganisationId(){
      return state.generalParameters.organisationId;
    },
    authenticated(){
      return state.generalParameters.authenticated;
    },
		organisationRight() {
      if (this.authenticated) {
        if (this.myOrganisationId === this.organisationId) {
          return true;
        }
        if (state.generalParameters.isAdmin) {
          return true;
        }
      }
      return false;
		},
  },

  methods:{
		lastCheckbox(value){
			if(value){
				let i = 0;
				if(!this.isVisible){
					i++;
				}
				if(!this.isInCreate){
					i++;
				}
				if(!this.isError){
					i++;
				}
				if(!this.isFuture){
					i++;
				}
				return i === 3;
			}else{
				return false;
			}
		},
		updateFromDate(){
			if(this.isFrom){
				this.$emit('updateFromDate', [true, this.fromDate]);
			}
		},
		updateToDate(){
			if(this.isTo){
				this.$emit('updateToDate', [true, this.toDate]);
			}
		},
		getRubriques(rubriquageId){
			let topicIndex = this.rubriquageData.findIndex(element => element.rubriquageId === rubriquageId);
			return this.rubriquageData[topicIndex].rubriques;
		},
		onRubriqueSelected(rubrique){
			if(rubrique.rubriqueId !== this.rubriqueId){
				this.rubriqueId = rubrique.rubriqueId;
				if(this.rubriqueId === 0){
					this.$emit('updateRubrique', undefined);
				}else{
					this.$emit('updateRubrique', rubrique.rubriqueId);
				}
			}
		},
		onRubriquageSelected($event){
			let value = parseInt($event.target.value, 10);
			if(value != this.rubriquageId){
				this.rubriquageId = value;
				this.reset = !this.reset;
				if(this.isRubriquage){
					this.$emit('updateRubriquage', this.rubriquageId);
				}
			}
		},
    updateMonetization(value){
      this.$emit('updateMonetization', value);
		},
		fetchTopics(){
			if(this.organisationId){
				octopusApi.fetchTopics(this.organisationId).then((data)=>{
					this.rubriquageData = data;
					if(data.length !== 0){
						this.rubriquageId = data[0].rubriquageId;
					}
				});
			}
		},
		updateVisible(){
			if(!this.isInCreate && !this.isFuture && !this.isError){
				this.isVisible = true;
			}
		}
	},
	watch:{
		organisationId(){
			this.fetchTopics();
		},
		isFrom(newVal){
			this.$emit('updateFromDate', [newVal, this.fromDate]);
		},
		isTo(newVal){
			this.$emit('updateToDate', [newVal, this.toDate]);
		},
		isRubriquage(newVal){
			if(newVal){
				this.$emit('updateRubriquage', this.rubriquageId);
			}else{
				this.$emit('updateRubriquage', undefined);
				this.$emit('updateRubrique', undefined);
			}
		}
	}
};
</script>