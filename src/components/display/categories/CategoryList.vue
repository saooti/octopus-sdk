<template>
  <div
    v-if="categories.length"
    class="d-inline-flex w-100 mb-3 ps-3 pe-3 category-list hide-phone"
  >
    <div ref="categoryListContainer" class="category-list-container">
      <button
        v-for="category in categories"
        :id="'category' + category.id"
        :key="category.id"
        class="btn btn-primary btn-on-dark m-1"
        @click="checkIfFilter(category)"
      >
        {{ category.name }}
      </button>
    </div>
    <button
      v-show="hidenCategories.length"
      id="categories-dropdown"
      class="btn btn-primary btn-on-dark m-1"
      :title="t('See more')"
    >
      <PlusIcon />
    </button>
    <ClassicPopover
      target="categories-dropdown"
      :only-click="true"
      :left-pos="true"
    >
      <button
        v-for="category in hidenCategories"
        :key="category.id"
        class="me-3 octopus-dropdown-item"
        @keydown.enter="checkIfFilter(category)"
        @mousedown="checkIfFilter(category)"
      >
        {{ category.name }}
      </button>
    </ClassicPopover>
  </div>
</template>

<script setup lang="ts">
import PlusIcon from "vue-material-design-icons/Plus.vue";
import { useRouteUpdateParams } from "../../composable/route/useRouteUpdateParams";
import classicApi from "../../../api/classicApi";
import { state } from "../../../stores/ParamSdkStore";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import { Category } from "@/stores/class/general/category";
import { useFilterStore } from "../../../stores/FilterStore";
import { useGeneralStore } from "../../../stores/GeneralStore";
import { computed, nextTick, onMounted, onUnmounted, Ref, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

//Props 
const props = defineProps({
  isFilter: { default: false, type: Boolean },
  isDisplay: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["categoriesLength"]);

//Data 
const hidenCategories: Ref<Array<Category>> = ref([]);
const categoryListRef = useTemplateRef('categoryListContainer');

//Composables
const { t, locale } = useI18n();
const { updateFiltersParam } = useRouteUpdateParams();
const generalStore = useGeneralStore();
const filterStore = useFilterStore();
const router = useRouter();
const route = useRoute();

//Computed
const categories = computed(() => {
  let arrayCategories: Array<Category> = [];
  if (filterStore.filterOrgaId) {
    arrayCategories = generalStore.storedCategoriesOrga.filter((c: Category) => {
      return c.podcastOrganisationCount;
    });
  } else {
    arrayCategories = generalStore.storedCategories.filter((c: Category) => {
      if (state.generalParameters.podcastmaker) return c.podcastOrganisationCount;
      return c.podcastCount;
    });
  }
  emit("categoriesLength", arrayCategories.length);
  return arrayCategories;
});
const watchVariable = computed(() => `${props.isDisplay}|${categories.value}`);
const reloadVariable = computed(() => `${filterStore.filterOrgaId}|${generalStore.storedCategories}`);


//Watch
watch(watchVariable, () => {
  nextTick(() => {
    resizeWindow();
  });
}, {deep: true, immediate: true});
watch(reloadVariable, () => {
  if (filterStore.filterOrgaId) {
    fetchCategories(filterStore.filterOrgaId);
  }
}, {deep: true, immediate: true});


onMounted(()=>window.addEventListener("resize", resizeWindow))
onUnmounted(()=>window.removeEventListener("resize", resizeWindow))


//Methods
function checkIfFilter(category: Category): void {
  if (!props.isFilter) {
    router.push({
      name: "category",
      params: { iabId: category.id.toString() },
    });
    return;
  }
  const queries = route.query;
  if (
    !queries.iabId ||
    ("string" === typeof queries.iabId &&
      parseInt(queries.iabId, 10) !== category.id)
  ) {
    updateFiltersParam(
      { iabId: category.id.toString() },
      { i: category.id.toString() },
    );
  }
}
function resizeWindow(): void {
  const categoryList = categoryListRef?.value as HTMLElement;
  if (null === categoryList || !categoryList) {
    return;
  }
  categoryList.style.justifyContent = "flex-start";
  hidenCategories.value.length = 0;
  categories.value.forEach((element: Category) => {
    const el = categoryList.querySelector('#category' + element.id);
    if (!el) return;
    if (el.classList.contains("hid")) {
      el.classList.remove("hid");
    }
  });
  categories.value.forEach((element: Category) => {
    const el = categoryList.querySelector('#category' + element.id);
    if (!el) return;
    const parent = el.parentElement;
    if (
      parent &&
      el.offsetLeft + el.clientWidth <= parent.clientWidth - 20
    ) {
      return;
    }
    hidenCategories.value.push(element);
    if (!el.classList.contains("hid")) {
      el.className += " hid";
    }
  });
  if (!hidenCategories.value.length) {
    categoryList.style.justifyContent = "center";
  }
}
async function fetchCategories(organisationId: string): Promise<void> {
  const data = await classicApi.fetchData<Array<Category>>({
    api: 0,
    path: `iab/list/${organisationId}`,
    parameters: { lang: locale.value },
  });
  generalStore.storedUpdateCategoriesOrga(data);
}
</script>
<style lang="scss">
.octopus-app {
  .category-list-container {
    display: inline-flex;
    justify-content: flex-start;
    overflow: hidden;
    flex-grow: 1;
    width: 0;
  }
}
</style>
