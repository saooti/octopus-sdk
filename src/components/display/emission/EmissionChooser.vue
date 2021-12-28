<template>
  <div
    class="default-multiselect-width"
    :style="{ width: width }"
  >
    <label
      for="emissionChooser"
      class="d-inline"
      aria-label="select emission"
    />
    <VueMultiselect
      id="emissionChooser"
      ref="multiselectRef"
      v-model="emission"
      label="name"
      track-by="emissionId"
      :placeholder="$t('Type string to filter by emission')"
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
      <template #clear="{ props }">
        <div
          v-if="emission"
          class="multiselect__clear"
          @mousedown.prevent.stop="clearAll(props.search)"
        />
      </template>
      <template #singleLabel="{ option }">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ option.name }}</span>
        </div>
      </template>
      <template #option="{ option }">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ option.name }}</span>
        </div>
      </template>
      <template #noResult="">
        <span>{{ $t('No elements found. Consider changing the search query.') }}</span>
      </template>
      <template #afterList="">
        <div
          v-if="remainingElements"
          class="multiselect-remaining-elements"
        >
          {{
            $t(
              'Count more elements matched your query, please make a more specific search.',
              { count: remainingElements }
            )
          }}
        </div>
      </template>
      <template #noOptions="">
        {{ $t('List is empty') }}
      </template>
      <template #caret="">
        <div class="position-relative">
          <span
            class="saooti-arrow_down octopus-arrow-down"
          />
        </div>
      </template>
    </VueMultiselect>
  </div>
</template>

<script lang="ts">
//@ts-ignore
import VueMultiselect from 'vue-multiselect';
import octopusApi from '@saooti/octopus-api';

const ELEMENTS_COUNT = 50;
const DEFAULT_EMISSION_ID = 0;

const getDefaultEmission = (defaultName: string): Emission|undefined => {
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

import { Emission } from '@/store/class/general/emission';
import { defineComponent } from 'vue'
import { FetchParam } from '@/store/class/general/fetchParam';
export default defineComponent({
  components: {
    VueMultiselect
  },

  props: {
    width: { default: '100%', type: String },
    defaultanswer: { default: '', type: String },
    organisationId: { default: undefined, type: String},
    emissionChosen: { default: undefined, type: Object as ()=>Emission},
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
    emissionChosen: {
      deep: true,
      handler(){
        this.emission = this.emissionChosen;
      }
    },
    reset(): void {
      this.emission = getDefaultEmission(this.defaultanswer);
    },
  },

   methods: {
    onOpen(): void {
      (this.$refs.multiselectRef as VueMultiselect).$refs.search.setAttribute(
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
      let standardParam: FetchParam = {
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
        const emissionDefault = getDefaultEmission(this.defaultanswer);
        if(emissionDefault){
          this.emissions = [emissionDefault].concat(
            response.result
          );
        }
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