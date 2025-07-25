<template>
  <ClassicMultiselect
    :id="idClassicMultiselect"
    ref="selectCategory"
    :option-chosen="model"
    option-label="name"
    :display-label="displayLabel"
    :label="label ?? t('By category')"
    :text-danger="textDanger"
    :placeholder="t('Type string to filter by categories')"
    :max-element="maxElement"
    :in-modal="inModal"
    :multiple="multiple"
    :min-search-length="1"
    :width="width"
    :height="height"
    :is-disabled="isDisabled"
    :no-deselect="noDeselect"
    :display-required="displayRequired"
    :popover="popover"
    :popover-relative-class="popoverRelativeClass"
    @on-search="onSearchCategory"
    @selected="onCategorySelected"
  />
</template>

<script setup lang="ts">
import { useGeneralStore } from "../../../stores/GeneralStore";
import ClassicMultiselect from "../../form/ClassicMultiselect.vue";
import { Category } from "@/stores/class/general/category";
import { computed, onMounted, Ref, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  defaultanswer: { default: "", type: String },
  width: { default: "100%", type: String },
  height: { default: undefined, type: String },
  multiple: { default: false, type: Boolean },
  isDisabled: { default: false, type: Boolean },
  initCategories: {
    default: undefined,
    type: Array as () => Array<Category>,
  },
  displayAllCategories: { default: false, type: Boolean },
  categorySelected: { default: undefined, type: Number },
  categorySelectedArray: {
    default: undefined,
    type: Array as () => Array<number>,
  },
  inModal: { default: false, type: Boolean },
  noDeselect: { default: true, type: Boolean },
  label:{default: undefined, type: String },
  displayLabel: { default: false, type: Boolean },
  textDanger :{ default: undefined, type: String },
  displayRequired: { default: false, type: Boolean },
  popover: { default: undefined, type: String },
  popoverRelativeClass: { default: undefined, type: String },
})

//Emits
const emit = defineEmits([
  "update:categorySelected",
  "update:categorySelectedArray",
  "selected"
]);


//Data 
const maxElement = ref(50);
const category: Ref<Category | undefined> = ref(undefined);
const categoryForArray: Ref<Array<Category> | undefined> = ref([]);
const selectCategoryRef=useTemplateRef('selectCategory');

//Composables
const { t } = useI18n();
const generalStore = useGeneralStore();


//Computed
const categoriesChosen = computed(() => {
  if (props.initCategories) {
    return props.initCategories;
  }
  return generalStore.storedCategories;
});
const categoriesOrdered = computed(() => {
  let allCategoriesOrdered = categoriesChosen.value.toSorted(
    (a: Category, b: Category) => (a.name > b.name ? 1 : -1),
  );
  if (!props.displayAllCategories) {
    allCategoriesOrdered = allCategoriesOrdered.filter((c: Category) => {
      return c.podcastCount;
    });
  }
  if (getDefaultCategory.value) {
    allCategoriesOrdered.unshift(getDefaultCategory.value);
  }
  return allCategoriesOrdered;
});
const getDefaultCategory = computed(() => {
  if ("" === props.defaultanswer) {
    return undefined;
  }
  return { id: 0, name: props.defaultanswer };
});
const idClassicMultiselect = computed(() => {
  if (props.multiple) return "categoryChooser" + props.multiple;
  return "categoryChooser";
});
const model = computed({
  get(): Category | Array<Category> | undefined {
    return props.multiple ? categoryForArray.value :category.value;
  },
  set(value: Category | Array<Category> | undefined): void {
    if (!props.multiple) {
      category.value = value as Category | undefined;
      return;
    }
    categoryForArray.value = value as Array<Category> | undefined;
  },
});


//Watch
watch(()=>props.categorySelected, async () => {
  if (props.categorySelected) {
    initCategorySelected();
  } else {
    category.value = getDefaultCategory.value;
  }
}, {immediate: true});


onMounted(()=>initCategoryArray())


//Methods
async function onSearchCategory(query?: string): Promise<void> {
  let categories = categoriesOrdered.value;
  if (query) {
    categories = categories.filter((item: Category) => {
      return item.name.toUpperCase().includes(query.toUpperCase());
    });
  }
  (selectCategoryRef?.value as InstanceType<typeof ClassicMultiselect>).afterSearch(categories, categories.length);
}
function onCategorySelected(category: Category | Array<Category>): void {
  if (undefined !== props.categorySelected) {
    emit("update:categorySelected", (category as Category).id);
  } else if (undefined !== props.categorySelectedArray) {
    const idsArray: Array<number> = [];
    (category as Array<Category>).forEach((el: Category) => {
      idsArray.push(el.id);
    });
    emit("update:categorySelectedArray", idsArray);
  } else {
    emit("selected", category);
  }
}
function initCategorySelected(): void {
  category.value =
    categoriesChosen.value.find((el: Category) => {
      return el.id === props.categorySelected;
    }) ?? getDefaultCategory.value;
}
function initCategoryArray(): void {
  if (!categoryForArray.value || !props.categorySelectedArray) {
    return;
  }
  categoryForArray.value.length = 0;
  props.categorySelectedArray.forEach((element: number) => {
    const item = categoriesChosen.value.find((el: Category) => {
      return el.id === element;
    });
    if (categoryForArray.value && item) {
      categoryForArray.value.push(item);
    }
  });
}
</script>
