<template>
  <div id="advanced-search" class="d-flex flex-column justify-content-center align-items-center">
    <button
      class="d-flex justify-content-center align-items-center mb-3 text-secondary btn-transparent"
      @click="clickShowFilters"
    >
      <div>{{ $t("Advanced filters") }}</div>
      <ChevronDownIcon :class="{ 'arrow-transform': showFilters }" />
    </button>
    <div
      v-if="firstLoaded"
      v-show="showFilters"
      class="advanced-search-container"
    >
      <fieldset class="d-flex flex-column flex-grow-3">
        <legend class="text-primary mb-2">
          {{ $t("Filter") }}
        </legend>
        <MonetizableFilter
          v-if="!isPodcastmaker && !platformEducation"
          :is-emission="isEmission"
          :monetisable="monetisable"
          @update:monetisable="updateMonetisable"
        />
        <CategorySearchFilter :iab-id="iabId" @update:iab-id="updateIab" />
        <RubriqueFilter
          :rubrique-filter="rubriqueFilter"
          @update:rubrique-filter="updateRubriquageFilter"
        />
        <DateFilter
          :is-emission="isEmission"
          :from-date="fromDate"
          :to-date="toDate"
          @update-dates="updateDates($event)"
        />
        <div
          v-if="organisation && organisationRight && !isPodcastmaker"
          class="d-flex flex-column mt-3"
        >
          <ClassicCheckbox
            :text-init="includeHidden"
            class="flex-shrink-0"
            id-checkbox="search-future-checkbox"
            :label="textNotVisible"
            :is-disabled="isSelectValidity && 'true'!==validity"
            @update:text-init="updateIncludeHidden"
          />
        </div>
        <ClassicSelect
          v-if="isSelectValidity"
          :text-init="validity"
          @update:text-init="updateValidity"
          id-select="valid-episodes-select"
          :label="$t('Episodes to validate')+' :'"
          :display-label="true"
          classLabel="flex-shrink-0 me-1"
          class="d-flex align-items-center mt-3 mb-0"
          :options="[
            { title: $t('Display only episodes to validate'), value: 'false' },
            { title: $t('Display episodes to validate'), value: '' },
            { title: $t('Do not display episodes to validate'), value: 'true' },
          ]"
        />
        <ClassicCheckbox
          v-if="!isEmission"
          :text-init="onlyVideo"
          class="flex-shrink-0 mt-3"
          id-checkbox="only-video-checkbox"
          :label="$t('Show only episodes with video')"
          @update:text-init="updateOnlyVideo"
        />
      </fieldset>
      <SearchOrder
        :is-emission="isEmission"
        :sort="sort"
        @update:sort="updateSort"
      />
    </div>
  </div>
</template>

