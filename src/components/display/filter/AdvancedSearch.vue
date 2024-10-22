<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <button
      class="d-flex justify-content-center align-items-center mb-3 text-secondary btn-transparent"
      @click="clickShowFilters"
    >
      <div>{{ $t("Advanced filters") }}</div>
      <div
        class="saooti-down mx-1"
        :class="{ 'arrow-transform': showFilters }"
      />
    </button>
    <div
      v-if="firstLoaded"
      v-show="showFilters"
      class="advanced-search-container"
    >
      <div class="d-flex flex-column">
        <div class="text-primary mb-2">
          {{ $t("Filter") }}
        </div>
        <MonetizableFilter
          v-if="!isPodcastmaker && !isEducation"
          :is-emission="isEmission"
          @update-monetization="updateMonetization"
        />
        <CategorySearchFilter @update-category="updateCategory" />
        <RubriqueFilter
          :reset-rubriquage="resetRubriquage"
          :organisation-id="organisationId"
          @update-rubriquage-filter="updateRubriquageFilter"
        />
        <DateFilter
          :is-emission="isEmission"
          @update-to-date="updateToDate"
          @update-from-date="updateFromDate"
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
        <div v-if="isCheckboxNotValidate" class="d-flex flex-column mt-3">
          <ClassicCheckbox
            v-model:textInit="isNotValidate"
            class="flex-shrink-0"
            id-checkbox="search-not-validate-checkbox"
            :label="textNotValidate"
          />
        </div>
        <ClassicCheckbox
          v-if="!isEmission"
          :text-init="onlyVideo"
          class="flex-shrink-0 mt-3"
          id-checkbox="only-video-checkbox"
          :label="$t('Show only episodes with video')"
          @update:text-init="$emit('update:onlyVideo', $event)"
        />
      </div>
      <div class="d-flex flex-column">
        <div class="text-primary mb-2">
          {{ $t("Sort") }}
        </div>
        <SearchOrder
          :is-emission="isEmission"
          :sort-criteria="sortCriteria"
          @update-sort-criteria="updateSortCriteria"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { orgaComputed } from "../../mixins/orgaComputed";
import { useAuthStore } from "../../../stores/AuthStore";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { defineComponent, defineAsyncComponent } from "vue";
import { mapState } from "pinia";
const MonetizableFilter = defineAsyncComponent(
  () => import("./MonetizableFilter.vue"),
);
const CategorySearchFilter = defineAsyncComponent(
  () => import("./CategorySearchFilter.vue"),
);
const RubriqueFilter = defineAsyncComponent(
  () => import("./RubriqueFilter.vue"),
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
  },
  mixins: [orgaComputed],
  props: {
    organisationId: { default: undefined, type: String },
    isEmission: { default: false, type: Boolean },
    resetRubriquage: { default: false, type: Boolean },
    isEducation: { default: false, type: Boolean },
    includeHidden: { default: false, type: Boolean },
    sortCriteria: { default: "DATE", type: String },
    onlyVideo: { default: false, type: Boolean },
  },

  emits: [
    "updateToDate",
    "updateFromDate",
    "updateMonetization",
    "updateCategory",
    "updateSortCriteria",
    "includeHidden",
    "notValid",
    "updateRubriquageFilter",
    "update:onlyVideo",
  ],
  data() {
    return {
      isNotVisible: this.includeHidden,
      isNotValidate: false as boolean,
      showFilters: false as boolean,
      firstLoaded: false as boolean,
    };
  },

  computed: {
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
    isCheckboxNotValidate(): boolean {
      return (
        undefined !== this.organisation &&
        this.organisationRight &&
        this.isRoleContribution &&
        !this.isPodcastmaker &&
        !this.isEmission &&
        this.isNotVisible
      );
    },
    textNotValidate(): string {
      return this.isRoleProduction
        ? this.$t("Display all podcasts to validate")
        : this.$t("Display my podcasts to validate");
    },
  },
  watch: {
    organisation(): void {
      this.isNotVisible =
        undefined !== this.organisation &&
        this.organisationRight &&
        !this.isEmission;
    },
    isNotVisible(): void {
      this.$emit("includeHidden", this.isNotVisible);
    },
    isNotValidate(): void {
      this.$emit("notValid", this.isNotValidate);
    },
  },
  methods: {
    clickShowFilters(): void {
      if (!this.firstLoaded) {
        this.firstLoaded = true;
      }
      this.showFilters = !this.showFilters;
    },
    updateFromDate(value: string): void {
      this.$emit("updateFromDate", value);
    },
    updateToDate(value: string): void {
      this.$emit("updateToDate", value);
    },
    updateMonetization(value: string): void {
      this.$emit("updateMonetization", value);
    },
    updateCategory(value: number) {
      this.$emit("updateCategory", 0 !== value ? value : undefined);
    },
    updateRubriquageFilter(value: Array<RubriquageFilter>) {
      this.$emit("updateRubriquageFilter", value);
    },
    updateSortCriteria(value: string) {
      this.$emit("updateSortCriteria", value);
    },
  },
});
</script>
