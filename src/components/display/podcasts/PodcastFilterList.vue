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
      v-if="!showSeasons"
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
    <ClassicNav
      v-else
      v-model:active-tab="activeSeasonTab"
      :tab-number="seasons.length"
    >
      <template v-for="season in seasons" #[tabNameSlot(season)]>
        {{ $t('Podcast - Season N', { season }) }}
      </template>

      <template v-for="season in seasons" #[tabContentSlot(season)] :key="season">
        <PodcastList
          class="flex-grow-1"
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
          :seasons="[season]"
          @fetch="fetch($event, season)"
        />
      </template>
    </ClassicNav>
  </section>
</template>

<script setup lang="ts">
import ClassicSearch from "../../form/ClassicSearch.vue";
import PodcastList from "./PodcastList.vue";
import { Category } from "@/stores/class/general/category";
import { defineAsyncComponent, ref, Ref, computed, watch, onMounted } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";
import ClassicNav from "../../misc/ClassicNav.vue";
import { Emission } from "@/stores/class/general/emission";
import { useSeasonsManagement } from "../../composable/useSeasonsManagement";
import { PodcastSort } from "../../../api/podcastApi";
const CategoryChooser = defineAsyncComponent(
  () => import("../categories/CategoryChooser.vue"),
);

//Props 
const props = withDefaults(defineProps<{
  first?: number;
  size?: number;
  query?: string;
  participantId?: number;
  name?: string;
  emissionId?: number;
  categoryFilter?: boolean;
  reload?: boolean;
  editRight?: boolean;
  productorId?: Array<string>;
  showCount?: boolean;
  forceUpdateParameters?: boolean;
  /**
   * Emission for which to display podcasts
   * If set, will check for seasons
   */
  emission?: Emission;
}>(), {
  first: 0,
  size: 30
});

//Emits
const emit = defineEmits<{
  (e: "fetch", podcasts: Array<Podcast>, season: number|undefined): void;
  (e: "update:query", query: string): void;
}>();

//Data 
const dfirst = ref(props.first);
const dsize = ref(props.size);
const searchPattern = ref(props.query ?? "");
const reloadList = ref(false);
const iabId : Ref<number | undefined>= ref(undefined);
const activeSeasonTab = ref(0);

//Composables
const { t } = useI18n();
const { areSeasonsEnabled } = useSeasonsManagement();

onMounted(() => {
  if (showSeasons.value === true) {
    activeSeasonTab.value = props.emission.seasonCount - 1;
  }
});

//Computed
const titleFilter = computed(() => {
  return props.name
    ? t("All podcast button", { name: props.name })
    : t("All podcast emission button");
});
const query = computed(() => searchPattern.value.length > 3 ? searchPattern.value : "");
const sort = computed((): PodcastSort => {
  if(showSeasons.value === true) {
    return PodcastSort.SEASONAL;
  } else if(!query.value.length) {
    return PodcastSort.DATE;
  } else {
    return PodcastSort.SCORE;
  }
});

const showSeasons = computed(() => {
  return props.emission !== undefined && areSeasonsEnabled(props.emission) && props.emission.seasonCount > 0;
});

const seasons = computed((): Array<number> => {
  const ary: Array<number> = [];
  if (showSeasons.value === true) {
    for (let i = 1; i <= props.emission.seasonCount; i++) {
      ary.push(i);
    }
  }
  return ary;
});

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
function fetch(podcasts: Array<Podcast>, season?: number): void {
  emit("fetch", podcasts, season);
}

/** Name of the slot for the tab's title */
function tabNameSlot(season: number): string {
  return `${season - 1}`;
}
/** Name of the slot for the tab's content */
function tabContentSlot(season: number): string {
  return `tab${season - 1}`;
}
</script>
