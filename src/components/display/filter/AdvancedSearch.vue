<template>
  <div>
    <div
      class="d-flex justify-content-center mb-3"
      @click="showFilters = !showFilters"
    >
      <div class="text-secondary c-hand">{{ $t('Advanced filters') }}</div>
      <div
        class="text-secondary c-hand align-self-center large-font-size"
        :class="{ 'arrow-transform': showFilters }"
      >
        <div class="saooti-arrow_down saooti-arrow_down-margin"></div>
      </div>
    </div>
    <div class="advanced-search-container" v-show="showFilters">
      <div class="d-flex flex-column">
        <div class="primary-color mb-2">{{ $t('Filter') }}</div>
        <MonetizableFilter
          @updateMonetization="updateMonetization"
          :isEducation="isEducation"
          :isEmission="isEmission"
          v-if="isMonetizableFilter"
        />
        <CategoryFilter @updateCategory="updateCategory"/>
        
        <RubriqueFilter 
          :resetRubriquage="resetRubriquage"
          :organisationId="organisationId"
          @updateRubriquageFilter="updateRubriquageFilter"
        />
        <div class="d-flex mt-3 align-items-center flex-wrap">
          <div class="mr-2" v-if="isEmission">
            {{ $t('Emission with episode published :') }}
          </div>
          <div class="d-flex align-items-center">
            <div class="checkbox-saooti flex-shrink">
              <input
                type="checkbox"
                class="custom-control-input"
                id="search-from-checkbox"
                v-model="isFrom"
              />
              <label class="custom-control-label" for="search-from-checkbox">{{
                $t('From the :')
              }}</label>
            </div>
            <DatePicker class="pl-3 pr-3" v-model="fromDate" mode="dateTime" color="green" @input="updateFromDate()" is24hr>
              <template v-slot="{ inputValue, inputEvents }">
                <input
                  class="px-2 py-1 border rounded focus:outline-none focus:border-blue-300"
                  :value="inputValue"
                  v-on="inputEvents"
                />
              </template>
            </DatePicker>
          </div>
          <div class="d-flex align-items-center">
            <div class="checkbox-saooti flex-shrink">
              <input
                type="checkbox"
                class="custom-control-input"
                id="search-to-checkbox"
                v-model="isTo"
              />
              <label class="custom-control-label" for="search-to-checkbox">{{
                $t('To the :')
              }}</label>
            </div>
            <DatePicker class="pl-3" v-model="toDate" mode="dateTime" color="green" @input="updateToDate()" is24hr>
              <template v-slot="{ inputValue, inputEvents }">
                <input
                  class="px-2 py-1 border rounded focus:outline-none focus:border-blue-300"
                  :value="inputValue"
                  v-on="inputEvents"
                />
              </template>
            </DatePicker>
          </div>
        </div>
        <div
          class="d-flex flex-column mt-3"
          v-if="organisation && organisationRight && !isPodcastmaker"
        >
          <div class="checkbox-saooti flex-shrink">
            <input
              type="checkbox"
              class="custom-control-input"
              id="search-future-checkbox"
              v-model="isNotVisible"
              :disabled="isCheckboxNotValidate && isNotValidate"
            />
            <label class="custom-control-label" for="search-future-checkbox">{{
              textNotVisible
            }}</label>
          </div>
        </div>
        <div class="d-flex flex-column mt-3" v-if="isCheckboxNotValidate">
          <div class="checkbox-saooti flex-shrink">
            <input
              type="checkbox"
              class="custom-control-input"
              id="search-not-validate-checkbox"
              v-model="isNotValidate"
            />
            <label
              class="custom-control-label"
              for="search-not-validate-checkbox"
              >{{ textNotValidate }}</label
            >
          </div>
        </div>
      </div>
      <div class="d-flex flex-column">
        <div class="primary-color mb-2 padding-left-custom-radio">
          {{ $t('Sort') }}
        </div>
        <b-form-group>
          <b-form-radio-group v-model="sort" class="d-flex flex-column">
            <b-form-radio value="SCORE" v-if="isSearchBar">{{
              $t('Sort score')
            }}</b-form-radio>
            <b-form-radio value="LAST_PODCAST_DESC" v-if="isEmission">{{
              $t('Sort last')
            }}</b-form-radio>
            <b-form-radio value="DATE" v-else>{{
              $t('Sort last')
            }}</b-form-radio>
            <b-form-radio value="NAME">{{ $t('Sort name') }}</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </div>
    </div>
  </div>
</template>
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
      margin: 0;
    }
  }
  input:not([id*='rubriqueChooser']) {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.2em 0.5em;
  }
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
}
</style>
<script lang="ts">
// @ is an alias to /src
import { state } from '../../../store/paramStore';
const moment = require('moment');
import CategoryFilter from './CategoryFilter.vue';
import RubriqueFilter from './RubriqueFilter.vue';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
export default {
  components: {
    MonetizableFilter: () => import('./MonetizableFilter.vue'),
    // @ts-ignore
    DatePicker: () => import('v-calendar/lib/components/date-picker.umd.min.js'),
    CategoryFilter,
    RubriqueFilter
  },
  props: {
    organisationId: { default: undefined as string|undefined},
    isEmission: { default: false as boolean},
    resetRubriquage: { default: false as boolean},
    isSearchBar: { default: false as boolean},
    isEducation: { default: false as boolean},
    includeHidden: { default: false as boolean},
    sortCriteria: { default: 'DATE' as string},
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

  created() {
    if (!this.isEmission) {
      this.isNotVisible = this.includeHidden;
    }
  },

  mounted() {
    this.sort = this.sortCriteria;
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
};
</script>
