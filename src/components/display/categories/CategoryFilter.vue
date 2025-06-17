<template>
  <section
    v-show="isHeaderDisplay"
    class="header-img flex-column justify-content-end"
    :style="backgroundDisplay"
  >
    <h1 v-if="isHeaderDisplay" v-show="titleDisplay">
      {{ titleDisplay ?? t("Home") }}
    </h1>
    <div
      v-show="isDisplay"
      class="d-flex-low-importance flex-column justify-content-end"
    >
      <ol
        v-if="filterStore.filterIab || filterStore.filterRubrique.length"
        class="octopus-breadcrumb"
      >
        <li class="octopus-breadcrumb-li">
          <a href="#" @click="removeFilter(-1, $event)">{{ t("All") }}</a>
        </li>
        <li v-if="filterStore.filterIab" class="octopus-breadcrumb-li">
          {{ filterStore.filterIab.name }}
        </li>
        <li
          v-for="(filter, index) in filterStore.filterRubrique"
          :key="filter.rubriqueId"
          class="octopus-breadcrumb-li"
          :class="filterStore.filterRubrique.length - 1 === index ? 'active' : ''"
        >
          <a
            v-if="filterStore.filterRubrique.length - 1 !== index"
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
        v-if="!filterStore.filterIab && !rubriquageFilter.length"
        :is-filter="true"
        :is-display="isDisplay"
        @categories-length="checkIfCategories"
      />
      <RubriqueList
        v-else-if="
          isDisplay && rubriquageFilter.length !== filterStore.filterRubrique.length
        "
        :rubriquages="rubriquageFilter"
      />
    </div>
  </section>
  <section v-if="!isDisplay" class="category-filter-no-filter" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRubriquesFilterParam } from "../../composable/route/useRubriquesFilterParam";
import { useRouteUpdateParams } from "../../composable/route/useRouteUpdateParams";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { useFilterStore } from "../../../stores/FilterStore";
import { useGeneralStore } from "../../../stores/GeneralStore";
import { defineAsyncComponent, ref, computed, watch } from "vue";
import { Category } from "@/stores/class/general/category";
import { useRoute } from "vue-router";
const CategoryList = defineAsyncComponent(() => import("./CategoryList.vue"));
const RubriqueList = defineAsyncComponent(
  () => import("./../rubriques/RubriqueList.vue"),
);
const RubriqueChooser = defineAsyncComponent(
  () => import("../rubriques/RubriqueChooser.vue"),
);

//Data 
const isCategories = ref(false);

//Composables
const { t } = useI18n();
const { updateFiltersParam } = useRouteUpdateParams();
const { modifyRubriquesFilter } = useRubriquesFilterParam();
const generalStore = useGeneralStore();
const filterStore = useFilterStore();
const route = useRoute();

