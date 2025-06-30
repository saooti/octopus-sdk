<template>
  <section class="page-box">
    <template v-if="loaded && !error && playlist">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="pageTitle"
        :img-url="playlist.imageUrl"
      />
      <div
        class="d-flex flex-column page-element"
        :class="isPodcastmaker ? 'page-element-podcastmaker' : ''"
      >
        <section class="module-box">
          <EditBox v-if="editRight && !isPodcastmaker" :playlist="playlist" />
          <div class="mb-5 mt-3 description-text">
            <img
              v-lazy="useProxyImageUrl(playlist.imageUrl, '250')"
              width="250"
              height="250"
              aria-hidden="true"
              alt=""
              :title="t('Playlist name image', { name: name })"
              class="img-box float-start me-3 mb-3"
            />
            <div class="d-flex align-items-center justify-content-between">
              <h2>{{ name }}</h2>
              <ShareAnonymous v-if="!editRight" class="d-flex justify-content-end flex-grow-1" :playlist="playlist" :organisation-id="playlist.organisation?.id"/>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <p class="html-wysiwyg-content" v-html="urlify(description)" />
            <!-- eslint-enable -->
          </div>
        </section>
        <SharePlayer
          v-if="!isPodcastmaker && editRight"
          :playlist="playlist"
          :organisation-id="authOrgaId"
        />
        <ShareSocialsButtons
          v-if="state.podcastPage.ShareButtons"
          :organisation-id="playlist.organisation.id"
        />
        <section class="module-box">
          <PodcastList 
            v-if="isInit"
            v-model:query="searchPattern"
            :first="paginateFirst"
            :size="ps"
            :playlist="playlist"
          />
        </section>
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded ? t('Loading content ...') : undefined"
      :error-text="error ? t(`Playlist doesn't exist`) : undefined"
    />
  </section>
</template>

<script setup lang="ts">
import { useGeneralStore } from "../../stores/GeneralStore";
import { useAuthStore } from "../../stores/AuthStore";
import {useOrgaComputed} from "../composable/useOrgaComputed";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import ClassicLoading from "../form/ClassicLoading.vue";
import PodcastList from "../display/playlist/PodcastList.vue";
import classicApi from "../../api/classicApi";
import { useFilterStore } from "../../stores/FilterStore";
import { state } from "../../stores/ParamSdkStore";
import displayHelper from "../../helper/displayHelper";
import {useImageProxy} from "../composable/useImageProxy";
import {useErrorHandler} from "../composable/useErrorHandler";
import { Playlist } from "@/stores/class/general/playlist";
import {defineAsyncComponent, ref, Ref, computed, watch, onBeforeUnmount } from "vue";
import { AxiosError } from "axios";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useSimplePageParam } from "../composable/route/useSimplePageParam";
const ShareSocialsButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareSocialsButtons.vue"),
);
const EditBox = defineAsyncComponent(
  () => import("@/components/display/edit/EditBox.vue"),
);
const SharePlayer = defineAsyncComponent(
  () => import("../display/sharing/SharePlayer.vue"),
);
const PodcastmakerHeader = defineAsyncComponent(
  () => import("../display/podcastmaker/PodcastmakerHeader.vue"),
);
const ShareAnonymous = defineAsyncComponent(() => import("../display/sharing/ShareAnonymous.vue"));


//Props
const props = defineProps({
  playlistId: { default: undefined, type: Number },
  pr: { default: 0, type: Number },
  ps: { default: 30, type: Number },
  routeQuery: { default: "", type: String },
});


//Data 
const loaded = ref(false);
const error = ref(false);
const playlist : Ref<Playlist | undefined> = ref(undefined);


//Composables
const route = useRoute();
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();
const { isPodcastmaker, isEditRights, authOrgaId } = useOrgaComputed();
const { updatePathParams } = useSeoTitleUrl();
const {handle403} = useErrorHandler();
const authStore = useAuthStore();
const filterStore = useFilterStore();
const generalStore = useGeneralStore();
const {
  searchPattern,
  paginateFirst,
  isInit
} = useSimplePageParam(props, true);


//Computed
const playlistRadio = computed(() =>{
  return (
    "AMBIANCE" === playlist.value?.ambianceType ||
    "AMBIANCE_PROGRAMMED" === playlist.value?.ambianceType
  );
});
const pageTitle = computed(() =>playlistRadio.value? t("Mix of episodes"): t("Playlist"));
const name = computed(() =>playlist.value?.title ?? "");
const description = computed(() =>playlist.value?.description ?? "");
const editRight = computed(() =>{
  return isEditRights(
    playlist.value?.organisation?.id,
    authStore.isRolePlaylists,
  );
});


//Watch
watch(()=>props.playlistId, () => {getPlaylistDetails()}, {immediate: true});


onBeforeUnmount(() => {
  generalStore.contentToDisplayUpdate(null);
});


//Methods
function urlify(text:string|undefined){
  return displayHelper.urlify(text);
}
function initError(): void {
  error.value = true;
  loaded.value = true;
}
async function getPlaylistDetails(): Promise<void> {
  try {
    loaded.value = false;
    error.value = false;
    playlist.value = await classicApi.fetchData<Playlist>({
      api: 0,
      path: "playlist/" + props.playlistId,
    });
    if (
      (!editRight.value && playlistRadio.value) ||
      ("PUBLIC" !== playlist.value.organisation?.privacy &&
      filterStore.filterOrgaId !== playlist.value.organisation?.id &&
      route.query.productor !== playlist.value.organisation?.id)
    ) {
      initError();
      return;
    }
    generalStore.contentToDisplayUpdate(playlist.value);
    updatePathParams(playlist.value.title);
  } catch (error) {
    handle403(error as AxiosError);
    initError();
  }
  loaded.value = true;
}

</script>
