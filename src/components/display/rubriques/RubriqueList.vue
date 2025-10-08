<template>
  <div class="d-inline-flex w-100 mb-3 px-3 hide-phone">
    <div ref="rubriqueListContainer" class="rubrique-list-container">

      <!-- Liste déroulante pour sélectionner le rubriquage -->
      <select
        v-model="rubriquage"
        :title="t('By topic')"
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

      <!-- Boutons de sélection de la rubrique -->
      <button
        v-for="rubrique in rubriqueDisplay"
        :id="'rubrique' + rubrique.rubriqueId"
        :key="rubrique.rubriqueId"
        class="btn btn-primary btn-on-dark m-1"
        @click="addFilter(rubrique)"
      >
        {{ rubrique.name }}
      </button>
    </div>

    <!-- Bouton pour afficher les rubriques cachées -->
    <button
      v-show="hidenRubriques.length"
      id="rubriques-dropdown"
      class="btn btn-primary btn-on-dark m-1"
      :title="t('See more')"
    >
      <PlusIcon />
    </button>

    <!-- Popup de sélection des rubriques cachées -->
    <ClassicPopover
      ref="popoverRubrique"
      target="rubriques-dropdown"
      :only-click="true"
      :left-pos="true"
    >
      <RubriqueChooser
        v-if="hidenRubriques.length"
        class="rubrique-chooser-minwidth"
        :all-rubriques="hidenRubriques"
        :placeholder="rubriqueChooserText"
        @selected="addFilterFromPopover($event)"
      />
    </ClassicPopover>
  </div>
</template>

<script setup lang="ts">
import PlusIcon from "vue-material-design-icons/Plus.vue";
import { useRubriquesFilterParam } from "../../composable/route/useRubriquesFilterParam";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { useFilterStore } from "../../../stores/FilterStore";
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, Ref, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
const RubriqueChooser = defineAsyncComponent(
  () => import("../rubriques/RubriqueChooser.vue"),
);

//Props 
const props = defineProps({
  rubriquages: { default: () => [], type: Array as () => Array<Rubriquage> },
})

//Data 
const hidenRubriques: Ref<Array<Rubrique>> = ref([]);
const rubriquage: Ref<Rubriquage | undefined> = ref(undefined);
const popoverRubriqueRef = useTemplateRef('popoverRubrique');
const rubriqueListContainerRef = useTemplateRef('rubriqueListContainer');


//Composables
const { t } = useI18n();
const { modifyRubriquesFilter } = useRubriquesFilterParam();
const filterStore = useFilterStore();


//Computed
const rubriqueDisplay = computed(() => {
  return filterStore.filterRubriqueDisplay.filter(
    (rubrique: Rubrique) => 0 !== rubrique.podcastCount,
  );
});
const rubriquageDisplay = computed(() => {
  const elementToNotShow = Array.from(filterStore.filterRubrique);
  if (elementToNotShow.length) {
    const rubriquageIdToNotShow = elementToNotShow.map(
      (a) => a.rubriquageId,
    );
    return props.rubriquages.filter((element) => {
      if (!element.rubriquageId) {
        return;
      }
      return !rubriquageIdToNotShow.includes(element.rubriquageId);
    });
  }
  return Array.from(props.rubriquages).toSorted((a,b) => {
    if(a.title > b.title){
      return 1;
    }
    return (b.title > a.title) ? -1 : 0;
  });
});

// Retourne le texte à afficher dans le RubriqueChooser
const rubriqueChooserText = computed(() => {
  if (!rubriquage.value) {
    return '';
  }
  let topic = rubriquage.value.title;
  return t('Enter name of topic', { topic });
});


//Watch
watch(()=>filterStore.filterRubrique, () => {
  selectNewRubriquage()
}, {deep: true});

onMounted(()=>selectNewRubriquage())

onBeforeUnmount(()=> window.removeEventListener("resize", resizeWindow))


//Methods
function initRubriques(): void {
  filterStore.filterUpdateRubriqueDisplay(rubriquage.value?.rubriques ?? []);
  window.addEventListener("resize", resizeWindow);
  nextTick(() => {
    resizeWindow();
  });
}
function addFilterFromPopover(rubrique: Rubrique): void {
  const popover = popoverRubriqueRef?.value as InstanceType<typeof ClassicPopover>;
  popover.clearClick();
  addFilter(rubrique);
}
function addFilter(rubrique: Rubrique): void {
  if (!rubriquage.value) {
    return;
  }
  const filterToAdd = {
    rubriquageId: rubriquage.value.rubriquageId ?? 0,
    rubriqueId: rubrique.rubriqueId ?? 0,
    nameRubriquage: rubriquage.value.title,
    nameRubrique: rubrique.name,
  };
  modifyRubriquesFilter((a) => {
    a.push(filterToAdd);
    return a;
  });
  selectNewRubriquage();
}
function selectNewRubriquage() {
  const rubriquageLength = props.rubriquages.length;
  if (rubriquageLength === filterStore.filterRubrique.length) {
    return;
  }
  let index = 0;
  const rubriquageAlreadyFilter = filterStore.filterRubrique.map(
    (a) => a.rubriquageId,
  );
  for (index; index < rubriquageLength; index++) {
    const rubriquageIdIndex = props.rubriquages[index].rubriquageId;
    if (
      rubriquageIdIndex &&
      !rubriquageAlreadyFilter.includes(rubriquageIdIndex)
    ) {
      break;
    }
  }
  rubriquage.value = props.rubriquages[index];
  initRubriques();
}
function resizeWindow(): void {
  const rubriqueList = rubriqueListContainerRef?.value as HTMLElement;
  if (null === rubriqueList) {
    return;
  }
  rubriqueList.style.justifyContent = "flex-start";
  hidenRubriques.value.length = 0;
  rubriqueDisplay.value.forEach((element: Rubrique) => {
    const el = rubriqueList.querySelector('#rubrique' + element.rubriqueId);
    if (!el) return;
    if (el.classList.contains("hid")) {
      el.classList.remove("hid");
    }
  });
  rubriqueDisplay.value.forEach((element: Rubrique) => {
    const el = rubriqueList.querySelector('#rubrique' + element.rubriqueId);
    if (!el) return;
    const parent = el.parentElement;
    if (
      null !== parent &&
      el.offsetLeft + el.clientWidth <= parent.clientWidth - 20
    ) {
      return;
    }
    hidenRubriques.value.push(element);
    if (!el.classList.contains("hid")) {
      el.className += " hid";
    }
  });
  if (!hidenRubriques.value.length) {
    rubriqueList.style.justifyContent = "center";
  }
}
function onRubriquageSelected() {
  initRubriques();
}
</script>

<style lang="scss">
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
      border-radius: var(--octopus-border-radius);
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

    @media (width <= 500px) {
      min-width: 90vw;
    }
  }
}
</style>
