<template>
  <section class="page-box">
    <template v-if="loaded && !error">
      <router-link
        :to="{
          name: 'podcast',
          params: { podcastId: podcastId },
        }"
        class="mt-3 mb-3 w-fit-content d-flex align-items-center"
        :title="$t('Episode name page', { name: podcast?.title })"
      >
        <ChevronLeftIcon />{{ $t("Episode page") }}
      </router-link>
      <div
        v-if="videoId || isLiveReadyToRecord"
        class="d-flex video-page-container"
      >
        <div class="w-70-responsive">
          <template v-if="isLiveReadyToRecord">
            <PlayerVideoHls
              v-if="recordingLive"
              :hls-url="hlsVideoUrl"
              :is-secured="isSecured"
              :responsive="true"
            />
            <div
              v-if="isCounter || overrideText"
              class="d-flex flex-column align-items-center flex-grow-1 blue-bg p-3"
            >
              <CountdownOctopus
                :time-remaining="timeRemaining"
                :override-text="overrideText"
              />
            </div>
          </template>
          <PlayerVideoDigiteka v-else :video-id="videoId" :responsive="true" />
        </div>
        <div class="w-30-responsive info-video-container">
          <div class="d-flex flex-column flex-grow-1 w-100">
            <ClassicNav
              v-if="tabs.length"
              v-model:active-tab="activeTab"
              :tab-number="tabs.length"
              :transparent="true"
            >
              <template v-for="(tab, index) in tabs" #[index]>
                {{ tab }}
              </template>
              <template #tab0>
                <VideoModuleBox
                  :podcast="podcast"
                  :date="date"
                  :duration="duration"
                />
              </template>
              <template #tab1>
                <section>
                  <CommentSection
                    :podcast="podcast"
                    class="module-box-transparent"
                  />
                </section>
              </template>
            </ClassicNav>
            <VideoModuleBox
              v-else
              class="p-2 video-module-box"
              :podcast="podcast"
              :date="date"
              :duration="duration"
              :duration-iso="durationIso"
            />
          </div>
        </div>
      </div>
    </template>
    <div
      v-if="!error && !videoId && !isLiveReadyToRecord"
      class="text-center text-danger h3"
    >
      {{ $t("The episode does not have an associated video") }}
    </div>
    <ClassicLoading
      :loading-text="!loaded ? $t('Loading content ...') : undefined"
      :error-text="
        error
          ? $t(`This episode is not available for (re)listening`)
          : undefined
      "
    />
  </section>
</template>

<script setup lang="ts">
import ChevronLeftIcon from "vue-material-design-icons/ChevronLeft.vue";
import ClassicLoading from "../form/ClassicLoading.vue";
import classicApi from "../../api/classicApi";
import { Podcast } from "@/stores/class/general/podcast";
import ClassicNav from "../misc/ClassicNav.vue";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import {usePodcastView} from "../composable/podcasts/usePodcastView";
import { computed, defineAsyncComponent, onBeforeUnmount, Ref, ref, watch } from "vue";
import { AxiosError } from "axios";
import { useFilterStore } from "../../stores/FilterStore";
import { useAuthStore } from "../../stores/AuthStore";
import { useCommentStore } from "../../stores/CommentStore";
import { useApiStore } from "../../stores/ApiStore";
import { CommentsConfig } from "@/stores/class/config/commentsConfig";
import {
  Conference,
  ConferencePublicInfo,
} from "@/stores/class/conference/conference";
import { usePlayerStore } from "../../stores/PlayerStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
const PlayerVideoDigiteka = defineAsyncComponent(
  () => import("../misc/player/video/PlayerVideoDigiteka.vue"),
);
const PlayerVideoHls = defineAsyncComponent(
  () => import("../misc/player/video/PlayerVideoHls.vue"),
);
const CommentSection = defineAsyncComponent(
  () => import("../display/comments/CommentSection.vue"),
);
const VideoModuleBox = defineAsyncComponent(
  () => import("../display/podcasts/VideoModuleBox.vue"),
);
const CountdownOctopus = defineAsyncComponent(
  () => import("../display/live/CountdownOctopus.vue"),
);

const props = defineProps({
  podcastId:{ default: 0, type: Number },
})

const loaded = ref(false);
const podcast: Ref<Podcast | undefined> = ref(undefined);
const error = ref(false);
const activeTab = ref(0);
const configPodcast: Ref<CommentsConfig | undefined> = ref(undefined);
const podcastConference: Ref<Conference | undefined> = ref(undefined);
const intervalStatusConference: Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);

const { 
  isLiveReadyToRecord,
  isCounter,
  timeRemaining,
  date,
  duration,
  durationIso,
  editRight
} = usePodcastView(podcast, podcastConference);

