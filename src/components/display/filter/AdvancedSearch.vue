<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <button
      class="d-flex justify-content-center mb-3 text-secondary btn-transparent"
      @click="showFilters = !showFilters"
    >
      <div>{{ $t('Advanced filters') }}</div>
      <div 
        class="h3 saooti-down m-0"
        :class="{ 'arrow-transform': showFilters }"
      />
    </button>
    <div
      v-show="showFilters"
      class="advanced-search-container"
    >
      <div class="d-flex flex-column">
        <div class="primary-darker mb-2">
          {{ $t('Filter') }}
        </div>
        <MonetizableFilter
          v-if="sdkParameters.isMonetizableFilter && !isEducation"
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
            <ClassicCheckbox
              v-model:textInit="isFrom"
              class="flex-shrink-0"
              id-checkbox="search-from-checkbox"
              :label="$t('From the :')"
            />
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
                  class="px-2 py-1 border rounded focus:border-blue-300"
                  :value="inputValue"
                  v-on="inputEvents"
                >
              </template>
            </DatePicker>
          </div>
          <div class="d-flex align-items-center">
            <ClassicCheckbox
              v-model:textInit="isTo"
              class="flex-shrink-0"
              id-checkbox="search-to-checkbox"
              :label="$t('To the :')"
            />
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
                  class="px-2 py-1 border rounded focus:border-blue-300"
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
          <ClassicCheckbox
            v-model:textInit="isNotVisible"
            class="flex-shrink-0"
            id-checkbox="search-future-checkbox"
            :label="textNotVisible"
            :is-disabled="isCheckboxNotValidate && isNotValidate"
          />
        </div>
        <div
          v-if="isCheckboxNotValidate"
          class="d-flex flex-column mt-3"
        >
          <ClassicCheckbox
            v-model:textInit="isNotValidate"
            class="flex-shrink-0"
            id-checkbox="search-not-validate-checkbox"
            :label="textNotValidate"
          />
        </div>
      </div>
      <div class="d-flex flex-column">
        <div class="primary-darker mb-2">
          {{ $t('Sort') }}
        </div>
        <ClassicRadio
          v-model:textInit="sort"
          id-radio="sort-radio"
          :options="isSearchBar? [{title:$t('Sort score'), value:'SCORE'},
                                  {title:$t('Sort last'), value:isEmission?'LAST_PODCAST_DESC':'DATE'},
                                  {title:$t('Sort name'), value:'NAME'}]:
            [{title:$t('Sort last'), value:isEmission?'LAST_PODCAST_DESC':'DATE'},
             {title:$t('Sort name'), value:'NAME'}]"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import { orgaComputed } from '../../mixins/orgaComputed';
import moment from 'moment';
import CategoryFilter from './CategoryFilter.vue';
import RubriqueFilter from './RubriqueFilter.vue';
import ClassicCheckbox from '../../form/ClassicCheckbox.vue';
import ClassicRadio from '../../form/ClassicRadio.vue';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { DatePicker } from 'v-calendar';
import { defineComponent, defineAsyncComponent } from 'vue';
const MonetizableFilter = defineAsyncComponent(() => import('./MonetizableFilter.vue'));
export default defineComponent({
  components: {
    MonetizableFilter,
    DatePicker,
    CategoryFilter,
    RubriqueFilter,
    ClassicCheckbox,
    ClassicRadio
  },
  mixins: [orgaComputed],
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
      fromDate: moment().subtract(10, 'days').toISOString() as string,
      toDate: moment().toISOString() as string,
      isNotVisible: this.includeHidden as boolean,
      isNotValidate: false as boolean,
      showFilters: false as boolean,
      sort: this.sortCriteria as string,
    };
  },

  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    sdkParameters(){
      return {
        isMonetizableFilter : (state.podcastsPage.MonetizableFilter as boolean),
        isProduction : (state.generalParameters.isProduction as boolean),
        isContribution : (state.generalParameters.isContribution as boolean)
      }
    },
    organisationRight(): boolean {
      return (true===this.authenticated && this.myOrganisationId === this.organisationId) ||
        true === state.generalParameters.isAdmin;
    },
    organisation(): string|undefined {
      return this.organisationId??this.filterOrga;
    },
    textNotVisible(): string {
      return this.isEmission? this.$t('Consider podcasts no visible') : this.$t('See podcasts no visible');
    },
    isCheckboxNotValidate(): boolean {
      return (
        undefined!==this.organisation &&
        this.organisationRight &&
        this.sdkParameters.isContribution &&
        !this.isPodcastmaker &&
        !this.isEmission &&
        this.isNotVisible
      );
    },
    textNotValidate(): string {
      return this.sdkParameters.isProduction? this.$t('Display all podcasts to validate') : this.$t('Display my podcasts to validate');
    },
  },
  watch: {
    organisation(): void {
      this.isNotVisible = undefined!==this.organisation && this.organisationRight && !this.isEmission;
    },
    isFrom(): void {
      this.$emit('updateFromDate', this.isFrom ? moment(this.fromDate).toISOString(true) : undefined);
    },
    isTo(): void {
      this.$emit('updateToDate', this.isTo ? moment(this.toDate).toISOString(true) : undefined);
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
      this.$emit('updateCategory', 0!==value ? value : undefined);
    },
    updateRubriquageFilter(value: Array<RubriquageFilter>){
      this.$emit('updateRubriquageFilter', value);
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
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
    padding: 1rem;
    .vdatetime, label {
      padding: 0.5rem 0 !important;
      width: 100%;
      input {
        width: 100%;
      }
    }
  }
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding-right: 40px;
  }
}
}
</style>