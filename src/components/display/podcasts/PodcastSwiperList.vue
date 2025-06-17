<template>
  <PodcastInlineListTemplate
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
    :display-arrow="false"
    :popular-sort="popularSort"
    :button-text="buttonText"
    :button-plus="buttonPlus"
    :title="title"
    :href="href"
    :iab-id="iabId"
    :rubrique-id="rubriqueId"
    :no-rubriquage-id="noRubriquageId"
    :title-tag="titleTag"
    @sort-chrono="sortChrono"
    @sort-popular="sortPopular"
  >
    <template #list-inline>
      <ClassicLoading
        class="loading-size"
        :loading-text="loading ? t('Loading podcasts ...') : undefined"
      />
      <SwiperList v-if="!loading" :list-object="allPodcasts">
        <template #octopusSlide="{ option }">
          <PodcastItem
            class="flex-shrink-0 item-phone-margin"
            :podcast="option"
          />
        </template>
      </SwiperList>
    </template>
  </PodcastInlineListTemplate>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import PodcastInlineListTemplate from "./PodcastInlineListTemplate.vue";
import classicApi from "../../../api/classicApi";
import PodcastItem from "./PodcastItem.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import SwiperList from "../list/SwiperList.vue";
import { useFilterStore } from "../../../stores/FilterStore";
import { Podcast } from "@/stores/class/general/podcast";
import { computed, onBeforeMount, Ref, ref, watch } from "vue";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  organisationId: { default: () => [], type: Array as () => Array<string> },
  emissionId: { default: undefined, type: Number },
  iabId: { default: undefined, type: Number },
  title: { default: "", type: String },
  href: { default: undefined, type: String },
  buttonText: { default: undefined, type: String },
  isArrow: { default: false, type: Boolean },
  requirePopularSort: { default: undefined, type: Boolean },
  buttonPlus: { default: false, type: Boolean },
  rubriqueId: { default: () => [], type: Array as () => Array<number> },
  rubriquageId: { default: () => [], type: Array as () => Array<number> },
  noRubriquageId: { default: () => [], type: Array as () => Array<number> },
  query: { default: undefined, type: String },
  lastThreeMonths: { default: false, type: Boolean },
  titleTag: { default: "h2", type: String },
})

//Emits
const emit = defineEmits(["update:isArrow"]);

//Data 
const loading = ref(true);
const popularSort = ref(false);
const allPodcasts: Ref<Array<Podcast>> = ref([]);


//Composables
const { t } = useI18n();
const filterStore = useFilterStore();

//Computed
const organisation = computed(() => {
  if (props.organisationId.length) {
    return props.organisationId;
  }
  return filterStore.filterOrgaId ? [filterStore.filterOrgaId] : [];
});
const watchVariable = computed(() => {
  return `${props.emissionId}|${props.organisationId}|${filterStore.filterOrgaId}|${props.iabId}|${props.rubriqueId}|${props.rubriquageId}|${props.query}`;
});


//Watch
watch(watchVariable, () => fetchNext(), {immediate:true});

onBeforeMount(()=>{
  if (undefined !== props.requirePopularSort) {
    popularSort.value = props.requirePopularSort;
  }
  if (undefined !== props.isArrow) {
    emit("update:isArrow", true);
  }
})

//Methods
async function fetchNext(): Promise<void> {
  const data = await classicApi.fetchData<ListClassicReturn<Podcast>>({
    api: 0,
    path: "podcast/search",
    parameters: {
      first: 0,
      size: 12,
      organisationId: organisation.value,
      emissionId: props.emissionId,
      iabId: props.iabId,
      rubriqueId: props.rubriqueId.length ? props.rubriqueId : undefined,
      rubriquageId: props.rubriquageId.length
        ? props.rubriquageId
        : undefined,
      noRubriquageId: props.noRubriquageId.length
        ? props.noRubriquageId
        : undefined,
      sort: popularSort.value ? "POPULARITY" : "DATE",
      query: props.query,
      includeStatus: ["READY", "PROCESSING"],
      after:
      popularSort.value && props.lastThreeMonths
          ? dayjs().subtract(3, "months").toISOString()
          : undefined,
    },
    specialTreatement: true,
  });
  loading.value = true;
  allPodcasts.value = data.result.filter(
    (pod: Podcast | null) => null !== pod,
  );
  loading.value = false;
}
function sortPopular(): void {
  if (popularSort.value) return;
  popularSort.value = true;
  fetchNext();
}
function sortChrono(): void {
  if (!popularSort.value) return;
  popularSort.value = false;
  fetchNext();
}
</script>
