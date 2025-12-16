<template>
  <section class="page-box">
    <template v-if="loaded && !error && emission">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="useEmissionTitle ? emission.name : t('Emission')"
        :img-url="emission.imageUrl"
      />
      <div
        class="d-flex flex-column page-element"
        :class="isPodcastmaker ? 'page-element-podcastmaker' : ''"
      >
        <section class="module-box">
          <EditBox
            v-if="editRight && !isPodcastmaker"
            :emission="emission"
            @is-updated="getEmissionDetails"
          />
          <div class="w-100 mb-2">
            <img
              v-lazy="useProxyImageUrl(emission.imageUrl, '250')"
              width="250"
              height="250"
              aria-hidden="true"
              alt=""
              :title="t('Emission name image', { name: name })"
              class="img-box img-box-podcast mb-3 flex-column justify-content-start align-items-start position-relative flex-shrink-0 float-start me-3"
            >

            <div class="d-flex align-items-center justify-content-between">
              <h2>{{ name }}</h2>
              <ShareAnonymous v-if="!editRight" class="d-flex justify-content-end flex-grow-1" :emission="emission" :organisation-id="emission.orga.id"/>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <p
              class="html-wysiwyg-content description-text"
              v-html="urlify(description)"
            />
            <!-- eslint-enable -->

            <ErrorMessage v-if="emission.visible === false">
              <div class="d-flex" style="align-items: center">
                <div>{{ t('Emission - Not available for listeners') }}</div>

                <ClassicHelpButton relative small>
                  {{ t('Emission - Not available explanation') }}
                </ClassicHelpButton>
              </div>
            </ErrorMessage>

            <div v-if="lastPodcast" class="d-flex align-items-center mt-3">
              <PodcastPlayButton
                :podcast="lastPodcast"
                :just-buttons="true"
              />
              <div class="ms-2 fw-bold">
                {{ t("Listen to the latest episode") }}
              </div>
            </div>

            <!-- Tag list -->
            <TagList
              v-if="undefined !== emission.tags && 0 !== emission.tags.length"
              :tag-list="emission.tags"
              :orga-id="authOrgaId"
              :emission-annotations="emission.annotations"
            />

            <SubscribeButtons
              v-if="isPodcastmaker"
              class="mt-4"
              :emission="emission"
              :window-width="1000"
              :justify-center="false"
            />
          </div>
        </section>
        <ShareSocialsButtons
          v-if="state.podcastPage.ShareButtons"
          :organisation-id="emission.orga.id"
        />
        <SharePlayer
          v-if="!isPodcastmaker && editRight"
          :emission="emission"
          :organisation-id="authOrgaId"
        />
        <section class="module-box">
          <LiveHorizontalList
            v-if="!isPodcastmaker"
            class="mx-2"
            :emission-id="emissionId"
          />
          <PodcastFilterList
            v-if="isInit"
            v-model:query="searchPattern"
            class="mx-2"
            :first="paginateFirst"
            :size="ps"
            :show-count="true"
            :emission-id="emissionId"
            :category-filter="false"
            :edit-right="editRight"
            :productor-id="[emission.orga.id]"
            :force-update-parameters="true"
            @fetch="podcastsFetched"
          />
        </section>
        <ShareDistribution
          v-if="editRight && !isPodcastmaker && securityRight && !authStore.isGarRole"
          :emission-id="emissionId"
        />
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded ? t('Loading content ...') : undefined"
      :error-text="error ? t(`Emission doesn't exist`) : undefined"
    />
  </section>
</template>

<script setup lang="ts">
import classicApi from "../../api/classicApi";
import { state } from "../../stores/ParamSdkStore";
import displayHelper from "../../helper/displayHelper";
import {useImageProxy} from "../composable/useImageProxy";
import {useOrgaComputed} from "../composable/useOrgaComputed";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import {useErrorHandler} from "../composable/useErrorHandler";
import { Emission } from "@/stores/class/general/emission";
import ClassicLoading from "../form/ClassicLoading.vue";
import { defineAsyncComponent, ref, Ref, computed, watch, onBeforeUnmount } from "vue";
import { AxiosError } from "axios";
import { useAuthStore } from "../../stores/AuthStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { useFilterStore } from "../../stores/FilterStore";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useSimplePageParam } from "../composable/route/useSimplePageParam";

