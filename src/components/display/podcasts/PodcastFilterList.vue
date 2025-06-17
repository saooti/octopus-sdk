<template>
  <section class="py-3">
    <h3 class="mb-2">
      {{ titleFilter }}
    </h3>
    <div class="d-flex align-items-center flex-wrap mb-2">
      <div id="podcast-filter-list-category-chooser" class="w-50-responsive pe-3">
        <CategoryChooser
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
      :first="first"
      :size="size"
      :iab-id="iabId"
      :query="query"
      :participant-id="participantId"
      :emission-id="emissionId"
      :organisation-id="productorId"
      :reload="reloadList"
      :include-hidden="editRight"
      :show-count="showCount"
      :display-sort-text="false"
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
  participantId: { default: undefined, type: Number },
  name: { default: undefined, type: String },
  emissionId: { default: undefined, type: Number },
  categoryFilter: { default: false, type: Boolean },
  reload: { default: false, type: Boolean },
  editRight: { default: false, type: Boolean },
  productorId: { default: () => [], type: Array as () => Array<string> },
  showCount: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["fetch"]);

//Data 
const first = ref(0);
const size = ref(30);
const searchPattern = ref("");
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
const query = computed(() => searchPattern.value.length >= 3 ? searchPattern.value : "");

//Watch
watch(()=>props.reload, () => {
  reloadList.value = !reloadList.value;
});

//Methods
function onCategorySelected(category: Category | undefined): void {
  iabId.value = category?.id ? category.id : undefined;
}
function fetch(podcasts: Array<Podcast>): void {
  emit("fetch", podcasts);
}
</script>
