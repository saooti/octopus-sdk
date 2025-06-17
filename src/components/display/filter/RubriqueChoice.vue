<template>
  <div class="d-flex align-items-center mb-2">
    <ClassicSelect
      :text-init="rubriquageIdSelected"
      id-select="rubrique-choice-select"
      :label="t('Topics')"
      :display-label="false"
      class="flex-shrink-0"
      :options="rubriquageDisplayForSelect"
      @update:text-init="onRubriquageSelected(parseInt($event, 10))"
    />
    <template v-if="rubriquageIdSelected">
      <div class="ms-3 flex-shrink-0">
        {{ t("By rubric") }}
      </div>
      <RubriqueChooser
        v-if="getRubriquesLength(rubriquageIdSelected)"
        :id="'rubrique-chooser'+rubriquageIdSelected"
        class="ms-2"
        :multiple="false"
        :rubrique-selected="
          0 !== rubriqueIdSelected ? rubriqueIdSelected : undefined
        "
        :all-rubriques="getRubriques(rubriquageIdSelected)"
        :defaultanswer="t('No rubric filter')"
        :reset="reset"
        :without-rubrique="true"
        @selected="onRubriqueSelected"
      />
    </template>
    <button
      v-if="index"
      class="btn admin-button ms-1"
      title="delete"
      @click="deleteRubriquage"
    >
      <TrashCanIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import ClassicSelect from "../../form/ClassicSelect.vue";
import TrashCanIcon from "vue-material-design-icons/TrashCan.vue";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { defineAsyncComponent, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
const RubriqueChooser = defineAsyncComponent(
  () => import("../rubriques/RubriqueChooser.vue"),
);

//Props 
const props = defineProps({
  rubriquageDisplay: {
    default: () => [],
    type: Array as () => Array<Rubriquage>,
  },
  rubriquageIdSelected: { default: 0, type: Number },
  rubriqueIdSelected: { default: 0, type: Number },
  index: { default: 0, type: Number },
})

//Emits
const emit = defineEmits(["deleteRubriqueChoice", "updateRubrique", "updateRubriquage"]);

//Data 
const reset = ref(false);

//Composables
const { t } = useI18n();


//Computed
const rubriquageDisplayForSelect = computed(() => {
  return props.rubriquageDisplay.map((rubriquage) => {
    return { title: rubriquage.title, value: rubriquage.rubriquageId };
  });
});

//Methods
function deleteRubriquage() {
  emit("deleteRubriqueChoice");
}
function getRubriquesLength(rubriquageId: number): number {
  return getRubriques(rubriquageId).length;
}
function getRubriques(rubriquageId: number): Array<Rubrique> {
  const topicIndex = props.rubriquageDisplay.findIndex(
    (element: Rubriquage) => element.rubriquageId === rubriquageId,
  );
  return -1 !== topicIndex? props.rubriquageDisplay[topicIndex].rubriques: [];
}
function onRubriqueSelected(rubrique: Rubrique): void {
  if (rubrique.rubriqueId === props.rubriqueIdSelected) return;
  emit("updateRubrique", {
    rubriqueId: rubrique.rubriqueId,
    index: props.index,
  });
}
function onRubriquageSelected(newRubriquage: number): void {
  reset.value = !reset.value;
  emit("updateRubriquage", {
    rubriquageId: newRubriquage,
    rubriqueId:0,
    index: props.index,
  });
}
</script>
