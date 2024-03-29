<template>
  <div
    v-if="organisationId && rubriquageData"
    class="d-flex mt-3 align-items-center"
  >
    <ClassicCheckbox
      v-model:textInit="isRubriquage"
      class="flex-shrink-0"
      id-checkbox="search-rubriquage-checkbox"
      :label="$t('By topic')"
    />
    <div v-if="isRubriquage" class="d-flex ms-1 flex-column mb-2 flex-grow-1">
      <RubriqueChoice
        v-for="(filter, index) in arrayFilter"
        :key="index"
        :index="index"
        class="mb-2"
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
import octopusApi from "@saooti/octopus-api";
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState, mapActions } from "pinia";
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
    resetRubriquage: { default: false, type: Boolean },
    modifyFilter: { default: true, type: Boolean },
    initRubriqueFilter: {
      default: undefined,
      type: Array as () => Array<RubriquageFilter>,
    },
  },
  emits: ["updateRubriquageFilter", "warning"],

  data() {
    return {
      isRubriquage: false as boolean,
      rubriquageId: [] as Array<number>,
      rubriqueId: [] as Array<number>,
      arrayFilter: [] as Array<RubriquageFilter>,
      rubriquageData: [] as Array<Rubriquage>,
      saveOrganisation: "" as string,
      isInit: true as boolean,
      isInternChanged: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterRubrique", "filterOrgaId"]),
    organisation(): string | undefined {
      return this.organisationId ? this.organisationId : this.filterOrgaId;
    },
    availableRubriquage(): Array<Rubriquage> {
      if (this.arrayFilter.length) {
        const rubriquageIdToNotShow = this.arrayFilter.map(
          (a) => a.rubriquageId,
        );
        return this.rubriquageData.filter((element) => {
          if (element.rubriquageId) {
            return !rubriquageIdToNotShow.includes(element.rubriquageId);
          }
        });
      }
      return this.rubriquageData;
    },
  },
  watch: {
    organisation(): void {
      if (this.isRubriquage) {
        this.fetchTopics(true);
      }
    },
    isRubriquage(): void {
      if (this.isInternChanged || this.isInit) {
        return;
      }
      this.isInternChanged = true;
      if (
        0 === this.arrayFilter.length &&
        this.availableRubriquage[0].rubriquageId
      ) {
        this.arrayFilter.push({
          rubriquageId: this.availableRubriquage[0].rubriquageId,
          rubriqueId: 0,
          nameRubriquage: this.rubriquageData[0].title,
          nameRubrique: "",
        });
      }
      if (this.isRubriquage) {
        if (this.saveOrganisation !== this.organisation) {
          this.fetchTopics(true);
        }
        this.$emit("updateRubriquageFilter", this.arrayFilter);
      } else {
        this.$emit("updateRubriquageFilter", []);
      }
      if (this.modifyFilter) {
        this.resetRubriqueFilter();
      }
      this.$nextTick(() => {
        this.isInternChanged = false;
      });
    },
    arrayFilter: {
      deep: true,
      handler() {
        if (this.isInternChanged || this.isInit) {
          return;
        }
        this.isInternChanged = true;
        if (this.modifyFilter) {
          this.resetRubriqueFilter();
        }
        if (this.isRubriquage) {
          this.$emit("updateRubriquageFilter", this.arrayFilter);
        }
        this.$nextTick(() => {
          this.isInternChanged = false;
        });
      },
    },
    filterRubrique: {
      deep: true,
      async handler() {
        if (this.isInternChanged || !this.modifyFilter) {
          return;
        }
        this.isInternChanged = true;
        if (this.saveOrganisation !== this.filterOrgaId) {
          await this.fetchTopics(false);
        }
        if (this.filterRubrique.length) {
          this.arrayFilter = Array.from(this.filterRubrique);
          this.isRubriquage = true;
        } else if (this.rubriquageData[0].rubriquageId) {
          this.arrayFilter = [
            {
              rubriquageId: this.rubriquageData[0].rubriquageId,
              rubriqueId: 0,
              nameRubriquage: this.rubriquageData[0].title,
              nameRubrique: "",
            },
          ];
          this.isRubriquage = false;
        }
        this.$emit(
          "updateRubriquageFilter",
          this.isRubriquage ? this.arrayFilter : [],
        );
        this.$nextTick(() => {
          this.isInternChanged = false;
        });
      },
    },
    resetRubriquage(): void {
      this.isRubriquage = false;
    },
  },

  created() {
    if (!this.modifyFilter) {
      if (this.initRubriqueFilter && this.initRubriqueFilter.length > 0) {
        this.arrayFilter = Array.from(this.initRubriqueFilter);
        this.isRubriquage = true;
      }
    } else if (this.filterRubrique.length) {
      this.arrayFilter = Array.from(this.filterRubrique);
      this.isRubriquage = true;
    }
    this.fetchTopics(false);
    this.$nextTick(() => {
      this.isInit = false;
    });
  },
  methods: {
    ...mapActions(useFilterStore, ["filterUpdateRubrique"]),
    deleteRubriqueChoice(index: number): void {
      this.arrayFilter.splice(index, 1);
    },
    getRubriquage(index: number) {
      const elementToNotShow = Array.from(this.arrayFilter);
      elementToNotShow.splice(index, 1);
      if (elementToNotShow.length) {
        const rubriquageIdToNotShow = elementToNotShow.map(
          (a) => a.rubriquageId,
        );
        return this.rubriquageData.filter((element) => {
          if (element.rubriquageId) {
            return !rubriquageIdToNotShow.includes(element.rubriquageId);
          }
        });
      }
      return this.rubriquageData;
    },
    addFilter(): void {
      if (this.availableRubriquage[0].rubriquageId) {
        this.arrayFilter.push({
          rubriquageId: this.availableRubriquage[0].rubriquageId,
          rubriqueId: 0,
          nameRubriquage: this.rubriquageData[0].title,
          nameRubrique: "",
        });
      }
    },
    updateRubrique(newValue: { rubriqueId: number; index: number }): void {
      const item = this.arrayFilter[newValue.index];
      item.rubriqueId = newValue.rubriqueId;
      this.arrayFilter.splice(newValue.index, 1, item);
    },
    updateRubriquage(newValue: { rubriquageId: number; index: number }): void {
      const item = this.arrayFilter[newValue.index];
      item.rubriquageId = newValue.rubriquageId;
      this.arrayFilter.splice(newValue.index, 1, item);
    },
    async fetchTopics(initArrayFilter: boolean): Promise<void> {
      if (initArrayFilter) {
        this.arrayFilter.length = 0;
      }
      if (!this.organisation) return;
      const data = await octopusApi.fetchDataWithParams<Array<Rubriquage>>(
        0,
        "rubriquage/find/" + this.organisation,
        {},
        true,
      );
      this.rubriquageData = data.filter((element: Rubriquage) => {
        return element.rubriques.length;
      });
      this.saveOrganisation = this.organisation;
      if (0 === this.rubriquageData.length) return;

      if (initArrayFilter && this.rubriquageData[0].rubriquageId) {
        this.arrayFilter.push({
          rubriquageId: this.rubriquageData[0].rubriquageId,
          rubriqueId: 0,
          nameRubriquage: this.rubriquageData[0].title,
          nameRubrique: "",
        });
      } else {
        const arrayFilterToUpdate = [];
        for (const filter of this.arrayFilter) {
          const rubriquageExist = this.rubriquageData.find(
            (element) => element.rubriquageId === filter.rubriquageId,
          );
          if (rubriquageExist) {
            arrayFilterToUpdate.push(filter);
          }
        }
        if (arrayFilterToUpdate.length !== this.arrayFilter.length) {
          this.arrayFilter = arrayFilterToUpdate;
          this.$emit("warning");
        }
      }
    },
    resetRubriqueFilter(): void {
      if (
        0 === this.filterRubrique.length ||
        this.isInit ||
        !this.modifyFilter
      ) {
        return;
      }
      const queries = this.$route.query;
      if (queries.rubriquesId) {
        this.$router.replace({
          query: { ...queries, ...{ rubriquesId: undefined } },
        });
      }
      this.filterUpdateRubrique([]);
    },
  },
});
</script>
