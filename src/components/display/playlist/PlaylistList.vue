<template>
  <ListPaginate
    id="playlistListPaginate"
    v-model:first="dfirst"
    v-model:rows-per-page="dsize"
    v-model:is-mobile="isMobile"
    :text-count="
      displayCount > 1
        ? `${t('Number playlists', { nb: displayCount })}`
        : undefined
    "
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading ? t('Loading content ...') : undefined"
    :player-responsive="true"
  >
    <template #list>
      <div class="octopus-element-list two-items-list">
        <ClassicLazy
          v-for="p in displayArray"
          :key="p.playlistId"
          :min-height="250"
          class="d-flex flex-column flex-grow-1"
        >
          <PlaylistItem v-if="0 !== p.playlistId" :playlist="p" />
          <template #preview>
            <router-link
              :to="{
                name: 'playlist',
                params: { playlistId: p.playlistId },
              }"
              :title="t('Playlist name page', { name: p.title })"
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
import ClassicLazy from "../../misc/ClassicLazy.vue";
import ListPaginate from "../list/ListPaginate.vue";
import {useErrorHandler} from "../../composable/useErrorHandler";
import classicApi from "../../../api/classicApi";
import PlaylistItem from "./PlaylistItem.vue";
import { Playlist, emptyPlaylistData } from "@/stores/class/general/playlist";
import { useFilterStore } from "../../../stores/FilterStore";
import { computed, onMounted, Ref, ref, watch } from "vue";
import { AxiosError } from "axios";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  first: { default: 0, type: Number },
  size: { default: 30, type: Number },
  query: { default: undefined, type: String },
  organisationId: { default: undefined, type: String },
})

//Data 
const loading = ref(true);
const dfirst = ref(props.first);
const dsize = ref(props.size);
const totalCount = ref(0);
const displayCount = ref(0);
const isMobile = ref(false);
const playlists: Ref<Array<Playlist>> = ref([]);


//Composables
const { t } = useI18n();
const {handle403} = useErrorHandler();
const filterStore = useFilterStore();


//Computed
const displayArray = computed(() => {
  if (isMobile.value) {
    return playlists.value;
  }
  return playlists.value.slice(
    dfirst.value,
    Math.min(dfirst.value + dsize.value, totalCount.value),
  );
});
const changed = computed(() => `${props.organisationId}|${props.query}`);
const changePaginate = computed(() => `${props.first}|${props.size}`);
const sort = computed(() => !props.query ? "NAME" : "SCORE");
const organisation = computed(() => props.organisationId ? props.organisationId : filterStore.filterOrgaId);


//Watch
watch(changePaginate, () => {
  dfirst.value = props.first;
  dsize.value = props.size;
});
watch(changed, () => fetchContent(true));
watch(dsize, () =>fetchContent(true));
watch(dfirst, () => {
  if (
    !playlists.value[dfirst.value] ||
    0 === playlists.value[dfirst.value].playlistId
  ) {
    fetchContent(false);
  }
});

onMounted(()=>fetchContent(false))


//Methods
async function fetchContent(reset: boolean): Promise<void> {
  loading.value = true;
  const param = {
    first: reset ? 0 : dfirst.value,
    size: dsize.value,
    query: props.query,
    organisationId: organisation.value,
    type: "NONE",
    sort: sort.value,
  };
  try {
    const data = await classicApi.fetchData<ListClassicReturn<Playlist>>({
      api: 0,
      path: "playlist/search",
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
  data: { count: number; result: Array<Playlist>; sort: string },
): void {
  if (reset) {
    dfirst.value = 0;
    playlists.value.length = 0;
  }
  if (dfirst.value > playlists.value.length) {
    for (
      let i = playlists.value.length - 1, len = dfirst.value + dsize.value;
      i < len;
      i++
    ) {
      playlists.value.push(emptyPlaylistData());
    }
  }
  displayCount.value = data.count;
  const responsePlaylists = data.result.filter((e: Playlist | null) => {
    if (null === e) {
      displayCount.value--;
    }
    return null !== e;
  });
  playlists.value = playlists.value
    .slice(0, dfirst.value)
    .concat(responsePlaylists)
    .concat(
      playlists.value.slice(dfirst.value + dsize.value, playlists.value.length),
    );
  totalCount.value = data.count;
  loading.value = false;
}
</script>