//Computed
const isDisplay = computed(() => {
  return (
    ("homePriv" === route.name ||
      "home" === route.name ||
      "podcasts" === route.name ||
      "emissions" === route.name) &&
    (isCategories.value ||
      undefined !== filterStore.filterIab ||
      0 !== filterStore.filterRubrique.length ||
      0 !== rubriquageFilter.value.length)
  );
});
const isHeaderDisplay = computed(() => {
  return (
    isDisplay.value ||
    "participants" === route.name ||
    "playlists" === route.name
  );
});
const rubriquageFilter = computed(() => filterStore.filterOrgaId ? filterStore.filterRubriquage : []);
const titleDisplay = computed(() => {
  switch (route.name) {
    case "podcasts":
      return t("All podcasts");
    case "emissions":
      return t("All emissions");
    case "participants":
      return t("All participants");
    case "playlists":
      return t("All playlists");
    default:
      return undefined;
  }
});
const backgroundDisplay = computed(() => {
  let imgName = "home";
    switch (route.name) {
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
});
const routeFilterIab = computed(() => route.query.iabId);
const routeRubriques = computed(() => route.query.rubriquesId);


//Watch
watch(routeFilterIab, () => {
  if (routeFilterIab.value && "string" === typeof routeFilterIab.value) {
    const iabId = parseInt(routeFilterIab.value, 10);
    const category = generalStore.storedCategories.filter((c: Category) => {
      return c.id === iabId;
    });
    if (category.length) {
      filterStore.filterUpdateIab(category[0]);
    }
  } else {
    filterStore.filterUpdateIab();
  }
}, {deep: true, immediate: true});
watch(routeRubriques, () => {
  if (0 === filterStore.filterRubriquage.length) {
    return;
  }
  const rubriquesFilter: Array<RubriquageFilter> = [];
  if (
    route.query.rubriquesId &&
    "string" === typeof route.query.rubriquesId
  ) {
    const arrayFilter = route.query.rubriquesId.split(",");
    const filterLength = arrayFilter.length;
    for (let index = 0; index < filterLength; index++) {
      const rubriqueFilter = arrayFilter[index].split(":");
      const rubriquage = filterStore.filterRubriquage.find((x: Rubriquage) => {
        return x.rubriquageId === parseInt(rubriqueFilter[0]);
      });
      if (rubriquage) {
        const rubrique = rubriquage.rubriques.find((x: Rubrique) => {
          return x.rubriqueId === parseInt(rubriqueFilter[1]);
        });
        rubriquesFilter.push({
          rubriquageId: rubriquage.rubriquageId,
          rubriqueId: rubrique?.rubriqueId,
          nameRubriquage: rubriquage.title,
          nameRubrique: rubrique?.name,
        });
      }
    }
  }
  filterStore.filterUpdateRubrique(rubriquesFilter);
}, {deep: true, immediate: true});


//Methods
function checkIfCategories(length: number): void {
  isCategories.value = 0 !== length;
}
function onRubriqueSelected(index: number, rubrique: Rubrique): void {
  if (
    !rubrique ||
    filterStore.filterRubrique[index].rubriqueId === rubrique.rubriqueId
  ) {
    return;
  }
  modifyRubriquesFilter((a) => {
    a[index].rubriqueId = rubrique.rubriqueId ?? 0;
    return a;
  });
}
function getRubriques(rubriquageId: number): Array<Rubrique> {
  const rubriquage = filterStore.filterRubriquage.find((x: Rubriquage) => {
    return x.rubriquageId === rubriquageId;
  });
  return rubriquage ? rubriquage.rubriques : [];
}
function getRubriquesLength(rubriquageId: number): number {
  const rubriquage = filterStore.filterRubriquage.find((x: Rubriquage) => {
    return x.rubriquageId === rubriquageId;
  });
  return rubriquage ? rubriquage.rubriques.length : 0;
}
function removeFilter(index: number, event?: { preventDefault: () => void }): void {
  if (filterStore.filterIab) {
    if (route.query.iabId) {
      updateFiltersParam({ iabId: undefined }, { i: undefined });
    }
  } else {
    modifyRubriquesFilter((a) => {
      a.splice(index + 1);
      return a;
    });
  }
  if (event) {
    event.preventDefault();
  }
}
</script>
<style lang="scss">
.octopus-app {
  .header-img {
    display: flex;
    min-height: 10rem;
    background-size: cover;
    background-position: center;

    h1 {
      margin: auto 1rem;
      font-size: 2rem;
      color: white;
    }

    @media (width <= 960px) {
      min-height: 6rem;
    }
  }

  .octopus-breadcrumb {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    padding: 1rem;

    .octopus-breadcrumb-li {
      display: flex;
      align-items: center;
      list-style: none;
      color: white !important;

      a {
        color: white !important;
        font-weight: bold;
      }

      &::after {
        content: "-";
        margin: 0 0.5rem;
      }

      &:last-child {
        &::after {
          content: "";
        }
      }
    }
  }
}
</style>
