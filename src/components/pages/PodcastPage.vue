<template>
  <section class="page-box">
    <template v-if="loaded && !error && podcast">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="useEmissionTitle ? podcast.emission.name : titlePage"
        :img-url="podcast.imageUrl"
      />
      <div
        class="d-flex flex-column page-element"
        :class="isPodcastmaker ? 'page-element-podcastmaker' : ''"
      >
        <PodcastModuleBox
          :playing-podcast="playingPodcast"
          :podcast="podcast"
          :podcast-conference="fetchConference"
          @update-podcast="updatePodcast"
        />
        <ShareSocialsButtons
          v-if="state.podcastPage.ShareButtons"
          :organisation-id="podcast.organisation.id"
        />
        <SharePlayer
          v-if="!isPodcastmaker && editRight && !youtubeId"
          :podcast="podcast"
          :emission="podcast?.emission"
          :organisation-id="authOrgaId"
        />
        <CommentSection :podcast="podcast" />

        <!-- Suggestions -->
        <PodcastInlineList
          :emission-id="podcast.emission.emissionId"
          :href="'/main/pub/emission/' + podcast.emission.emissionId"
          :title="t('More episodes of this emission')"
          :button-text="t('All podcast emission button')"
          title-tag="h3"
        />
        <section v-if="!hideSuggestions">
          <ClassicLazy :min-height="550">
            <PodcastInlineList
              class="mt-4"
              title-tag="h3"
              :organisation-id="[podcast.organisation.id]"
              :podcast-id="podcastId"
              :title="t('Suggested listening')"
            />
          </ClassicLazy>
          <ClassicLazy v-for="c in categories" :key="c.id" :min-height="550">
            <PodcastInlineList
              class="mt-4"
              title-tag="h3"
              :iab-id="c.id"
              :href="'/main/pub/category/' + c.id"
              :title="t('More episodes of this category : ', { name: c.name })"
              :button-text="t('All podcast button', { name: c.name })"
              :organisation-id="[podcast.organisation.id]"
            />
          </ClassicLazy>
        </section>
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded ? t('Loading content ...') : undefined"
      :error-text="
        error
          ? t(`This episode is not available for (re)listening`)
          : undefined
      "
    />
  </section>
</template>

<script setup lang="ts">
import youtubeVideoHelper from "../../helper/youtubeVideoHelper";
import {useOrgaComputed} from "../composable/useOrgaComputed";
import PodcastInlineList from "../display/podcasts/PodcastInlineList.vue";
import PodcastModuleBox from "../display/podcasts/PodcastModuleBox.vue";
import ClassicLazy from "../misc/ClassicLazy.vue";
import ClassicLoading from "../form/ClassicLoading.vue";
import classicApi from "../../api/classicApi";
import { state } from "../../stores/ParamSdkStore";
import { useFilterStore } from "../../stores/FilterStore";
import { Podcast } from "@/stores/class/general/podcast";
import {
  Conference,
  ConferencePublicInfo,
} from "@/stores/class/conference/conference";
import {useErrorHandler} from "../composable/useErrorHandler";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import { computed, defineAsyncComponent, onBeforeUnmount, ref, Ref, watch } from "vue";
import { Category } from "@/stores/class/general/category";
import { useAuthStore } from "../../stores/AuthStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { AxiosError } from "axios";
import { useCommentStore } from "../../stores/CommentStore";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { podcastApi } from "../../api/podcastApi";

const ShareSocialsButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareSocialsButtons.vue"),
);
const SharePlayer = defineAsyncComponent(
  () => import("../display/sharing/SharePlayer.vue"),
);
const CommentSection = defineAsyncComponent(
  () => import("../display/comments/CommentSection.vue"),
);
const PodcastmakerHeader = defineAsyncComponent(
  () => import("../display/podcastmaker/PodcastmakerHeader.vue"),
);

//Props 
const props = defineProps<{
  updateStatus?: string;
  playingPodcast?: Podcast;
  podcastId: number;
  /** When true, display emission title in podcastmaker header */
  useEmissionTitle: boolean;
}>();


//Data 
const loaded = ref(false);
const error = ref(false);
const podcast: Ref<Podcast | undefined> = ref(undefined);
const fetchConference: Ref<Conference | undefined> = ref(undefined);
const infoReload: Ref<ReturnType<typeof setTimeout>| undefined> = ref(undefined);
const youtubeId: Ref<string| undefined> = ref(undefined);

//Composables
const route = useRoute();
const { t } = useI18n();
const { isPodcastmaker, isEditRights, authOrgaId } = useOrgaComputed();
const { updatePathParams } = useSeoTitleUrl();
const {handle403} = useErrorHandler();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const filterStore = useFilterStore();
const commentStore = useCommentStore();

//Computed
const hideSuggestions = computed(() =>{
  return (
      "true" ===
      (podcast.value?.emission?.annotations?.["HIDE_SUGGESTIONS"] as
        | string
        | undefined)
    );
});
const emissionMainCategory = computed(() =>{
  if (!podcast.value) {
    return 0;
  }
  if (podcast.value.emission.annotations?.mainIabId) {
    return parseInt(
      podcast.value.emission.annotations.mainIabId as string,
      10,
    );
  } else if(podcast.value.emission.iabIds?.length) {
    return podcast.value.emission.iabIds[0];
  }
  return 0;
});

