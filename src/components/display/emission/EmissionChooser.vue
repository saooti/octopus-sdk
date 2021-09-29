<template>
  <div
    class="default-multiselect-width"
    :class="{ 'multiselect-hide-arrow': !displayArrow }"
    :style="{ width: width }"
  >
    <label
      for="emissionChooser"
      class="d-inline"
      aria-label="select emission"
    />
    <!-- <Multiselect
      v-model="emission"
      id="emissionChooser"
      label="name"
      track-by="emissionId"
      :placeholder="$t('Type string to filter by emission')"
      ref="multiselectRef"
      :options="emissions"
      :multiple="false"
      :searchable="true"
      :loading="isLoading"
      :internal-search="false"
      :clear-on-select="false"
      :close-on-select="true"
      :options-limit="200"
      :max-height="600"
      :show-no-results="true"
      :hide-selected="true"
      :show-labels="false"
      @search-change="onSearchEmission"
      @open="onOpen"
      @close="onClose"
      @select="onEmissionSelected"
    >
      <template slot="clear" slot-scope="props">
        <div
          class="multiselect__clear"
          v-if="emission"
          @mousedown.prevent.stop="clearAll(props.search)"
        ></div>
      </template>
      <template slot="singleLabel" slot-scope="props">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </template>
      <template slot="option" slot-scope="props">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </template>
      <span slot="noResult">{{
        $t('No elements found. Consider changing the search query.')
      }}</span>
      <template slot="afterList">
        <div v-if="remainingElements" class="multiselect-remaining-elements">
          {{
            $t(
              'Count more elements matched your query, please make a more specific search.',
              { count: remainingElements }
            )
          }}
        </div>
      </template>
      <template slot="noOptions">{{ $t('List is empty') }}</template>
      <div class="position-relative" slot="caret">
        <span
          class="saooti-arrow_down octopus-arrow-down-2 octopus-arrow-down-top"
        ></span>
      </div>
    </Multiselect> -->
  </div>
</template>

<script lang="ts">
/* import Multiselect from 'vue-multiselect'; */
const octopusApi = require('@saooti/octopus-api');

const ELEMENTS_COUNT = 50;
const DEFAULT_EMISSION_ID = 0;

const getDefaultEmission = (defaultName: string) => {
  if(''=== defaultName){
    return undefined;
  }
  return {
    name: defaultName,
    emissionId: DEFAULT_EMISSION_ID,
    imageUrl:'',
    description:'',
    monetisable:'UNDEFINED',
    orga :{ 
      id:'',
      imageUrl:'',
      name:''
    },
    rubriqueIds:[],
  };
};

import { Emission } from '@/store/class/emission';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    //Multiselect,
  },

  props: {
    width: { default: '100%', type: String },
    defaultanswer: { default: '', type: String },
    organisationId: { default: undefined, type: String},
    emissionChosen: { default: undefined, type: Object as ()=>Emission},
    displayArrow: { default: true, type: Boolean },
    distributedBy: { default: undefined, type: String},
    organisationDistributedBy: { default: undefined, type: String},
    reset: { default: false, type: Boolean },
  },

  emits: ['selected'],

  data() {
    return{
      emission: getDefaultEmission(this.defaultanswer) as Emission | undefined,
      emissions: [] as Array<Emission>,
      remainingElements: 0 as number,
      isLoading: false as boolean,
    };
  },
  watch: {
    emissionChosen(): void {
      this.emission = this.emissionChosen;
    },
    reset(): void {
      this.emission = getDefaultEmission(this.defaultanswer);
    },
  },

   methods: {
    onOpen(): void {
      (this.$refs.multiselectRef as any).$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      this.clearAll();
      this.onSearchEmission();
    },
    onClose(): void {
      if (this.emission) return;
      this.emission = this.defaultanswer
        ? getDefaultEmission(this.defaultanswer)
        : undefined;
      this.$emit('selected', this.emission);
    },
    onEmissionSelected(emission: Emission): void {
      this.$emit('selected', emission);
    },
    async onSearchEmission(query?: string): Promise<void> {
      this.isLoading = true;
      let standardParam: any = {
        query: query,
        first: 0,
        size: ELEMENTS_COUNT,
      };
      if (undefined !== this.distributedBy) {
        standardParam = { ...standardParam, distributedBy: this.distributedBy };
      } else if (undefined !== this.organisationDistributedBy) {
        standardParam = {
          ...standardParam,
          distributedBy: this.organisationDistributedBy,
          organisationId: this.organisationId,
        };
      } else {
        standardParam = {
          ...standardParam,
          organisationId: this.organisationId,
        };
      }
      const response = await octopusApi.fetchEmissions(standardParam);
      if (this.defaultanswer) {
        this.emissions = [getDefaultEmission(this.defaultanswer)!].concat(
          response.result
        );
      } else {
        this.emissions = response.result.concat();
      }
      this.isLoading = false;
      this.remainingElements = Math.max(0, response.count - ELEMENTS_COUNT);
    },
    clearAll(): void {
      this.emission = undefined;
      this.emissions.length = 0;
    },
  },
})
</script>

<style lang="scss"></style>