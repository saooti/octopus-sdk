<template>
  <div
    v-if="organisation && rubriquageData"
    class="d-flex mt-3 align-items-center"
  >
    <ClassicCheckbox
      v-model:text-init="isRubriquage"
      class="flex-shrink-0"
      id-checkbox="search-rubriquage-checkbox"
      :label="$t('By topic')"
    />
    <div v-if="isRubriquage" class="d-flex ms-1 flex-column flex-grow-1">
      <RubriqueChoice
        v-for="(filter, index) in internRubriqueFilter"
        :key="index"
        :index="index"
        :rubriquage-display="getRubriquage(index)"
        :rubrique-id-selected="filter.rubriqueId"
        :rubriquage-id-selected="filter.rubriquageId"
        :no-deselect="true"
        @update-rubrique="updateRubrique"
        @update-rubriquage="updateRubriquage"
        @delete-rubrique-choice="deleteRubriqueChoice(index)"
      />
      <button
        v-if="availableRubriquage.length"
        class="btn mt-2"
        @click="addFilter"
      >
        {{ $t("Add a sort criterion by topic") }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { useRubriquesFilterParam } from "../../composable/route/useRubriquesFilterParam";
import classicApi from "../../../api/classicApi";
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { useFilterStore } from "../../../stores/FilterStore";
import { mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
const RubriqueChoice = defineAsyncComponent(
  () => import("./RubriqueChoice.vue"),
);
export default defineComponent({
  components: {
    RubriqueChoice,
    ClassicCheckbox,
  },
  props: {
    organisationId: { default: undefined, type: String },
    rubriqueFilter: {
      default: () => [],
      type: Array as () => Array<RubriquageFilter>,
    },
  },
  emits: ["update:rubriqueFilter", "warning"],

  setup(){
    const { stringifyRubriquesFilter } = useRubriquesFilterParam();
    return { stringifyRubriquesFilter }
  },

  data() {
    return {
      isRubriquage: false as boolean,
      internRubriqueFilter: [] as Array<RubriquageFilter>,
      rubriquageData: [] as Array<Rubriquage>,
      needToFetchRubrique: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterRubrique", "filterOrgaId"]),
    organisation(): string | undefined {
      return this.organisationId ? this.organisationId : this.filterOrgaId;
    },
    availableRubriquage(): Array<Rubriquage> {
      return this.getAvailableRubriquage(this.internRubriqueFilter);
    },
  },
  watch: {
    organisation(): void {
      if (this.isRubriquage) {
        this.fetchTopics();
      } else {
        this.needToFetchRubrique = true;
      }
    },
    rubriqueFilter: {
      immediate: true,
      deep: true,
      handler() {
        this.isRubriquage = 0 !== this.rubriqueFilter?.length;
        if (
          this.rubriqueFilter &&
          this.stringifyRubriquesFilter(this.internRubriqueFilter) !==
            this.stringifyRubriquesFilter(this.rubriqueFilter)
        ) {
          this.internRubriqueFilter = this.rubriqueFilter;
        }
      },
    },
    isRubriquage(): void {
      if (this.needToFetchRubrique) {
        this.fetchTopics();
      }
      if (this.isRubriquage && 0 === this.internRubriqueFilter.length) {
        this.addFilter();
      }
      const value = this.isRubriquage ? this.internRubriqueFilter : [];
      if (
        this.stringifyRubriquesFilter(value) !==
        this.stringifyRubriquesFilter(this.rubriqueFilter)
      ) {
        this.$emit("update:rubriqueFilter", value);
      }
    },
  },

  created() {
    this.fetchTopics();
  },
  methods: {
    updateInternRubriqueFilter() {
      if (this.isRubriquage) {
        this.$emit("update:rubriqueFilter", this.internRubriqueFilter);
      } else {
        this.isRubriquage = true;
      }
    },
    addFilter(): void {
      if (this.availableRubriquage?.[0].rubriquageId) {
        this.internRubriqueFilter.push({
          rubriquageId: this.availableRubriquage[0].rubriquageId,
          rubriqueId: 0,
          nameRubriquage: this.rubriquageData[0].title,
          nameRubrique: "",
        });
        this.updateInternRubriqueFilter();
      }
    },
    deleteRubriqueChoice(index: number): void {
      this.internRubriqueFilter.splice(index, 1);
      this.updateInternRubriqueFilter();
    },
    getAvailableRubriquage(
      filterRubrique: Array<RubriquageFilter>,
    ): Array<Rubriquage> {
      if (filterRubrique.length) {
        const rubriquageIdToNotShow = filterRubrique.map((a) => a.rubriquageId);
        return this.rubriquageData.filter((element) => {
          if (element.rubriquageId) {
            return !rubriquageIdToNotShow.includes(element.rubriquageId);
          }
        });
      }
      return this.rubriquageData;
    },
    getRubriquage(index: number) {
      const elementToNotShow = Array.from(this.internRubriqueFilter);
      elementToNotShow.splice(index, 1);
      return this.getAvailableRubriquage(elementToNotShow);
    },
    updateRubrique(newValue: { rubriqueId: number; index: number }): void {
      const item = this.internRubriqueFilter[newValue.index];
      item.rubriqueId = newValue.rubriqueId;
      this.internRubriqueFilter.splice(newValue.index, 1, item);
      this.updateInternRubriqueFilter();
    },
    updateRubriquage(newValue: { rubriquageId: number; index: number }): void {
      const item = this.internRubriqueFilter[newValue.index];
      item.rubriquageId = newValue.rubriquageId;
      this.internRubriqueFilter.splice(newValue.index, 1, item);
      this.updateInternRubriqueFilter();
    },
    async fetchTopics(): Promise<void> {
      if (!this.organisation) return;
      this.needToFetchRubrique = false;
      const data = await classicApi.fetchData<Array<Rubriquage>>({
        api: 0,
        path: "rubriquage/find/" + this.organisation,
        specialTreatement: true,
      });
      this.rubriquageData = data.filter((element: Rubriquage) => {
        return element.rubriques.length;
      });
      if (0 === this.rubriquageData.length) {
        if (this.internRubriqueFilter.length) {
          this.internRubriqueFilter = [];
          this.updateInternRubriqueFilter();
          this.$emit("warning");
        }
        return;
      }
      const internRubriqueFilterToUpdate = [];
      for (const filter of this.internRubriqueFilter) {
        const rubriquageExist = this.rubriquageData.find(
          (element) => element.rubriquageId === filter.rubriquageId,
        );
        if (rubriquageExist) {
          internRubriqueFilterToUpdate.push(filter);
        }
      }
      if (
        internRubriqueFilterToUpdate.length !== this.internRubriqueFilter.length
      ) {
        this.internRubriqueFilter = internRubriqueFilterToUpdate;
        this.updateInternRubriqueFilter();
        this.$emit("warning");
      }
    },
  },
});
</script>