const { updatePathParams } = useSeoTitleUrl();
const authStore = useAuthStore();
const apiStore = useApiStore();
const generalStore = useGeneralStore();
const playerStore = usePlayerStore();
const filterStore = useFilterStore();
const commentStore = useCommentStore();

const {t} = useI18n();
const route = useRoute();

const videoId = computed(() => podcast.value?.video?.videoId);
const canPostComment = computed(() => {
  return commentStore.getCanPostComment(
    configPodcast.value,
    podcast.value,
    undefined !== authStore.authOrgaId,
  );
});
const tabs = computed(() => {
  if (canPostComment.value) {
    return [t("Information"), t("Comments")];
  }
  return [];
});
const recordingLive = computed(() => {
  return (
        undefined !== podcastConference.value &&
        -1 !== podcastConference.value.conferenceId &&
        ("RECORDING" === podcastConference.value.status ||
          "PENDING" === podcastConference.value.status)
      );
});
const hlsVideoUrl = computed(() => {
  if (!recordingLive.value || !podcastConference.value) {
    return "";
  }
  return `${apiStore.hlsUrl}live/video_dev.${podcastConference.value.conferenceId}/index.m3u8`;
});
const isSecured = computed(() => {
  return "SECURED" === podcast.value?.organisation?.privacy;
});
const overrideText = computed(() => {
  if ("PUBLISHING" !== podcastConference.value?.status) {
    return;
  }
  return t("In the process of being published");
});


watch(()=>props.podcastId, async () => {
  await getPodcastDetails();
  if (!podcast.value) {
    return;
  }
  commentStore.initCommentUser();
  configPodcast.value = await commentStore.getCommentsConfig(podcast.value);
}, {immediate: true});


onBeforeUnmount(() => {
  clearInterval(intervalStatusConference.value as unknown as number);
})

async function getPodcastDetails(): Promise<void> {
  loaded.value = false;
  error.value = false;
  try {
    podcast.value = await classicApi.fetchData<Podcast>({
      api: 0,
      path: "podcast/" + props.podcastId,
    });
    document.title = podcast.value.title + " - "+generalStore.metaTitle;
    const orga = podcast.value.organisation;
    const privateAccess =
      "PUBLIC" !== orga.privacy &&
      filterStore.filterOrgaId !== orga.id &&
      route.query.productor !== orga.id;
    const notValid =
      (!podcast.value.availability.visibility ||
        !["READY_TO_RECORD", "READY", "PROCESSING"].includes(
          podcast.value.processingStatus ?? "",
        ) ||
        !podcast.value.valid) &&
      !editRight.value;
    if (privateAccess || notValid) {
      error.value = true;
    } else {
      updatePathParams(podcast.value.title);
      if (
        podcast.value.conferenceId &&
        "READY" !== podcast.value.processingStatus
      ) {
        await fetchConferenceStatus();
        intervalStatusConference.value = setInterval(() => { fetchConferenceStatus(); }, 3000);
        playerStore.playerPlay(
          {
            ...podcast.value,
            ...{ conferenceId: podcast.value.conferenceId },
          },
          true,
        );
      }
    }
  } catch (errorCatched) {
    this.handle403(errorCatched as AxiosError);
    error.value = true;
  }
  loaded.value = true;
}

async function fetchConferenceStatus() {
  if (!podcast.value?.conferenceId) {
    return;
  }
  const data = await classicApi.fetchData<ConferencePublicInfo>({
    api: 9,
    path: "conference/info/" + podcast.value.conferenceId,
  });
  podcastConference.value = {
    ...data,
    ...{
      conferenceId: podcast.value.conferenceId,
      title: "",
    },
  };
  if ("DEBRIEFING" === data.status) {
    clearInterval(intervalStatusConference.value as unknown as number);
  }
}
</script>
<style lang="scss">


.octopus-app .video-page-container {
  align-items: stretch;
  flex-grow: 1;
  background: var(--octopus-primary-really-transparent);
  border-radius: var(--octopus-border-radius);
  box-shadow: 0 0 10px 1px var(--octopus-primary-transparent);

  .info-video-container {
    display: flex;
    flex-direction: column;

    .octopus-tab-pane,
    .video-module-box {
      height: 0;
      overflow-y: auto;

      @media (width <= 960px) {
        height: inherit;
      }
    }

    .classic-nav-tab-container {
      flex-direction: column;
    }
  }

  .module-box.module-box-transparent {
    margin: 0;
    background: transparent;
    border: 0;
    padding: 0;
  }

  .w-70-responsive {
    width: 70%;
    aspect-ratio: 16/9;
  }

  .w-30-responsive {
    width: 30%;
  }

  .w-70-responsive,
  .w-30-responsive {
    display: flex;
    align-items: stretch;
    flex-grow: 1;

    @media (width <= 960px) {
      width: 100%;
      padding: 0 !important;
    }
  }

  .really-light-secondary-bg {
    background: white;
  }
}
</style>
