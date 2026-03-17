<template>
  <div class="podcast-inline-container">
    <div class="d-flex align-items-center" :class="podcastId ? 'mb-4' : 'mb-2'">
      <component :is="titleTag" class="mb-0">
        {{ title }}
      </component>
    </div>

    <div v-if="!podcastId" class="d-flex justify-content-between">
      <div v-if="!noSort" class="d-flex">
        <button
          class="btn btn-underline"
          :class="{ active: !popularSort }"
          @click="sortChrono()"
        >
          {{ t("Last added") }}
        </button>
        <button
          class="btn btn-underline"
          :class="{ active: popularSort }"
          @click="sortPopular()"
        >
          {{ t("Most popular") }}
        </button>
      </div>
      <div v-if="displayArrow" class="hide-phone">
        <button
          class="btn admin-button m-1"
          :class="{ disabled: !previousAvailable }"
          :title="t('Display previous')"
          @click="displayPrevious()"
        >
          <ChevronLeftIcon :size="30" />
        </button>
        <button
          class="btn admin-button m-1"
          :class="{ disabled: !nextAvailable }"
          :title="t('Display next')"
          @click="displayNext()"
        >
          <ChevronRightIcon :size="30" />
        </button>
      </div>
    </div>
    <slot name="list-inline" />
    <router-link
      v-if="buttonText"
      class="btn btn-primary align-self-center w-fit-content m-4"
      :to="refTo"
      @click="handleSeeMoreButton"
    >
      {{ buttonText }}
      <PlusIcon v-if="buttonPlus" :size="16" class="ms-1" />
    </router-link>
  </div>
</template>

<script setup lang="ts">
import PlusIcon from "vue-material-design-icons/Plus.vue";
import ChevronLeftIcon from "vue-material-design-icons/ChevronLeft.vue";
import ChevronRightIcon from "vue-material-design-icons/ChevronRight.vue";
import { useRubriquesFilterComputed } from "../../composable/route/useRubriquesFilterComputed";
import { useRubriquesFilterParam } from "../../composable/route/useRubriquesFilterParam";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFilterStore } from "../../../stores/FilterStore";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  displayArrow: { default: true, type: Boolean },
  previousAvailable: { default: false, type: Boolean },
  nextAvailable: { default: false, type: Boolean },
  popularSort: { default: false, type: Boolean },
  buttonText: { default: undefined, type: String },
  buttonPlus: { default: false, type: Boolean },
  title: { default: "", type: String },
  href: { default: undefined, type: String },
  iabId: { default: undefined, type: Number },
  rubriqueId: { default: () => [], type: Array as () => Array<number> },
  noRubriquageId: { default: () => [], type: Array as () => Array<number> },
  podcastId: { default: undefined, type: Number },
  titleTag: { default: "h2", type: String },
  /** Hide sort options */
  noSort: { default: false, type: Boolean }
})

//Emits
const emit = defineEmits(["sortChrono", "sortPopular", "displayPrevious", "displayNext"]);

//Composables
const { t } = useI18n();
const { returnRubriquesFilter } = useRubriquesFilterParam();
const { rubriqueQueryParam } = useRubriquesFilterComputed();
const filterStore = useFilterStore();
const router = useRouter();
const route = useRoute();


//Computed
const refTo = computed(() => {
  if (props.href) return props.href;
  if (props.iabId) {
    return {
      name: "category",
      params: { iabId: props.iabId },
    };
  }
  return {
    name: "podcasts",
    query: {
      iabId: filterStore.filterIab?.id,
      rubriquesId: rubriqueQueryParam.value,
      productor: filterStore.filterOrgaId
    },
  };
});

//Methods
function sortChrono(): void {
  emit("sortChrono");
}
function sortPopular(): void {
  emit("sortPopular");
}
function displayPrevious(): void {
  emit("displayPrevious");
}
function displayNext(): void {
  emit("displayNext");
}
function handleSeeMoreButton(event: { preventDefault: () => void }) {
  if (props.href ||
    !props.rubriqueId ||
    0 === props.rubriqueId.length ||
    props.noRubriquageId.length
  ) {
    return;
  }
  event.preventDefault();
  const rubriqueChosenId = props.rubriqueId.at(-1);
  let filterToAdd: RubriquageFilter|undefined;
  if (filterStore.filterRubriquage.length) {
    for (let i = 0, len = filterStore.filterRubriquage.length; i < len; i++) {
      const rubriqueChosen = filterStore.filterRubriquage[i].rubriques.find(
        (element: Rubrique) => element.rubriqueId === rubriqueChosenId,
      );
      if (rubriqueChosen) {
        filterToAdd = {
          rubriquageId: filterStore.filterRubriquage[i].rubriquageId ?? 0,
          rubriqueId: rubriqueChosenId,
          nameRubriquage: filterStore.filterRubriquage[i].title,
          nameRubrique: rubriqueChosen.name,
        };
        break;
      }
    }
  }
  if(!filterToAdd){return;}
  const queries = returnRubriquesFilter((a) => {
    const indexRubriquage = a.findIndex(filter => filter.rubriquageId === filterToAdd.rubriquageId);
    if (indexRubriquage === -1) {
      a.push(filterToAdd);
    } else {
      a[indexRubriquage] = filterToAdd;
    }
    return a;
  })
  router.push({
    name: "podcasts",
    query: {...route.query, ...queries}
  });
}
</script>
<style lang="scss">
.octopus-app .podcast-inline-container {
  display: flex;
  flex-direction: column;
  padding: 1rem;

  @media (width <= 450px) {
    padding: 1rem 0;
  }
}
</style>
