<template>
  <div class="d-inline-flex w-100 mb-3 px-3 hide-phone">
    <div ref="rubriqueListContainer" class="rubrique-list-container">
      <label for="rubrique-list-select" class="hid">{{ $t("By topic") }}</label>
      <select
        id="rubrique-list-select"
        v-model="rubriquage"
        class="c-hand"
        @change="onRubriquageSelected"
      >
        <option
          v-for="myRubriquage in rubriquageDisplay"
          :key="myRubriquage.rubriquageId"
          :value="myRubriquage"
        >
          {{ myRubriquage.title }}
        </option>
      </select>
      <button
        v-for="rubrique in rubriqueDisplay"
        :ref="'rubrique' + rubrique.rubriqueId"
        :key="rubrique.rubriqueId"
        class="btn btn-primary btn-on-dark m-1"
        @click="addFilter(rubrique)"
      >
        {{ rubrique.name }}
      </button>
    </div>
    <button
      v-show="hidenRubriques.length"
      id="rubriques-dropdown"
      class="btn btn-primary btn-on-dark m-1 saooti-more"
      :title="$t('See more')"
    />
    <ClassicPopover
      ref="popoverRubrique"
      target="rubriques-dropdown"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
    >
      <RubriqueChooser
        v-if="hidenRubriques.length"
        class="rubrique-chooser-minwidth"
        :rubriquage-id="rubriquage.rubriquageId"
        :all-rubriques="hidenRubriques"
        @selected="addFilterFromPopover($event)"
      />
    </ClassicPopover>
  </div>
</template>

<script lang="ts">
import ClassicPopover from "../../misc/ClassicPopover.vue";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { useFilterStore } from "../../../stores/FilterStore";
import { mapState, mapActions } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
const RubriqueChooser = defineAsyncComponent(
  () => import("../rubriques/RubriqueChooser.vue"),
);
export default defineComponent({
  name: "RubriqueList",

  components: {
    ClassicPopover,
    RubriqueChooser,
  },

  props: {
    rubriquages: { default: () => [], type: Array as () => Array<Rubriquage> },
  },

  data() {
    return {
      hidenRubriques: [] as Array<Rubrique>,
      rubriques: [] as Array<Rubrique>,
      rubriquage: undefined as Rubriquage | undefined,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterRubrique", "filterRubriqueDisplay"]),
    rubriqueDisplay(): Array<Rubrique> {
      return this.filterRubriqueDisplay.filter(
        (rubrique: Rubrique) => 0 !== rubrique.podcastCount,
      );
    },
    rubriquageDisplay(): Array<Rubriquage> {
      const elementToNotShow = Array.from(this.filterRubrique);
      if (elementToNotShow.length) {
        const rubriquageIdToNotShow = elementToNotShow.map(
          (a) => a.rubriquageId,
        );
        return this.rubriquages.filter((element) => {
          if (!element.rubriquageId) {
            return;
          }
          return !rubriquageIdToNotShow.includes(element.rubriquageId);
        });
      }
      return this.rubriquages;
    },
  },
  watch: {
    filterRubrique: {
      deep: true,
      handler() {
        this.selectNewRubriquage();
      },
    },
  },

  mounted() {
    this.selectNewRubriquage();
  },
  beforeUnmount(): void {
    window.removeEventListener("resize", this.resizeWindow);
  },
  methods: {
    ...mapActions(useFilterStore, [
      "filterUpdateRubrique",
      "filterUpdateRubriqueDisplay",
    ]),
    initRubriques(): void {
      if (!this.rubriquage) {
        return;
      }
      this.filterUpdateRubriqueDisplay(this.rubriquage.rubriques);
      window.addEventListener("resize", this.resizeWindow);
      this.$nextTick(() => {
        this.resizeWindow();
      });
    },
    addFilterFromPopover(rubrique: Rubrique): void {
      (this.$refs.popoverRubrique as InstanceType<typeof Popover>).clearClick();
      this.addFilter(rubrique);
    },
    addFilter(rubrique: Rubrique): void {
      if (!this.rubriquage) {
        return;
      }
      const filterToAdd = {
        rubriquageId: this.rubriquage.rubriquageId ?? 0,
        rubriqueId: rubrique.rubriqueId ?? 0,
        nameRubriquage: this.rubriquage.title,
        nameRubrique: rubrique.name,
      };
      const newFilter: Array<RubriquageFilter> = Array.from(
        this.filterRubrique,
      );
      newFilter.push(filterToAdd);
      this.filterUpdateRubrique(newFilter);
      const queries = this.$route.query;
      const queryString = newFilter
        .map((value) => value.rubriquageId + ":" + value.rubriqueId)
        .join();
      this.$router.replace({
        query: { ...queries, ...{ rubriquesId: queryString } },
      });
      this.selectNewRubriquage();
    },
    selectNewRubriquage() {
      const rubriquageLength = this.rubriquages.length;
      if (rubriquageLength === this.filterRubrique.length) {
        return;
      }
      let index = 0;
      const rubriquageAlreadyFilter = this.filterRubrique.map(
        (a) => a.rubriquageId,
      );
      for (index; index < rubriquageLength; index++) {
        const rubriquageIdIndex = this.rubriquages[index].rubriquageId;
        if (
          rubriquageIdIndex &&
          !rubriquageAlreadyFilter.includes(rubriquageIdIndex)
        ) {
          break;
        }
      }
      this.rubriquage = this.rubriquages[index];
      this.initRubriques();
    },
    resizeWindow(): void {
      const rubriqueList = this.$refs.rubriqueListContainer as HTMLElement;
      if (null === rubriqueList) {
        return;
      }
      rubriqueList.style.justifyContent = "flex-start";
      this.hidenRubriques.length = 0;
      this.rubriqueDisplay.forEach((element: Rubrique) => {
        const el = (
          this.$refs["rubrique" + element.rubriqueId] as Array<HTMLElement>
        )[0];
        if (!el) return;
        if (el.classList.contains("hid")) {
          el.classList.remove("hid");
        }
      });
      this.rubriqueDisplay.forEach((element: Rubrique) => {
        const el = (
          this.$refs["rubrique" + element.rubriqueId] as Array<HTMLElement>
        )[0];
        if (!el) return;
        const parent = el.parentElement;
        if (
          null !== parent &&
          el.offsetLeft + el.clientWidth <= parent.clientWidth - 20
        ) {
          return;
        }
        this.hidenRubriques.push(element);
        if (!el.classList.contains("hid")) {
          el.className += " hid";
        }
      });
      if (!this.hidenRubriques.length) {
        rubriqueList.style.justifyContent = "center";
      }
    },
    onRubriquageSelected() {
      this.initRubriques();
    },
  },
});
</script>

<style lang="scss">
@use '@scss/variables' as octopusVariables;
.octopus-app {
  .rubrique-list-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
    flex-grow: 1;
    width: 0;
    padding: 0 4rem;
    select {
      width: auto;
      border-radius: octopusVariables.$octopus-borderradius;
      margin: 0.25rem;
      font-size: 0.6rem;
      padding: 0.5rem;
    }
  }
  #popoverrubriques-dropdown {
    overflow: initial !important;
  }
  .rubrique-chooser-minwidth {
    min-width: 400px;
    @media (max-width: 500px) {
      min-width: 90vw;
    }
  }
}
</style>
