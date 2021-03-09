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
    ></label>
    <Multiselect
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
      <template v-slot:clear="props" >
        <div
          class="multiselect__clear"
          v-if="emission.length"
          @mousedown.prevent.stop="clearAll(props.search)"
        ></div>
      </template>
      <template v-slot:singleLabel="props" >
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </template>
      <template v-slot:option="props" >
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </template>
      <template v-slot:noResult>
      <span>{{
        $t('No elements found. Consider changing the search query.')
      }}</span>
      </template>
      <template v-slot:afterList>
        <div v-if="remainingElements" class="multiselect-remaining-elements">
          {{
            $t(
              'Count more elements matched your query, please make a more specific search.',
              { count: remainingElements }
            )
          }}
        </div>
      </template>
      <template v-slot:noOptions>{{ $t('List is empty') }}</template>
      <template v-slot:caret>
        <div class="position-relative">
          <span
            class="saooti-arrow_down octopus-arrow-down-2 octopus-arrow-down-top"
          ></span>
        </div>
      </template>
    </Multiselect>
  </div>
</template>

<style lang="scss">
.default-multiselect-width {
  width: 100%;
}
</style>
<script lang="ts">
import Multiselect from 'vue-multiselect';
const octopusApi = require('@saooti/octopus-api');

const ELEMENTS_COUNT = 50;
const DEFAULT_EMISSION_ID = 0;

const getDefaultEmission = (defaultName: any) => {
  return {
    name: defaultName,
    id: DEFAULT_EMISSION_ID,
  };
};

import { defineComponent, ref } from 'vue'
export default defineComponent({
  components: {
    Multiselect,
  },

  props: {
    width: { default: '100%' },
    defaultanswer: { default: undefined as any },
    organisationId: { default: undefined as any },
    emissionChosen: { default: undefined as any },
    displayArrow: { default: true },
    distributedBy: { default: undefined as any },
    organisationDistributedBy: { default: undefined as any },
    reset: { default: false },
  },

  data() {
    let _return:any = {
      emission: '',
      emissions: [] as any,
      remainingElements: 0,
      isLoading: false,
    };
    if (this.defaultanswer) {
      _return['emission'] = getDefaultEmission(this.defaultanswer);
    }
    return _return;
  },

  setup() {
    const multiselectRef : any = ref(null);
    return {
      multiselectRef,
    };
  },

  methods: {
    onOpen() {
      this.multiselectRef.$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      this.clearAll();
      this.onSearchEmission();
    },

    onClose() {
      if (this.emission) return;
      this.emission = this.defaultanswer
        ? getDefaultEmission(this.defaultanswer)
        : '';
      this.$emit('selected', this.emission);
    },

    onEmissionSelected(emission: any) {
      this.$emit('selected', emission);
    },

    async onSearchEmission(query: undefined) {
      this.isLoading = true;
      let standardParam:any = {
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
        this.emissions = [getDefaultEmission(this.defaultanswer)].concat(
          response.result
        );
      } else {
        this.emissions = response.result.concat();
      }
      this.isLoading = false;
      this.remainingElements = Math.max(0, response.count - ELEMENTS_COUNT);
    },

    clearAll() {
      this.emission = '';
      this.emissions.length = 0;
    },
  },
  watch: {
    emissionChosen(newVal) {
      this.emission = getDefaultEmission(newVal);
    },
    reset() {
      this.emission = getDefaultEmission(this.defaultanswer);
    },
  },
});
</script>