import ErrorMessage from "../misc/ErrorMessage.vue";
import ClassicHelpButton from "../misc/ClassicHelpButton.vue";

const ShareAnonymous = defineAsyncComponent(() => import("../display/sharing/ShareAnonymous.vue"));
const PodcastFilterList = defineAsyncComponent(
  () => import("../display/podcasts/PodcastFilterList.vue"),
);
const SharePlayer = defineAsyncComponent(
  () => import("../display/sharing/SharePlayer.vue"),
);
const ShareSocialsButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareSocialsButtons.vue"),
);
const ShareDistribution = defineAsyncComponent(
  () => import("../display/sharing/ShareDistribution.vue"),
);
const EditBox = defineAsyncComponent(
  () => import("@/components/display/edit/EditBox.vue"),
);
const SubscribeButtons = defineAsyncComponent(
  () => import("../display/sharing/SubscribeButtons.vue"),
);
const LiveHorizontalList = defineAsyncComponent(
  () => import("../display/live/LiveHorizontalList.vue"),
);
const PodcastPlayButton = defineAsyncComponent(
  () => import("../display/podcasts/PodcastPlayButton.vue"),
);
const PodcastmakerHeader = defineAsyncComponent(
  () => import("../display/podcastmaker/PodcastmakerHeader.vue"),
);
const TagList = defineAsyncComponent(() => import("../display/podcasts/TagList.vue"));


//Props 
const props = defineProps({
  emissionId: { default: undefined, type: Number },
  pr: { default: 0, type: Number },
  ps: { default: 30, type: Number },
  routeQuery: { default: "", type: String },
  /** When true, display emission title in podcastmaker header */
  useEmissionTitle: { default: false, type: Boolean }
});


//Data 
const loaded = ref(false);
const error = ref(false);
const emission: Ref<Emission | undefined> = ref(undefined);
const lastPodcast: Ref<Podcast | undefined> = ref(undefined);


//Composables
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();
const { isPodcastmaker, isEditRights, authOrgaId } = useOrgaComputed();
const { updatePathParams } = useSeoTitleUrl();
const {handle403} = useErrorHandler();
const authStore = useAuthStore();
const filterStore = useFilterStore();
const generalStore= useGeneralStore();
const route= useRoute();
const {
  searchPattern,
  paginateFirst,
  isInit
} = useSimplePageParam(props, true);


//Computed
const name = computed(() => emission.value?.name ?? "");
const description = computed(() => emission.value?.description ?? "");
const editRight = computed(() => isEditRights(emission.value?.orga.id));
const securityRight = computed(() =>{
  return (
    "PUBLIC" === emission.value?.orga?.privacy ||
    ("PRIVATE" === emission.value?.orga?.privacy &&
      ![null, undefined, "PRIVATE"].includes(emission.value?.privateRssType))
  );
});


//Watch
watch(()=>props.emissionId, () => {getEmissionDetails()}, {immediate: true});


onBeforeUnmount(() => {
  generalStore.contentToDisplayUpdate(null);
})

//Methods
function urlify(text:string|undefined){
  return displayHelper.urlify(text);
}
function initError(): void {
  error.value = true;
  loaded.value = true;
}
async function getEmissionDetails(): Promise<void> {
  loaded.value = false;
  error.value = false;
  try {
    emission.value = await classicApi.fetchData<Emission>({
      api: 0,
      path: "emission/" + props.emissionId,
    });
    if (
      "PUBLIC" !== emission.value.orga.privacy &&
      filterStore.filterOrgaId !== emission.value.orga.id &&
      route.query.productor !== emission.value.orga.id
    ) {
      initError();
      return;
    }
    generalStore.contentToDisplayUpdate(emission.value);
    updatePathParams(name.value);
    loaded.value = true;
  } catch (error) {
    handle403(error as AxiosError);
    initError();
  }
}
function podcastsFetched(podcasts: Array<Podcast>) {
  for (const podcast of podcasts) {
    if (
      "READY" === podcast.processingStatus &&
      podcast.availability.visibility
    ) {
      lastPodcast.value = podcast;
      return;
    }
  }
}
</script>