<script lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import { orgaComputed } from "../../mixins/orgaComputed";
import { useAuthStore } from "../../../stores/AuthStore";
import { useFilterStore } from "../../../stores/FilterStore";
import { rubriquesFilterParam } from "../../mixins/routeParam/rubriquesFilterParam";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { defineComponent, defineAsyncComponent } from "vue";
import { mapState } from "pinia";
import { useGeneralStore } from "../../../stores/GeneralStore";
const MonetizableFilter = defineAsyncComponent(
  () => import("./MonetizableFilter.vue"),
);
const CategorySearchFilter = defineAsyncComponent(
  () => import("./CategorySearchFilter.vue"),
);
const RubriqueFilter = defineAsyncComponent(
  () => import("./RubriqueFilter.vue"),
);
const ClassicSelect = defineAsyncComponent(
  () => import("../../form/ClassicSelect.vue"),
);
const ClassicCheckbox = defineAsyncComponent(
  () => import("../../form/ClassicCheckbox.vue"),
);
const DateFilter = defineAsyncComponent(() => import("./DateFilter.vue"));
const SearchOrder = defineAsyncComponent(() => import("./SearchOrder.vue"));
export default defineComponent({
  components: {
    MonetizableFilter,
    CategorySearchFilter,
    RubriqueFilter,
    ClassicCheckbox,
    DateFilter,
    SearchOrder,
    ChevronDownIcon,
    ClassicSelect
  },
  mixins: [orgaComputed, rubriquesFilterParam],
  props: {
    organisationId: { default: undefined, type: String },
    isEmission: { default: false, type: Boolean },
    includeHidden: { default: false, type: Boolean },
    sort: { default: "DATE", type: String },
    onlyVideo: { default: false, type: Boolean },
    monetisable: { default: "UNDEFINED", type: String },
    iabId: { default: undefined, type: Number },
    searchPattern: { default: "", type: String },
    fromDate: { default: undefined, type: String },
    toDate: { default: undefined, type: String },
    validity: { default: 'true', type: String },
    rubriqueFilter: {
      default: () => [],
      type: Array as () => Array<RubriquageFilter>,
    },
  },

  emits: [
    "update:toDate",
    "update:fromDate",
    "update:monetisable",
    "update:iabId",
    "update:sort",
    "update:includeHidden",
    "update:validity",
    "update:rubriqueFilter",
    "update:onlyVideo",
  ],
  data() {
    return {
      showFilters: false as boolean,
      firstLoaded: false as boolean,
    };
  },

  computed: {
    ...mapState(useGeneralStore, ["platformEducation"]),
    ...mapState(useFilterStore, ["filterIab", "filterRubrique"]),
    ...mapState(useAuthStore, [
      "isRoleProduction",
      "isRoleContribution",
      "isRoleAdmin",
    ]),
    organisationRight(): boolean {
      return this.isEditRights(this.organisationId);
    },
    organisation(): string | undefined {
      return this.organisationId ?? this.filterOrgaId;
    },
    textNotVisible(): string {
      return this.isEmission
        ? this.$t("Consider podcasts no visible")
        : this.$t("See podcasts no visible");
    },
    isSelectValidity(): boolean {
      return (
        undefined !== this.organisation &&
        this.organisationRight &&
        this.isRoleContribution &&
        !this.isPodcastmaker &&
        !this.isEmission &&
        this.includeHidden
      );
    },
  },
  watch: {
    organisation(): void {
      const hidden =
        undefined !== this.organisation &&
        this.organisationRight &&
        !this.isEmission;
      if (hidden !== this.includeHidden) {
        this.updateIncludeHidden(hidden);
      }
    },
    searchPattern(value: string): void {
      const search = value.trim();
      let valSort = "SCORE"
      if(search.length <= 3){
        valSort = this.isEmission? "LAST_PODCAST_DESC" : "DATE";
      }
      if (valSort !== this.sort) {
        this.$emit("update:sort", valSort);
      }
      this.updateRouteParam({
        q: search.length ? search : undefined,
        s: valSort,
      });
    },
  },
  methods: {
    updateMonetisable(value: string): void {
      this.$emit("update:monetisable", value);
      this.updateRouteParam({ m: "UNDEFINED" !== value ? value : undefined });
    },
    updateIab(value: number | undefined) {
      this.$emit("update:iabId", 0 !== value ? value : undefined);
      let filterIab = {};
      if (this.filterIab && this.filterIab.id !== value) {
        filterIab = { iabId: undefined };
      }
      this.updateRouteParam({
        ...{ i: value ? value.toString() : undefined },
        ...filterIab,
      });
    },
    updateSort(value: string) {
      this.$emit("update:sort", value);
      this.updateRouteParam({ s: value });
    },
    updateIncludeHidden(value: boolean) {
      this.$emit("update:includeHidden", value);
      this.updateRouteParam({ h: value.toString() });
    },
    updateValidity(value: boolean) {
      this.$emit("update:validity", value);
      this.updateRouteParam({ vl: value.toString() });
    },
    updateOnlyVideo(value: boolean) {
      this.$emit("update:onlyVideo", value);
      this.updateRouteParam({ v: value ? "true" : undefined });
    },
    updateDates(value: {
      from: string | undefined;
      to: string | undefined;
    }): void {
      this.$emit("update:fromDate", value.from);
      this.$emit("update:toDate", value.to);
      this.updateRouteParam({ from: value.from, to: value.to });
    },
    updateRubriquageFilter(value: Array<RubriquageFilter>) {
      this.$emit("update:rubriqueFilter", value);
      let filterRubriques = {};
      const valueString = this.stringifyRubriquesFilter(value);
      if (
        this.filterRubrique.length &&
        this.stringifyRubriquesFilter(this.filterRubrique) !== valueString
      ) {
        filterRubriques = { rubriquesId: undefined };
      }
      this.updateRouteParam({
        ...{ r: valueString.length ? valueString : undefined },
        ...filterRubriques,
      });
    },
    clickShowFilters(): void {
      if (!this.firstLoaded) {
        this.firstLoaded = true;
      }
      this.showFilters = !this.showFilters;
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .advanced-search-container {
    background: var(--octopus-background);
    display: flex;
    width: 100%;
    margin-bottom: 1rem;
    justify-content: space-around;

    @media (width <= 720px) {
      flex-wrap: wrap;
    }
  }
}
</style>