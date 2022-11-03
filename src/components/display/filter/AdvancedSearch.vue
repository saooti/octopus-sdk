<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <button
      class="d-flex justify-content-center align-items-center mb-3 text-secondary btn-transparent"
      @click="showFilters = !showFilters"
    >
      <div>{{ $t('Advanced filters') }}</div>
      <div 
        class="saooti-down mx-1"
        :class="{ 'arrow-transform': showFilters }"
      />
    </button>
    <div
      v-show="showFilters"
      class="advanced-search-container"
    >
      <div class="d-flex flex-column">
        <div class="text-primary mb-2">
          {{ $t('Filter') }}
        </div>
        <MonetizableFilter
          v-if="sdkParameters.isMonetizableFilter && !isEducation"
          :is-emission="isEmission"
          @updateMonetization="updateMonetization"
        />
        <CategorySearchFilter @updateCategory="updateCategory" />
        <RubriqueFilter 
          :reset-rubriquage="resetRubriquage"
          :organisation-id="organisationId"
          @updateRubriquageFilter="updateRubriquageFilter"
        />
        <DateFilter
          :is-emission="isEmission"
          @updateToDate="updateToDate"
          @updateFromDate="updateFromDate"
        />
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
        <div class="text-primary mb-2">
          {{ $t('Sort') }}
        </div>
        <SearchOrder
          :is-emission="isEmission"
          :is-search-bar="isSearchBar"
          :sort-criteria="sortCriteria"
          @updateSortCriteria="updateSortCriteria"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import { orgaComputed } from '../../mixins/orgaComputed';
import CategorySearchFilter from './CategorySearchFilter.vue';
import DateFilter from './DateFilter.vue';
import SearchOrder from './SearchOrder.vue';
import RubriqueFilter from './RubriqueFilter.vue';
import ClassicCheckbox from '../../form/ClassicCheckbox.vue';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent, defineAsyncComponent } from 'vue';
const MonetizableFilter = defineAsyncComponent(() => import('./MonetizableFilter.vue'));
export default defineComponent({
  components: {
    MonetizableFilter,
    CategorySearchFilter,
    RubriqueFilter,
    ClassicCheckbox,
    DateFilter,
    SearchOrder
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
      isNotVisible: this.includeHidden,
      isNotValidate: false as boolean,
      showFilters: false as boolean,
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
    isNotVisible(): void{
      this.$emit('includeHidden', this.isNotVisible);
    },
    isNotValidate(): void {
      this.$emit('notValid', this.isNotValidate);
    },
  },
  methods: {
    updateFromDate(value: string): void {
      this.$emit('updateFromDate', value);
    },
    updateToDate(value: string): void {
      this.$emit('updateToDate', value);
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
    updateSortCriteria(value: string){
      this.$emit('updateSortCriteria', value);
    }
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