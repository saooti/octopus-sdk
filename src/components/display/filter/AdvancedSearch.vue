<template>
  <div>
    <div
      class="d-flex justify-content-center mb-3"
      @click="showFilters = !showFilters"
    >
      <div class="text-secondary c-hand">
        {{ $t('Advanced filters') }}
      </div>
      <div
        class="text-secondary c-hand align-self-center large-font-size"
        :class="{ 'arrow-transform': showFilters }"
      >
        <div class="saooti-arrow_down saooti-arrow_down-margin" />
      </div>
    </div>
    <div
      v-show="showFilters"
      class="advanced-search-container"
    >
      <div class="d-flex flex-column">
        <div class="primary-color mb-2">
          {{ $t('Filter') }}
        </div>
        <MonetizableFilter
          v-if="isMonetizableFilter"
          :is-education="isEducation"
          :is-emission="isEmission"
          @updateMonetization="updateMonetization"
        />
        <CategoryFilter @updateCategory="updateCategory" />
        
        <RubriqueFilter 
          :reset-rubriquage="resetRubriquage"
          :organisation-id="organisationId"
          @updateRubriquageFilter="updateRubriquageFilter"
        />
        <div class="d-flex mt-3 align-items-center flex-wrap">
          <div
            v-if="isEmission"
            class="me-2"
          >
            {{ $t('Emission with episode published :') }}
          </div>
          <div class="d-flex align-items-center">
            <div class="flex-shrink">
              <input
                id="search-from-checkbox"
                v-model="isFrom"
                type="checkbox"
                class="form-check-input"
              >
              <label
                class="form-check-label"
                for="search-from-checkbox"
              >{{
                $t('From the :')
              }}</label>
            </div>
            <DatePicker
              v-model="fromDate"
              class="ps-3 pe-3"
              mode="dateTime"
              color="green"
              is24hr
              @update:modelValue="updateFromDate()"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                  class="px-2 py-1 border rounded focus:outline-none focus:border-blue-300"
                  :value="inputValue"
                  v-on="inputEvents"
                >
              </template>
            </DatePicker>
          </div>
          <div class="d-flex align-items-center">
            <div class="flex-shrink">
              <input
                id="search-to-checkbox"
                v-model="isTo"
                type="checkbox"
                class="form-check-input"
              >
              <label
                class="form-check-label"
                for="search-to-checkbox"
              >{{
                $t('To the :')
              }}</label>
            </div>
            <DatePicker
              v-model="toDate"
              class="ps-3"
              mode="dateTime"
              color="green"
              is24hr
              @update:modelValue="updateToDate()"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                  class="px-2 py-1 border rounded focus:outline-none focus:border-blue-300"
                  :value="inputValue"
                  v-on="inputEvents"
                >
              </template>
            </DatePicker>
          </div>
        </div>
        <div
          v-if="organisation && organisationRight && !isPodcastmaker"
          class="d-flex flex-column mt-3"
        >
          <div class="flex-shrink">
            <input
              id="search-future-checkbox"
              v-model="isNotVisible"
              type="checkbox"
              class="form-check-input"
              :disabled="isCheckboxNotValidate && isNotValidate"
            >
            <label
              class="form-check-label"
              for="search-future-checkbox"
            >{{
              textNotVisible
            }}</label>
          </div>
        </div>
        <div
          v-if="isCheckboxNotValidate"
          class="d-flex flex-column mt-3"
        >
          <div class="flex-shrink">
            <input
              id="search-not-validate-checkbox"
              v-model="isNotValidate"
              type="checkbox"
              class="form-check-input"
            >
            <label
              class="form-check-label"
              for="search-not-validate-checkbox"
            >{{ textNotValidate }}</label>
          </div>
        </div>
      </div>
      <div class="d-flex flex-column">
        <div class="primary-color mb-2 padding-left-custom-radio">
          {{ $t('Sort') }}
        </div>
        <div
          v-if="isSearchBar"
          class="form-check"
        >
          <input
            id="radio_score"
            v-model="sort"
            class="form-check-input"
            type="radio"
            name="sortRadio"
            value="SCORE"
          >
          <label
            class="form-check-label"
            for="radio_score"
          >{{ $t('Sort score') }}</label>
        </div>
        <div class="form-check">
          <input
            id="radio_podcast"
            v-model="sort"
            class="form-check-input"
            type="radio"
            name="sortRadio"
            :value="isEmission?'LAST_PODCAST_DESC':'DATE'"
          >
          <label
            class="form-check-label"
            for="radio_podcast"
          >{{ $t('Sort last') }}</label>
        </div>
        <div class="form-check">
          <input
            id="radio_name"
            v-model="sort"
            class="form-check-input"
            type="radio"
            name="sortRadio"
            value="NAME"
          >
          <label
            class="form-check-label"
            for="radio_name"
          >{{ $t('Sort name') }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
const moment = require('moment');
import CategoryFilter from './CategoryFilter.vue';
import RubriqueFilter from './RubriqueFilter.vue';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
import { DatePicker } from 'v-calendar';
import { defineComponent, defineAsyncComponent } from 'vue';
const MonetizableFilter = defineAsyncComponent(() => import('./MonetizableFilter.vue'));
export default defineComponent({
  components: {
    MonetizableFilter,
    DatePicker,
    CategoryFilter,
    RubriqueFilter
  },
  props: {
    organisationId: { default: undefined, type: String},
    isEmission: { default: false, type:  Boolean},
    resetRubriquage: { default: false, type:  Boolean},
    isSearchBar: { default: false, type:  Boolean},
    isEducation: { default: false, type:  Boolean},
    includeHidden: { default: false, type:  Boolean},
    sortCriteria: { default: 'DATE', type: String},
  },

  emits: ['updateToDate', 
          'updateFromDate',
          'updateMonetization',
          'updateCategory',
          'updateSortCriteria',
          'includeHidden',
          'notValid',
          'updateRubriquageFilter'],
  data() {
    return {
      isFrom: false as boolean,
      isTo: false as boolean,
      lang: {
        ok: this.$t('Validate') as string,
        cancel: this.$t('Cancel') as string,
      },
      fromDate: moment().subtract(10, 'days').toISOString() as string,
      toDate: moment().toISOString() as string,
      isNotVisible: false as boolean,
      isNotValidate: false as boolean,
      showFilters: false as boolean,
      sort: '' as string,
    };
  },

  computed: {
    isMonetizableFilter(): boolean {
      return state.podcastsPage.MonetizableFilter;
    },
    myOrganisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    isProduction(): boolean {
      return state.generalParameters.isProduction;
    },
    isContribution(): boolean {
      return state.generalParameters.isContribution;
    },
    organisationRight(): boolean {
      if (
        (this.authenticated && this.myOrganisationId === this.organisationId) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
    textNotVisible(): string {
      if (this.isEmission) return this.$t('Consider podcasts no visible').toString();
      return this.$t('See podcasts no visible').toString();
    },
    isCheckboxNotValidate(): boolean {
      return (
        undefined!==this.organisation &&
        this.organisationRight &&
        this.isContribution &&
        !this.isPodcastmaker &&
        !this.isEmission &&
        this.isNotVisible
      );
    },
    textNotValidate(): string {
      if (this.isProduction) return this.$t('Display all podcasts to validate').toString();
      return this.$t('Display my podcasts to validate').toString();
    },
  },
  watch: {
    organisation(): void {
      if (this.organisation && this.organisationRight && !this.isEmission) {
        this.isNotVisible = true;
      } else {
        this.isNotVisible = false;
      }
    },
    isFrom(): void {
      if (this.isFrom) {
        this.$emit('updateFromDate', moment(this.fromDate).toISOString(true));
      } else {
        this.$emit('updateFromDate', undefined);
      }
    },
    isTo(): void {
      if (this.isTo) {
        this.$emit('updateToDate', moment(this.toDate).toISOString(true));
      } else {
        this.$emit('updateToDate', undefined);
      }
    },
    sort(): void {
      this.$emit('updateSortCriteria', this.sort);
    },
    isNotVisible(): void{
      this.$emit('includeHidden', this.isNotVisible);
    },
    isNotValidate(): void {
      this.$emit('notValid', this.isNotValidate);
    },
    sortCriteria(): void {
      this.sort = this.sortCriteria;
    },
  },

  created() {
    if (!this.isEmission) {
      this.isNotVisible = this.includeHidden;
    }
  },

  mounted() {
    this.sort = this.sortCriteria;
  },
  methods: {
    updateFromDate(): void {
      if (
        moment(this.fromDate)
          .startOf('minute')
          .toISOString() ===
        moment()
          .subtract(10, 'days')
          .startOf('minute')
          .toISOString()
      )
        return;
      if (this.isFrom) {
        this.$emit('updateFromDate', moment(this.fromDate).toISOString(true));
      } else {
        this.isFrom = true;
      }
    },
    updateToDate(): void {
      if (
        moment(this.toDate)
          .startOf('minute')
          .toISOString() ===
        moment()
          .startOf('minute')
          .toISOString()
      )
        return;
      if (this.isTo) {
        this.$emit('updateToDate', moment(this.toDate).toISOString(true));
      } else {
        this.isTo = true;
      }
    },
    updateMonetization(value: string): void {
      this.$emit('updateMonetization', value);
    },
    updateCategory(value: number){
      if(0!==value){
        this.$emit('updateCategory', value);
      }else{
        this.$emit('updateCategory', undefined);
      }
    },
    updateRubriquageFilter(value: Array<RubriquageFilter>){
      this.$emit('updateRubriquageFilter', value);
    },
  },
})
</script>

<style lang="scss">

.padding-left-custom-radio {
  padding-left: 1.5rem;
  @media (max-width: 720px) {
    padding-left: 0;
    margin-top: 1rem;
  }
}
.large-font-size {
  font-size: 1.3rem;
}

.advanced-search-container {
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

  @media (max-width: 450px) {
    flex-direction: column;
    .vdatetime {
      padding: 0.5em 0 !important;
      width: 100%;
      input {
        width: 100%;
      }
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
      margin: 0;
    }
  }
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
}
</style>