<template>
  <div class="w-100" :class="{'multiselect-hide-arrow' : !displayArrow }" :style="{ width: width }">
    <Multiselect
      v-model="emission"
      id="ajax"
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
      <span class="saooti-arrow_down octopus-arrow-down" slot="caret"></span>
    </Multiselect>
  </div>
</template>

<style lang="scss">
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
    organisationId: { default: false },
    emissionChosen: { default: false },
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
      this.clearAll();
      this.onSearchEmission();
    },

    onClose() {
      if (!this.emission) {
        this.emission = this.defaultanswer
          ? getDefaultEmission(this.defaultanswer)
          : "";
        this.$emit("selected", this.emission);
      }
    },

    onEmissionSelected(emission) {
      this.$emit("selected", emission);
    },

    onSearchEmission(query) {
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
      octopusApi
        .fetchEmissions(standardParam)
        .then(response => {
          if (this.defaultanswer) {
            this.emissions = [getDefaultEmission(this.defaultanswer)].concat(
              response.result
            );
          } else {
            this.emissions = response.result.concat();
          }
          this.isLoading = false;
          this.remainingElements = Math.max(0, response.count - ELEMENTS_COUNT);
        });
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