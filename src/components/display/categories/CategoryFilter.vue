<template>
  <section
    v-show="isHeaderDisplay"
    class="header-img flex-column justify-content-end"
    :style="backgroundDisplay"
  >
    <h1 v-if="isHeaderDisplay" v-show="titleDisplay">
      {{ titleDisplay ?? $t("Home") }}
    </h1>
    <div
      v-show="isDisplay"
      class="d-flex-low-importance flex-column justify-content-end"
    >
      <ol
        v-if="filterIab || filterRubrique.length"
        class="octopus-breadcrumb d-flex align-items-center justify-content-center flex-wrap"
      >
        <li class="octopus-breadcrumb-li">
          <a href="#" @click="removeFilter(-1, $event)">{{ $t("All") }}</a>
        </li>
        <li v-if="filterIab" class="octopus-breadcrumb-li">
          {{ filterIab.name }}
        </li>
        <li
          v-for="(filter, index) in filterRubrique"
          :key="filter.rubriqueId"
          class="d-flex align-items-center octopus-breadcrumb-li"
          :class="filterRubrique.length - 1 === index ? 'active' : ''"
        >
          <a
            v-if="filterRubrique.length - 1 !== index"
            href="#"
            @click="removeFilter(index, $event)"
            >{{ filter.nameRubriquage }}</a
          >
          <div v-else class="fw-bold">
            {{ filter.nameRubriquage }}
          </div>
          <div class="mx-1">:</div>
          <RubriqueChooser
            v-if="getRubriquesLength(filter.rubriquageId)"
            :id="'rubrique-chooser'+filter.rubriquageId"
            class="ms-2 multiselect-transparent multiselect-white"
            :multiple="false"
            :rubrique-selected="filter.rubriqueId"
            :all-rubriques="getRubriques(filter.rubriquageId)"
            width="auto"
            @selected="onRubriqueSelected(index, $event)"
          />
        </li>
      </ol>
      <CategoryList
        v-if="!filterIab && !rubriquageFilter.length"
        :is-filter="true"
        :is-display="isDisplay"
        @categories-length="checkIfCategories"
      />
      <RubriqueList
        v-else-if="
          isDisplay && rubriquageFilter.length !== filterRubrique.length
        "
        :rubriquages="rubriquageFilter"
      />
    </div>
  </section>
  <section v-if="!isDisplay" class="category-filter-no-filter" />
</template>

