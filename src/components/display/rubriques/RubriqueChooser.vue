<template>
  <ClassicMultiselect
    :id="id"
    ref="selectRubrique"
    :option-chosen="model"
    option-label="name"
    :display-label="displayLabel"
    :label="label ?? t('By rubric')"
    :text-danger="textDanger"
    :placeholder="t('Type string to filter by categories')"
    :max-element="maxElement"
    :multiple="multiple"
    :min-search-length="1"
    :width="width"
    :in-modal="inModal"
    :is-disabled="isDisabled"
    :no-deselect="noDeselect"
    @on-search="onSearchRubrique"
    @selected="onRubriqueSelected"
  />
</template>

<script setup lang="ts">
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import ClassicMultiselect from "../../form/ClassicMultiselect.vue";
import { computed, onMounted, Ref, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  defaultanswer: { default: "", type: String },
  width: { default: "100%", type: String },
  multiple: { default: false, type: Boolean },
  reset: { default: false, type: Boolean },
  allRubriques: { default: () => [], type: Array as () => Array<Rubrique> },
  rubriqueSelected: { default: undefined, type: Number },
  rubriqueSelectedArray: {
    default: undefined,
    type: Object as () => Array<number>,
  },
  id: { default: "rubrique-chooser", type: String },
  withoutRubrique: { default: false, type: Boolean },
  isDisabled: { default: false, type: Boolean },
  noDeselect: { default: true, type: Boolean },
  inModal: { default: false, type: Boolean },
  label:{default: undefined, type: String },
  displayLabel: { default: false, type: Boolean },
  textDanger :{ default: undefined, type: String },
})


//Emits
const emit = defineEmits([
  "update:rubriqueSelected",
  "update:rubriqueSelectedArray",
  "selected"
]);
//COmposables
const { t } = useI18n();


//Data 
const maxElement = ref(250);
const rubrique: Ref<Rubrique | undefined> = ref(undefined);
const rubriqueForArray: Ref<Array<Rubrique> | undefined> = ref([]);
const withoutItem: Ref<{
  name: string;
  rubriqueId: number;
}> = ref({ name: t("Without rubric"), rubriqueId: -1 });
const selectRubriqueRef = useTemplateRef('selectRubrique');


//Computed
const getDefaultRubrique = computed(() => {
  if ("" === props.defaultanswer) {
    return undefined;
  }
  return { name: props.defaultanswer, rubriqueId: 0 };
});
const rubriques = computed(() => {
  const rubriques = props.allRubriques;
  if (!getDefaultRubrique.value) {
    return rubriques;
  }
  if (props.withoutRubrique) {
    rubriques.unshift(withoutItem.value);
  }
  rubriques.unshift(getDefaultRubrique.value);
  return rubriques;
});

const model = computed({
  get(): Rubrique | Array<Rubrique> | undefined {
    return !props.multiple ? rubrique.value : rubriqueForArray.value;
  },
  set(value: Rubrique | Array<Rubrique> | undefined): void {
    if (!props.multiple) {
      rubrique.value = value as Rubrique | undefined;
      return;
    }
    rubriqueForArray.value = value as Array<Rubrique>;
  },
})


//Watch
watch(()=>props.rubriqueSelected, () => {
  if (props.rubriqueSelected) {
    initRubriqueSelected();
  } else {
    rubrique.value = getDefaultRubrique.value;
  }
}, {immediate: true});
watch(()=>props.reset, () => {
  rubrique.value = getDefaultRubrique.value;
});

onMounted(()=>initRubriqueArray())


//Methods
function onSearchRubrique(query: string): void {
  let tempRubriques = rubriques.value;
  if (query) {
    tempRubriques = tempRubriques.filter((item: Rubrique) => {
      return item.name.toUpperCase().includes(query.toUpperCase());
    });
  }
  (selectRubriqueRef?.value as InstanceType<typeof ClassicMultiselect>).afterSearch(tempRubriques, tempRubriques.length);
}
function onRubriqueSelected(rubrique: Rubrique | Array<Rubrique>): void {
  if (undefined !== props.rubriqueSelected) {
    emit("update:rubriqueSelected",(rubrique as Rubrique).rubriqueId);
  }
  if (undefined !== props.rubriqueSelectedArray) {
    const idsArray: Array<number> = [];
    (rubrique as Array<Rubrique>).forEach((el: Rubrique) => {
      idsArray.push(el.rubriqueId ?? 0);
    });
    emit("update:rubriqueSelectedArray", idsArray);
  } else {
    emit("selected", rubrique);
  }
}
function initRubriqueSelected(): void {
  rubrique.value =
    rubriques.value.find((el: Rubrique) => {
      return el.rubriqueId === props.rubriqueSelected;
    }) ?? getDefaultRubrique.value;
}
function initRubriqueArray(): void {
  if (!rubriqueForArray.value || !props.rubriqueSelectedArray) {
    return;
  }
  rubriqueForArray.value.length = 0;
  props.rubriqueSelectedArray.forEach((element: number) => {
    const item = rubriques.value.find((el: Rubrique) => {
      return el.rubriqueId === element;
    });
    if (rubriqueForArray.value && item) {
      rubriqueForArray.value.push(item);
    }
  });
}
</script>
