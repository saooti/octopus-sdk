<template>
  <ListPaginate
    id="podcastListPaginate"
    v-model:first="dfirst"
    v-model:rows-per-page="dsize"
    v-model:is-mobile="isMobile"
    :text-count="
      showCount && podcasts.length > 1
        ? t('Number podcasts', { nb: totalCount }) + sortText
        : undefined
    "
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading ? t('Loading podcasts ...') : undefined"
    :error-text="
      !loading && !podcasts.length
        ? t(`No podcast match your query`)
        : undefined
    "
    :just-size-chosen="justSizeChosen"
    :player-responsive="true"
  >
    <template #list>
      <div class="octopus-element-list">
        <ClassicLazy
          v-for="p in displayArray"
          :key="p.podcastId"
          :min-height="410"
        >
          <PodcastItem v-if="0 !== p.podcastId" :podcast="p" />
          <template #preview>
            <router-link
              :to="{
                name: 'podcast',
                params: { podcastId: p.podcastId },
              }"
              :title="t('Episode name page', { name: p.title })"
            >
              {{ p.title }}
            </router-link>
          </template>
        </ClassicLazy>
      </div>
    </template>
  </ListPaginate>
</template>

<script setup lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import {useErrorHandler} from "../../composable/useErrorHandler";
import classicApi from "../../../api/classicApi";
import PodcastItem from "./PodcastItem.vue";
import ClassicLazy from "../../misc/ClassicLazy.vue";
import { useFilterStore } from "../../../stores/FilterStore";
import { Podcast, emptyPodcastData } from "@/stores/class/general/podcast";
import { computed, onBeforeMount, Ref, ref, watch } from "vue";
import { FetchParam } from "@/stores/class/general/fetchParam";
import { AxiosError } from "axios";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  first: { default: 0, type: Number },
  size: { default: 30, type: Number },
  organisationId: { default: () => [], type: Array as () => Array<string> },
  emissionId: { default: undefined, type: Number },
  iabId: { default: undefined, type: Number },
  participantId: { default: undefined, type: Number },
  query: { default: undefined, type: String },
  monetisable: { default: undefined, type: String },
  popularSort: { default: false, type: Boolean },
  reload: { default: false, type: Boolean },
  before: { default: undefined, type: String },
  after: { default: undefined, type: String },
  includeHidden: { default: false, type: Boolean },
  showCount: { default: false, type: Boolean },
  displaySortText: { default: true, type: Boolean },
  sortCriteria: { default: undefined, type: String },
  validity: { default: 'true', type: String },
  rubriqueId: { default: () => [], type: Array as () => Array<number> },
  rubriquageId: { default: () => [], type: Array as () => Array<number> },
  noRubriquageId: { default: () => [], type: Array as () => Array<number> },
  justSizeChosen: { default: false, type: Boolean },
  withVideo: { default: undefined, type: Boolean },
  includeTag:{ default: () => [], type: Array as () => Array<string> },
})

//Emits
const emit = defineEmits(["fetch", "emptyList"]);

//Data 
const loading = ref(true);
const dfirst = ref(props.first);
const dsize = ref(props.size);
const totalCount = ref(0);
const isMobile = ref(false);
const podcasts: Ref<Array<Podcast>> = ref([]);

//Composables
const { t } = useI18n();
const {handle403} = useErrorHandler();
const filterStore = useFilterStore();

//Computed
const displayArray = computed(() => {
  if (isMobile.value || props.justSizeChosen) {
    return podcasts.value;
  }
  return podcasts.value.slice(
    dfirst.value,
    Math.min(dfirst.value + dsize.value, totalCount.value),
  );
});
const changePaginate = computed(() => `${props.first}|${props.size}`);
const changed = computed(() => {
  return `${organisation.value}|${props.emissionId}|${props.sortCriteria}|${sort.value}
    ${props.iabId}|${props.participantId}|${props.query}|${props.monetisable}|${props.popularSort}|
    ${props.rubriqueId}|${props.rubriquageId}|${props.before}|${props.after}|${props.includeHidden}|${props.noRubriquageId}|${props.validity}|
    ${props.withVideo}|${props.includeTag}`;
});
const organisation = computed(() => {
  if (props.organisationId) {
    return props.organisationId;
  }
  return filterStore.filterOrgaId ? [filterStore.filterOrgaId] : [];
});
const sort = computed(() => props.popularSort ? "POPULARITY" : (props.sortCriteria ?? "DATE"));
const sortText = computed(() => {
  if (!props.displaySortText) {
    return "";
  }
  switch (props.sortCriteria) {
    case "SCORE":
      return " " + t("sort by score");
    case "DATE":
      return " " + t("sort by date");
    case "NAME":
      return " " + t("sort by alphabetical");
    default:
      return " " + t("sort by date");
  }
});

//Watch
watch(changePaginate, () => {
  dfirst.value = props.first;
  dsize.value = props.size;
});
watch(changed, () => reloadList());
watch(()=>props.reload, () => reloadList());
watch(dsize, () => reloadList());
watch(dfirst, () => {
  if (
    !podcasts.value[dfirst.value] ||
    0 === podcasts.value[dfirst.value].podcastId
  ) {
    fetchContent(false);
  }
});

onBeforeMount(()=>fetchContent(true))

//Methods
function reloadList() {
  dfirst.value = 0;
  fetchContent(true);
}
async function fetchContent(reset: boolean): Promise<void> {
  loading.value = true;
  const param: FetchParam = {
    first: dfirst.value,
    size: dsize.value,
    organisationId: organisation.value,
    emissionId: props.emissionId,
    iabId: props.iabId,
    participantId: props.participantId,
    query: props.query,
    monetisable: props.monetisable,
    sort: sort.value,
    before: props.before,
    after: props.after,
    noRubriquageId: props.noRubriquageId.length
      ? props.noRubriquageId
      : undefined,
    rubriqueId: props.rubriqueId.length ? props.rubriqueId : undefined,
    rubriquageId: props.rubriquageId.length ? props.rubriquageId : undefined,
    includeHidden: props.includeHidden,
    validity: props.validity,
    /* publisherId:
      !this.onlyValid && !authStore.isRoleProduction
        ? authStore.authProfile?.userId
        : undefined, */
    includeStatus: ["READY", "PROCESSING"],
    withVideo: props.withVideo,
    includeTag: props.includeTag.length ? props.includeTag : undefined,
  };
  try {
    const data = await classicApi.fetchData<ListClassicReturn<Podcast>>({
      api: 0,
      path: "podcast/search",
      parameters: param,
      specialTreatement: true,
    });
    afterFetching(reset, data);
  } catch (error) {
    handle403(error as AxiosError);
  }
}
function afterFetching(
  reset: boolean,
  data: { count: number; result: Array<Podcast>; sort: string },
): void {
  if (reset) {
    podcasts.value.length = 0;
  }
  if (dfirst.value > podcasts.value.length) {
    for (
      let i = podcasts.value.length - 1, len = dfirst.value + dsize.value;
      i < len;
      i++
    ) {
      podcasts.value.push(emptyPodcastData());
    }
  }
  const responsePodcasts = data.result.filter((p: Podcast | null) => {
    return null !== p;
  });
  podcasts.value = podcasts.value
    .slice(0, dfirst.value)
    .concat(responsePodcasts)
    .concat(
      podcasts.value.slice(dfirst.value + dsize.value, podcasts.value.length),
    );
  emit("fetch", podcasts.value);
  totalCount.value = props.justSizeChosen ? props.size : data.count;
  if (0 === podcasts.value.length) {
    emit("emptyList");
  }
  loading.value = false;
}
</script>