<script lang="ts">
import { rubriquesFilterParam } from "../../mixins/routeParam/rubriquesFilterParam";
import { routeParams } from "../../mixins/routeParam/routeParams";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { useFilterStore } from "../../../stores/FilterStore";
import { useGeneralStore } from "../../../stores/GeneralStore";
import { mapState, mapActions } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import { Category } from "@/stores/class/general/category";
const CategoryList = defineAsyncComponent(() => import("./CategoryList.vue"));
const RubriqueList = defineAsyncComponent(
  () => import("./../rubriques/RubriqueList.vue"),
);
const RubriqueChooser = defineAsyncComponent(
  () => import("../rubriques/RubriqueChooser.vue"),
);
export default defineComponent({
  name: "CategoryFilter",
  components: {
    CategoryList,
    RubriqueList,
    RubriqueChooser,
  },
  mixins: [routeParams, rubriquesFilterParam],
  data() {
    return {
      isCategories: false as boolean,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ["storedCategories"]),
    ...mapState(useFilterStore, [
      "filterIab",
      "filterRubrique",
      "filterRubriquage",
      "filterOrgaId",
    ]),
    isDisplay(): boolean {
      return (
        ("homePriv" === this.$route.name ||
          "home" === this.$route.name ||
          "podcasts" === this.$route.name ||
          "emissions" === this.$route.name) &&
        (this.isCategories ||
          undefined !== this.filterIab ||
          0 !== this.filterRubrique.length ||
          0 !== this.rubriquageFilter.length)
      );
    },
    isHeaderDisplay() {
      return (
        this.isDisplay ||
        "participants" === this.$route.name ||
        "playlists" === this.$route.name
      );
    },
    rubriquageFilter(): Array<Rubriquage> {
      return this.filterOrgaId ? this.filterRubriquage : [];
    },
    titleDisplay(): string | undefined {
      switch (this.$route.name) {
        case "podcasts":
          return this.$t("All podcasts");
        case "emissions":
          return this.$t("All emissions");
        case "participants":
          return this.$t("All participants");
        case "playlists":
          return this.$t("All playlists");
        default:
          return undefined;
      }
    },
    backgroundDisplay(): string {
      let imgName = "home";
      switch (this.$route.name) {
        case "podcasts":
          imgName = "podcasts";
          break;
        case "emissions":
          imgName = "emissions";
          break;
        case "participants":
          imgName = "intervenants";
          break;
        case "playlists":
          imgName = "playlists";
          break;
        default:
          break;
      }
      return `background-image: url('/img/header-${imgName}.webp');`;
    },
    routeFilterIab() {
      return this.$route.query.iabId;
    },
    routeRubriques() {
      return this.$route.query.rubriquesId;
    },
  },
  watch: {
    routeFilterIab: {
      deep: true,
      immediate: true,
      async handler() {
        if (this.routeFilterIab && "string" === typeof this.routeFilterIab) {
          const iabId = parseInt(this.routeFilterIab, 10);
          const category = this.storedCategories.filter((c: Category) => {
            return c.id === iabId;
          });
          if (category.length) {
            this.filterUpdateIab(category[0]);
          }
        } else {
          this.filterUpdateIab();
        }
      },
    },
    routeRubriques: {
      deep: true,
      immediate: true,
      async handler() {
        if (0 === this.filterRubriquage.length) {
          return;
        }
        const rubriquesFilter: Array<RubriquageFilter> = [];
        if (
          this.$route.query.rubriquesId &&
          "string" === typeof this.$route.query.rubriquesId
        ) {
          const arrayFilter = this.$route.query.rubriquesId.split(",");
          const filterLength = arrayFilter.length;
          for (let index = 0; index < filterLength; index++) {
            const rubriqueFilter = arrayFilter[index].split(":");
            const rubriquage = this.filterRubriquage.find((x: Rubriquage) => {
              return x.rubriquageId === parseInt(rubriqueFilter[0]);
            });
            if (rubriquage) {
              const rubrique = rubriquage.rubriques.find((x: Rubrique) => {
                return x.rubriqueId === parseInt(rubriqueFilter[1]);
              });
              rubriquesFilter.push({
                rubriquageId: rubriquage.rubriquageId,
                rubriqueId: rubrique.rubriqueId,
                nameRubriquage: rubriquage.title,
                nameRubrique: rubrique.name,
              });
            }
          }
        }
        this.filterUpdateRubrique(rubriquesFilter);
      },
    },
  },
  methods: {
    ...mapActions(useFilterStore, ["filterUpdateIab", "filterUpdateRubrique"]),
    checkIfCategories(length: number): void {
      this.isCategories = 0 !== length;
    },
    onRubriqueSelected(index: number, rubrique: Rubrique): void {
      if (
        !rubrique ||
        this.filterRubrique[index].rubriqueId === rubrique.rubriqueId
      ) {
        return;
      }
      this.modifyRubriquesFilter((a) => {
        a[index].rubriqueId = rubrique.rubriqueId ?? 0;
        return a;
      });
    },
    getRubriques(rubriquageId: number): Array<Rubrique> {
      const rubriquage = this.filterRubriquage.find((x: Rubriquage) => {
        return x.rubriquageId === rubriquageId;
      });
      return rubriquage ? rubriquage.rubriques : [];
    },
    getRubriquesLength(rubriquageId: number): number {
      const rubriquage = this.filterRubriquage.find((x: Rubriquage) => {
        return x.rubriquageId === rubriquageId;
      });
      return rubriquage ? rubriquage.rubriques.length : 0;
    },
    removeFilter(index: number, event?: { preventDefault: () => void }): void {
      if (this.filterIab) {
        if (this.$route.query.iabId) {
          this.updateFiltersParam({ iabId: undefined }, { i: undefined });
        }
      } else {
        this.modifyRubriquesFilter((a) => {
          a.splice(index + 1);
          return a;
        });
      }
      if (event) {
        event.preventDefault();
      }
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .header-img {
    display: flex;
    min-height: 10rem;
    background-size: cover;
    background-position: center;
    h1 {
      margin: auto 1rem auto;
      font-size: 2rem;
      color: white;
    }
    @media (max-width: 960px) {
      min-height: 6rem;
    }
  }
  .octopus-breadcrumb {
    padding: 1rem;
    align-items: center;
    .octopus-breadcrumb-li {
      list-style: none;
      color: white !important;
      a {
        color: white !important;
        font-weight: bold;
      }
      &:after {
        content: "-";
        margin: 0 0.5rem;
      }
      &:last-child {
        &:after {
          content: "";
        }
      }
    }
  }
}
</style>