const categories = computed(() =>{
  if ("undefined" === typeof podcast.value) return [];
  return generalStore.storedCategories
    .filter((item: Category) => {
      return (
        podcast.value?.emission.iabIds &&
        -1 !== podcast.value.emission.iabIds.indexOf(item.id)
      );
    })
    .sort((a: Category, b: Category) => {
      if (a.id === emissionMainCategory.value) return -1;
      if (b.id === emissionMainCategory.value) return 1;
      return 0;
    });
});

const editRight = computed(() =>{
  return isEditRights(podcast.value?.organisation.id);
});

const isLiveReadyToRecord = computed(() =>{
  return (
    undefined !== podcast.value?.conferenceId &&
    0 !== podcast.value?.conferenceId &&
    "READY_TO_RECORD" === podcast.value?.processingStatus
  );
});

const isOctopusAndAnimator = computed(() =>{
  return !isPodcastmaker.value && editRight.value && authStore.isRoleLive;
});

const titlePage = computed(() =>{
  return isLiveReadyToRecord.value? t("Live episode"): t("Episode");
});


//Watch
watch(()=>props.updateStatus, () => {
  if (fetchConference.value && null !== fetchConference.value) {
    fetchConference.value.status = props.updateStatus;
  }
});
watch(()=>props.podcastId, async () => {
  await getPodcastDetails();
  if (!podcast.value || error.value) {
    return;
  }
  commentStore.initCommentUser();
}, {immediate: true});


onBeforeUnmount(() => {
  generalStore.contentToDisplayUpdate(null);
  clearTimeout(infoReload.value);
});


//Methods
async function initConference() {
  if (!podcast.value || undefined == podcast.value.conferenceId || "READY_TO_RECORD" !== podcast.value.processingStatus) return;
  fetchConference.value = { conferenceId: podcast.value.conferenceId, title: "" };
  if (isOctopusAndAnimator.value) {
    try {
      fetchConference.value = await classicApi.fetchData<Conference>({
        api: 9,
        path: "conference/" + podcast.value.conferenceId,
      });
    } catch {
      await fetchConferenceStatus();
    }
  } else {
    await fetchConferenceStatus();
  }
  if (
    fetchConference.value &&
    -1 !== fetchConference.value.conferenceId &&
    "PUBLISHING" !== fetchConference.value.status &&
    "DEBRIEFING" !== fetchConference.value.status
  ) {
    fetchConferenceStatusLoop();
  }
}

async function fetchConferenceStatusLoop() {
  if("PUBLISHING" ===fetchConference.value?.status){
    return;
  }
  infoReload.value = setTimeout(async () => {
    await fetchConferenceStatus();
    fetchConferenceStatusLoop();
  }, 3000);
}
async function fetchConferenceStatus() {
  try {
    const data = await classicApi.fetchData<ConferencePublicInfo>({
      api: 9,
      path: "conference/info/" + podcast.value?.conferenceId,
    });
    fetchConference.value = {...fetchConference.value, ...data};
  } catch {
    //Do nothing
  }
}
function updatePodcast(podcastUpdated: Podcast): void {
  podcast.value = podcastUpdated;
  filterStore.updateOrgaIfNecessary(podcastUpdated.organisation.id);
}
function initError(): void {
  error.value = true;
  loaded.value = true;
}

async function getPodcastDetails(): Promise<void> {
  loaded.value = false;
  error.value = false;
  try {
    const data = await classicApi.fetchData<Podcast>({
      api: 0,
      path: "podcast/" + props.podcastId,
    });
    if (
      "PUBLIC" !== data.organisation.privacy &&
      filterStore.filterOrgaId !== data.organisation.id &&
      route.query.productor !== data.organisation.id
    ) {
      initError();
      return;
    }
    updatePodcast(data);
    generalStore.contentToDisplayUpdate(data);
    if (
      (!podcast.value.availability.visibility ||
        ("READY_TO_RECORD" !== podcast.value.processingStatus &&
          "READY" !== podcast.value.processingStatus &&
          "PROCESSING" !== podcast.value.processingStatus) ||
        false === podcast.value.valid) &&
      !editRight.value
    ) {
      error.value = true;
      loaded.value = true;
      return;
    }
    podcastInProcessing();
    updatePathParams(podcast.value.title);
    await commentStore.getCommentsConfig(podcast.value);
    if((fetchConference.value?.videoProfile?.includes("video_") && "READY_TO_RECORD" === podcast.value.processingStatus) || undefined !== podcast.value.video?.videoId){
      youtubeId.value = youtubeVideoHelper.getYoutubeId(podcast.value?.tags ?? []);
    }
    loaded.value = true;
  } catch (error) {
    handle403(error as AxiosError);
    initError();
  }
}

function podcastInProcessing(){
  if("PLANNED" !== podcast.value?.processingStatus){
    initConference();
    return;
  }
  infoReload.value = setTimeout(async () => {
    const podcast = await podcastApi.get(props.podcastId);
    updatePodcast(podcast);
    podcastInProcessing();
  }, 2000);
}
</script>
