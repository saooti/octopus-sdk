<!--
  Component displaying a list of podcasts IN A PLAYLIST
  Do not confuse this with PodcastList from podcasts
-->
<template>
  <div>
    <h3 class="mb-3 align-self-baseline">
      {{ titleList }}
    </h3>

    <ClassicSearch
      v-if="!loading && notEmptyPlaylist"
      v-model:text-init="searchPattern"
      class="align-self-baseline mb-2"
      id-search="podcast-list-search"
      :label="t('Search')"
    />

    <ListPaginate
      id="podcastPlaylistListPaginate"
      v-model:first="dfirst"
      v-model:rows-per-page="dsize"
      v-model:is-mobile="isMobile"
      :text-count="
        podcasts.length > 1
          ? `${t('Number podcasts', { nb: podcasts.length })}`
          : undefined
      "
      :total-count="podcasts.length"
      :loading="loading"
      :loading-text="loading ? t('Loading podcasts ...') : undefined"
      :error-text="
        !loading && !podcasts.length && notEmptyPlaylist
          ? t(`No podcast match your query`)
          : undefined
      "
      :player-responsive="true"
      :force-update-parameters="true"
    >
      <template #list>
        <div class="octopus-element-list">
          <ClassicLazy
            v-for="p in podcastsDisplay"
            :key="p.podcastId"
            :min-height="410"
          >
            <PodcastItem
              v-if="0 !== p.podcastId"
              :podcast="p"
              :in-list="true"
            />

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
  </div>
</template>

<script setup lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import {useErrorHandler} from "../../composable/useErrorHandler";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import classicApi from "../../../api/classicApi";
import PodcastItem from "../podcasts/PodcastItem.vue";
import ClassicSearch from "../../form/ClassicSearch.vue";
import ClassicLazy from "../../misc/ClassicLazy.vue";
import { Podcast } from "@/stores/class/general/podcast";
import { Playlist } from "@/stores/class/general/playlist";
import { computed, onBeforeMount, Ref, ref, watch } from "vue";
import { AxiosError } from "axios";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  playlist: { default: () => ({}), type: Object as () => Playlist },
  first: { default: 0, type: Number },
  size: { default: 30, type: Number },
  query: { default: undefined, type: String },
})

//Emits
const emit = defineEmits(["update:query"]);

//Data 
const loading = ref(true);
const podcasts: Ref<Array<Podcast>> = ref([]);
const podcastsQuery: Ref<Array<Podcast>> = ref([]);
const dfirst = ref(props.first);
const dsize = ref(props.size);
const searchPattern = ref("");
const isMobile = ref(false);

//Composables
const { t } = useI18n();
const {handle403} = useErrorHandler();
const { isEditRights } = useOrgaComputed();

//Computed
const titleList = computed(() => notEmptyPlaylist.value? t("Podcasts in the playlist"): t("No podcasts in the playlist"));
const notEmptyPlaylist = computed(() => 0 !== Object.keys(props.playlist.samplingViews ?? []).length);
const podcastsDisplay = computed(() => {
  if (isMobile.value) {
    return podcastsQuery.value.slice(
      0,
      Math.min(dfirst.value + dsize.value, podcasts.value.length),
    );
  }
  return podcastsQuery.value.slice(
    dfirst.value,
    Math.min(dfirst.value + dsize.value, podcasts.value.length),
  );
});
const editRight = computed(() =>isEditRights(props.playlist.organisation?.id));

//Watch
watch(searchPattern,() => {
  emit('update:query', searchPattern.value);
  if ("" !== searchPattern.value) {
    podcastsQuery.value = podcasts.value.filter((el: Podcast) => {
      return el.title
        .toLowerCase()
        .includes(searchPattern.value.toLowerCase());
    });
  } else {
    podcastsQuery.value = podcasts.value;
  }
});

onBeforeMount(()=>fetchContent());


//Methods
async function fetchContent(): Promise<void> {
  if (notEmptyPlaylist.value) {
    podcasts.value.length = 0;
    loading.value = true;
    try {
      podcasts.value = await classicApi.fetchData<Array<Podcast>>({
        api: 0,
        path: "playlist/" + props.playlist.playlistId + "/content",
      });
      if (!editRight.value) {
        podcasts.value = podcasts.value.filter((p: Podcast | null) => {
          return (
            null !== p &&
            (!p.availability || true === p.availability.visibility)
          );
        });
      }
      podcastsQuery.value = podcasts.value;
      searchPattern.value = props.query ?? "";
    } catch (error) {
      handle403(error as AxiosError);
    }
  }
  loading.value = false;
}
</script>

