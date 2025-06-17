<template>
  <div
    v-if="organisation && rubriquageData"
    class="d-flex mt-3 align-items-center"
  >
    <ClassicCheckbox
      v-model:text-init="isRubriquage"
      class="flex-shrink-0"
      id-checkbox="search-rubriquage-checkbox"
      :label="t('By topic')"
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
        {{ t("Add a sort criterion by topic") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRubriquesFilterParam } from "../../composable/route/useRubriquesFilterParam";
import classicApi from "../../../api/classicApi";
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { useFilterStore } from "../../../stores/FilterStore";
import { defineAsyncComponent, ref, Ref, computed, watch, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
const RubriqueChoice = defineAsyncComponent(
  () => import("./RubriqueChoice.vue"),
);

//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
  rubriqueFilter: {
    default: () => [],
    type: Array as () => Array<RubriquageFilter>,
  },
})

//Emits
const emit = defineEmits(["update:rubriqueFilter", "warning"]);

//Data 
const isRubriquage = ref(false);
const internRubriqueFilter: Ref<Array<RubriquageFilter>> = ref([]);
const rubriquageData: Ref<Array<Rubriquage>> = ref([]);
const needToFetchRubrique = ref(false);

//Composables
const { t } = useI18n();
const { stringifyRubriquesFilter } = useRubriquesFilterParam();
const filterStore = useFilterStore();

//Computed
const organisation = computed(() => props.organisationId ? props.organisationId : filterStore.filterOrgaId);
const availableRubriquage = computed(() => getAvailableRubriquage(internRubriqueFilter.value));


//Watch
watch(organisation, () => {
  if (isRubriquage.value) {
    fetchTopics();
  } else {
    needToFetchRubrique.value = true;
  }
});
watch(()=>props.rubriqueFilter, () => {
  isRubriquage.value = 0 !== props.rubriqueFilter?.length;
  if (
    props.rubriqueFilter &&
    stringifyRubriquesFilter(internRubriqueFilter.value) !==
    stringifyRubriquesFilter(props.rubriqueFilter)
  ) {
    internRubriqueFilter.value = props.rubriqueFilter;
  }
}, {deep: true,immediate: true});
watch(isRubriquage, () => {
  if (needToFetchRubrique.value) {
    fetchTopics();
  }
  if (isRubriquage.value && 0 === internRubriqueFilter.value.length) {
    addFilter();
  }
  const value = isRubriquage.value ? internRubriqueFilter.value : [];
  if (
    stringifyRubriquesFilter(value) !==
    stringifyRubriquesFilter(props.rubriqueFilter)
  ) {
    emit("update:rubriqueFilter", value);
  }
});


onBeforeMount(()=>fetchTopics())

//Methods
function updateInternRubriqueFilter() {
  if (isRubriquage.value) {
    emit("update:rubriqueFilter", internRubriqueFilter.value);
  } else {
    isRubriquage.value = true;
  }
}
function addFilter(): void {
  if (availableRubriquage.value?.[0].rubriquageId) {
    internRubriqueFilter.value.push({
      rubriquageId: availableRubriquage.value[0].rubriquageId,
      rubriqueId: 0,
      nameRubriquage: rubriquageData.value[0].title,
      nameRubrique: "",
    });
    updateInternRubriqueFilter();
  }
}
function deleteRubriqueChoice(index: number): void {
  internRubriqueFilter.value.splice(index, 1);
  updateInternRubriqueFilter();
}
function getAvailableRubriquage(
  filterRubrique: Array<RubriquageFilter>,
): Array<Rubriquage> {
  if (filterRubrique.length) {
    const rubriquageIdToNotShow = filterRubrique.map((a) => a.rubriquageId);
    return rubriquageData.value.filter((element) => {
      if (element.rubriquageId) {
        return !rubriquageIdToNotShow.includes(element.rubriquageId);
      }
    });
  }
  return rubriquageData.value;
}
function getRubriquage(index: number) {
  const elementToNotShow = Array.from(internRubriqueFilter.value);
  elementToNotShow.splice(index, 1);
  return getAvailableRubriquage(elementToNotShow);
}
function updateRubrique(newValue: { rubriqueId: number; index: number }): void {
  const item = internRubriqueFilter.value[newValue.index];
  item.rubriqueId = newValue.rubriqueId;
  internRubriqueFilter.value.splice(newValue.index, 1, item);
  updateInternRubriqueFilter();
}
function updateRubriquage(newValue: { rubriquageId: number; index: number }): void {
  const item = internRubriqueFilter.value[newValue.index];
  item.rubriquageId = newValue.rubriquageId;
  internRubriqueFilter.value.splice(newValue.index, 1, item);
  updateInternRubriqueFilter();
}
async function fetchTopics(): Promise<void> {
  if (!organisation.value) return;
  needToFetchRubrique.value = false;
  const data = await classicApi.fetchData<Array<Rubriquage>>({
    api: 0,
    path: "rubriquage/find/" + organisation.value,
    specialTreatement: true,
  });
  rubriquageData.value = data.filter((element: Rubriquage) => {
    return element.rubriques.length;
  });
  if (0 === rubriquageData.value.length) {
    if (internRubriqueFilter.value.length) {
      internRubriqueFilter.value = [];
      updateInternRubriqueFilter();
      emit("warning");
    }
    return;
  }
  const internRubriqueFilterToUpdate = [];
  for (const filter of internRubriqueFilter.value) {
    const rubriquageExist = rubriquageData.value.find(
      (element) => element.rubriquageId === filter.rubriquageId,
    );
    if (rubriquageExist) {
      internRubriqueFilterToUpdate.push(filter);
    }
  }
  if (
    internRubriqueFilterToUpdate.length !== internRubriqueFilter.value.length
  ) {
    internRubriqueFilter.value = internRubriqueFilterToUpdate;
    updateInternRubriqueFilter();
    emit("warning");
  }
}
</script>
