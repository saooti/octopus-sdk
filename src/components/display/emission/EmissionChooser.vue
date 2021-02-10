<template>
  <div class="default-multiselect-width" :class="{'multiselect-hide-arrow' : !displayArrow }" :style="{ width: width }">
    <label for="emissionChooser" class="d-inline" aria-label="select emission"></label>
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
      <template slot="clear" slot-scope="props">
        <div
          class="multiselect__clear"
          v-if="emission.length"
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
      <span slot="noResult">{{ $t('No elements found. Consider changing the search query.') }}</span>
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
        <span class="saooti-arrow_down octopus-arrow-down-2 octopus-arrow-down-top"></span>
      </div>
    </Multiselect>
  </div>
</template>

<style lang="scss">
.default-multiselect-width{
  width: 100%;
}
</style>
<script>
import Multiselect from "vue-multiselect";
import octopusApi from "@saooti/octopus-api";

const ELEMENTS_COUNT = 50;
const DEFAULT_EMISSION_ID = 0;

const getDefaultEmission = defaultName => {
  return {
    name: defaultName,
    id: DEFAULT_EMISSION_ID
  };
};

export default {
  components: {
    Multiselect
  },

  props: {
    width: { default: "100%" },
    defaultanswer: { default: false },
    organisationId: { default: undefined },
    emissionChosen: { default: undefined },
    displayArrow: { default: true },
    distributedBy: {default:undefined},
    organisationDistributedBy: {default:undefined},
    reset: {default: false},
  },

  data() {
    let _return = {
      emission: "",
      emissions: [],
      remainingElements: 0,
      isLoading: false
    };
    if (this.defaultanswer) {
      _return["emission"] = getDefaultEmission(this.defaultanswer);
    }
    return _return;
  },

  methods: {
    onOpen() {
      this.$refs.multiselectRef.$refs.search.setAttribute("autocomplete", "off");
      this.clearAll();
      this.onSearchEmission();
    },

    onClose() {
      if(this.emission)
        return;
      this.emission = this.defaultanswer
        ? getDefaultEmission(this.defaultanswer)
        : "";
      this.$emit("selected", this.emission);
    },

    onEmissionSelected(emission) {
      this.$emit("selected", emission);
    },

    async onSearchEmission(query) {
      this.isLoading = true;
      let standardParam = {
        query: query,
        first: 0,
        size: ELEMENTS_COUNT,
      };
      if(this.distributedBy !== undefined){
        standardParam = {...standardParam, distributedBy: this.distributedBy};
      } else if(this.organisationDistributedBy !== undefined){
        standardParam = {...standardParam, distributedBy: this.organisationDistributedBy, organisationId: this.organisationId};
      } else {
        standardParam = {...standardParam, organisationId: this.organisationId};
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
      this.emission = "";
      this.emissions = [];
    }
  },
  watch: {
    emissionChosen(newVal) {
      this.emission = getDefaultEmission(newVal);
    },
    reset() {
      this.emission = getDefaultEmission(this.defaultanswer);
    },
  }
};
</script>
