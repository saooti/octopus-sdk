<template>
  <div v-if="notEmpty">
    <h3 class="mb-0 mt-3">
      {{ t("All live emission button") }}
    </h3>
    <ListPaginate
      id="liveListPaginate"
      v-model:first="dfirst"
      v-model:rows-per-page="dsize"
      v-model:is-mobile="isMobile"
      :total-count="totalCount"
      :loading="false"
      :player-responsive="true"
    >
      <template #list>
        <div class="octopus-element-list">
          <template v-for="p in displayArray" :key="p.podcastId">
            <PodcastItem v-if="0 !== p.podcastId" :podcast="p" />
          </template>
        </div>
      </template>
    </ListPaginate>
  </div>
</template>

<script setup lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import classicApi from "../../../api/classicApi";
import PodcastItem from "../podcasts/PodcastItem.vue";
import { Podcast, emptyPodcastData } from "@/stores/class/general/podcast";
import { computed, onBeforeMount, Ref, ref, watch } from "vue";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  first: { default: 0, type: Number },
  size: { default: 30, type: Number },
  emissionId: { default: undefined, type: Number },
})

//Data 
const dfirst = ref(props.first);
const dsize = ref(props.size);
const totalCount = ref(0);
const lives: Ref<Array<Podcast>> = ref([]);
const notEmpty = ref(false);
const inFetching = ref(false);
const isMobile = ref(false);

//Composables
const { t } = useI18n();

//Computed
const displayArray = computed(() => {
  if (isMobile.value) {
    return lives.value;
  }
  return lives.value.slice(
    dfirst.value,
    Math.min(dfirst.value + dsize.value, totalCount.value),
  );
});


//Watch
watch(dsize, () => reloadList());
watch(dfirst, () => {
  if (!lives.value[dfirst.value] || 0 === lives.value[dfirst.value].podcastId) {
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
  inFetching.value = true;
  if (reset) {
    notEmpty.value = false;
  }
  const data = await classicApi.fetchData<ListClassicReturn<Podcast>>({
    api: 0,
    path: "podcast/search",
    parameters: {
      first: dfirst.value,
      size: dsize.value,
      emissionId: props.emissionId,
      sort: "DATE",
      includeStatus: "READY_TO_RECORD",
    },
    specialTreatement: true,
  });
  afterFetching(reset, data);
}
function afterFetching(
  reset: boolean,
  data: { count: number; result: Array<Podcast>; sort: string },
): void {
  if (reset) {
    lives.value.length = 0;
  }
  if (dfirst.value > lives.value.length) {
    for (
      let i = lives.value.length - 1, len = dfirst.value + dsize.value;
      i < len;
      i++
    ) {
      lives.value.push(emptyPodcastData());
    }
  }
  const responseLives = data.result.filter((l: Podcast | null) => {
    return null !== l;
  });
  lives.value = lives.value
    .slice(0, dfirst.value)
    .concat(responseLives)
    .concat(lives.value.slice(dfirst.value + dsize.value, lives.value.length));
  totalCount.value = data.count;
  if (0 !== lives.value.length) {
    notEmpty.value = true;
  }
  inFetching.value = false;
}
</script>
