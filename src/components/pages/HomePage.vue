<template>
  <section class="page-box">
    <template v-if="0 === rubriquageFilter.length">
      <ClassicLazy
        v-for="(c, index) in categories"
        :key="c.id"
        :min-height="0"
        :init-render-delay="2 < index ? 1000 : 0"
      >
        <PodcastInlineList
          style="min-height: 650px"
          :iab-id="c.id"
          :title="c.name"
          :button-text="t('All podcast button', { name: c.name })"
        />
        <template #preview>
          <div style="min-height: 650px"></div>
        </template>
      </ClassicLazy>
    </template>
    <template v-else>
      <ClassicLazy
        v-for="(r, index) in rubriqueToShow"
        :key="r.rubriqueId"
        :min-height="0"
        :init-render-delay="2 < index ? 1000 : 0"
      >
        <PodcastInlineList
          style="min-height: 650px"
          :rubrique-id="rubriqueId.concat(r.rubriqueId)"
          :title="r.name"
          :href="rubriqueMorePath? rubriqueMorePath+r.rubriqueId: undefined"
          :button-text="t('All podcast button', { name: r.name })"
        />
        <template #preview>
          <div style="min-height: 650px"></div>
        </template>
      </ClassicLazy>
      <template v-if="rubriqueDisplay && rubriqueDisplay.length > 0">
        <router-link
          v-if="rubriqueDisplay.length >= rubriqueMaxDisplay"
          :to="{
            name: 'podcasts',
            query: {
              iabId: filterStore.filterIab?.id,
              rubriquesId: rubriqueQueryParam,
              productor: filterStore.filterOrgaId
            },
          }"
          class="btn btn-primary align-self-center w-fit-content mt-5 m-auto"
        >
          {{ t("See more") }}
        </router-link>
        <PodcastInlineList
          v-else-if="displayWithoutRubriques"
          :no-rubriquage-id="[rubriqueDisplay[0].rubriquageId]"
          :rubrique-id="rubriqueId"
          :title="t('Without rubric')"
          :button-text="
            t('All podcast button', { name: t('Without rubric') })
          "
        />
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { useRubriquesFilterComputed } from "../composable/route/useRubriquesFilterComputed";
import PodcastInlineList from "../display/podcasts/PodcastInlineList.vue";
import ClassicLazy from "../misc/ClassicLazy.vue";
import { state } from "../../stores/ParamSdkStore";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { useFilterStore } from "../../stores/FilterStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { computed, Ref, ref, watch } from "vue";
import { Category } from "@/stores/class/general/category";
import { useI18n } from "vue-i18n";

//Props
defineProps({
  displayWithoutRubriques: { default: true, type: Boolean },
  rubriqueMorePath: { default: undefined, type: String },
})

//Data
const rubriqueId: Ref<Array<number>> = ref([]);
const rubriqueMaxDisplay = ref(20);


//Emits
const emit = defineEmits(["categoriesLength"]);
  

//Composables
const { t } = useI18n();
const { rubriqueQueryParam } = useRubriquesFilterComputed();
const generalStore = useGeneralStore();
const filterStore = useFilterStore();



//Computed
const rubriqueDisplay = computed(() => {
  return filterStore.filterRubriqueDisplay.filter(
    (rubrique: Rubrique) => 0 !== rubrique.podcastCount,
  );
});
const rubriqueToShow = computed(() => {
  if (
    !rubriqueDisplay.value ||
    rubriqueDisplay.value.length < rubriqueMaxDisplay.value
  ) {
    return rubriqueDisplay.value ?? [];
  }
  return rubriqueDisplay.value.slice(0, rubriqueMaxDisplay.value);
});
const rubriquageFilter = computed(() => {
  return filterStore.filterOrgaId ? filterStore.filterRubriquage : [];
});
const categories = computed(() => {
  let arrayCategories: Array<Category> = [];
  if (filterStore.filterIab) {
    return [filterStore.filterIab];
  }
  if (filterStore.filterOrgaId) {
    arrayCategories = generalStore.storedCategoriesOrga.filter((c: Category) => {
      return c.podcastOrganisationCount;
    });
  } else {
    arrayCategories = generalStore.storedCategories.filter((c: Category) => {
      if (state.generalParameters.podcastmaker)
        return c.podcastOrganisationCount;
      return c.podcastCount;
    });
  }
  emit("categoriesLength", arrayCategories.length);
  return arrayCategories;
});


//Watch
watch(()=>filterStore.filterRubrique, () => {
  updateRubriquageFilter();
}, {deep: true, immediate: true});


//Methods
function updateRubriquageFilter() {
  const length = filterStore.filterRubrique.length;
  const rubriquesId: Array<number> = [];
  for (let index = 0; index < length; index++) {
    if (0 < filterStore.filterRubrique[index].rubriqueId) {
      rubriquesId.push(filterStore.filterRubrique[index].rubriqueId);
    }
  }
  rubriqueId.value = rubriquesId;
}

</script>
