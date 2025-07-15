<template>
  <section class="py-3">
    <h3 class="mb-2">
      {{ titleFilter }}
    </h3>
    <div class="d-flex align-items-stretch flex-wrap mb-2">
      <div id="podcast-filter-list-category-chooser" class="w-50-responsive pe-3">
        <CategoryChooser
          height="100%"
          :defaultanswer="t('No category filter')"
          @selected="onCategorySelected"
        />
      </div>
      <ClassicSearch
        v-model:text-init="searchPattern"
        class="w-50-responsive"
        id-search="podcast-filter-search"
        :label="t('Search')"
      />
    </div>
    <PodcastList
      :first="dfirst"
      :size="dsize"
      :iab-id="iabId"
      :query="query"
      :participant-id="participantId"
      :emission-id="emissionId"
      :organisation-id="productorId"
      :sort-criteria="sort"
      :reload="reloadList"
      :include-hidden="editRight"
      :show-count="showCount"
      :display-sort-text="false"
      :force-update-parameters="forceUpdateParameters"
      @fetch="fetch"
    />
  </section>
</template>

<script setup lang="ts">
import ClassicSearch from "../../form/ClassicSearch.vue";
import PodcastList from "./PodcastList.vue";
import { Category } from "@/stores/class/general/category";
import { defineAsyncComponent, ref, Ref, computed, watch } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";
const CategoryChooser = defineAsyncComponent(
  () => import("../categories/CategoryChooser.vue"),
);

//Props 
const props = defineProps({
  first: { default: 0, type: Number },
  size: { default: 30, type: Number },
  query: { default: undefined, type: String },
  participantId: { default: undefined, type: Number },
  name: { default: undefined, type: String },
  emissionId: { default: undefined, type: Number },
  categoryFilter: { default: false, type: Boolean },
  reload: { default: false, type: Boolean },
  editRight: { default: false, type: Boolean },
  productorId: { default: () => [], type: Array as () => Array<string> },
  showCount: { default: false, type: Boolean },
  forceUpdateParameters: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["fetch", "update:query"]);

//Data 
const dfirst = ref(props.first);
const dsize = ref(props.size);
const searchPattern = ref(props.query ?? "");
const reloadList = ref(false);
const iabId : Ref<number | undefined>= ref(undefined);

//Composables
const { t } = useI18n();

//Computed
const titleFilter = computed(() => {
  return props.name
    ? t("All podcast button", { name: props.name })
    : t("All podcast emission button");
});
const query = computed(() => searchPattern.value.length > 3 ? searchPattern.value : "");
const sort = computed(() =>  !query.value.length ? "DATE" : "SCORE");

//Watch
watch(()=>props.reload, () => {
  reloadList.value = !reloadList.value;
});
watch(searchPattern, () => {
  emit('update:query', searchPattern.value);
});

//Methods
function onCategorySelected(category: Category | undefined): void {
  iabId.value = category?.id ? category.id : undefined;
}
function fetch(podcasts: Array<Podcast>): void {
  emit("fetch", podcasts);
}
</script>
