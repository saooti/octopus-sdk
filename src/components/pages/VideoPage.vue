<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <router-link
        :to="{
          name: 'podcast',
          params: { podcastId: podcastId },
          query: { productor: filterOrgaId },
        }"
        class="mt-3 mb-3 width-fit-content"
      >
        <span class="saooti-left" />{{ $t("Episode page") }}
      </router-link>
      <div
        v-if="videoId || isLiveReadyToRecord"
        class="d-flex video-page-container"
      >
        <div class="w-70-responsive">
          <template v-if="isLiveReadyToRecord">
            <PlayerVideoHls
              v-if="recordingLive"
              :hls-url="hlsUrl"
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
                <CommentSection
                  :podcast="podcast"
                  class="module-box-transparent"
                />
              </template>
            </ClassicNav>
            <VideoModuleBox
              v-else
              class="p-2 video-module-box"
              :podcast="podcast"
              :date="date"
              :duration="duration"
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
  </div>
</template>

<script lang="ts">
import ClassicLoading from "../form/ClassicLoading.vue";
import classicApi from "../../api/classicApi";
import { Podcast } from "@/stores/class/general/podcast";
import ClassicNav from "../misc/ClassicNav.vue";
import { handle403 } from "../mixins/handle403";
import podcastView from "../mixins/podcast/podcastView";
import { defineAsyncComponent, defineComponent } from "vue";
import { AxiosError } from "axios";
import { useFilterStore } from "../../stores/FilterStore";
import { useAuthStore } from "../../stores/AuthStore";
import { useCommentStore } from "../../stores/CommentStore";
import { useApiStore } from "../../stores/ApiStore";
import { mapActions, mapState } from "pinia";
import { CommentsConfig } from "@/stores/class/config/commentsConfig";
import {
  Conference,
  ConferencePublicInfo,
} from "@/stores/class/conference/conference";
import { usePlayerStore } from "../../stores/PlayerStore";
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
export default defineComponent({
  name: "VideoPage",
  components: {
    ClassicLoading,
    PlayerVideoDigiteka,
    ClassicNav,
    CommentSection,
    VideoModuleBox,
    PlayerVideoHls,
    CountdownOctopus,
  },

  mixins: [handle403, podcastView],

  props: {
    podcastId: { default: 0, type: Number },
  },

  data() {
    return {
      loaded: false as boolean,
      podcast: undefined as Podcast | undefined,
      error: false as boolean,
      activeTab: 0 as number,
      configPodcast: undefined as CommentsConfig | undefined,
      podcastConference: undefined as Conference | undefined,
      intervalStatusConference: undefined as
        | ReturnType<typeof setTimeout>
        | undefined,
    };
  },
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(useAuthStore, ["authOrgaId"]),
    ...mapState(useApiStore, ["hlsUrl"]),
    videoId(): string | undefined {
      return this.podcast?.video?.videoId;
    },
    tabs(): Array<string> {
      if (this.canPostComment) {
        return [this.$t("Information"), this.$t("Comments")];
      }
      return [];
    },
    canPostComment(): boolean {
      return this.getCanPostComment(
        this.configPodcast,
        this.podcast,
        undefined !== this.authOrgaId,
      );
    },
    recordingLive(): boolean {
      return (
        undefined !== this.podcastConference &&
        -1 !== this.podcastConference.conferenceId &&
        ("RECORDING" === this.podcastConference.status ||
          "PENDING" === this.podcastConference.status)
      );
    },
    hlsUrl(): string {
      if (!this.recordingLive || !this.podcastConference) {
        return "";
      }
      return `${this.hlsUrl}live/video_dev.${this.podcastConference.conferenceId}/index.m3u8`;
    },
    overrideText(): string | undefined {
      if ("PUBLISHING" !== this.podcastConference?.status) {
        return;
      }
      return this.$t("In the process of being published");
    },
  },
  watch: {
    podcastId: {
      immediate: true,
      async handler() {
        await this.getPodcastDetails();
        if (!this.podcast) {
          return;
        }
        this.initCommentUser();
        this.configPodcast = await this.getCommentsConfig(this.podcast);
      },
    },
  },
  unmounted() {
    clearInterval(this.intervalStatusConference as unknown as number);
  },

  methods: {
    ...mapActions(usePlayerStore, ["playerPlay"]),
    ...mapActions(useCommentStore, [
      "getCommentsConfig",
      "getCanPostComment",
      "initCommentUser",
    ]),
    async getPodcastDetails(): Promise<void> {
      this.loaded = false;
      this.error = false;
      try {
        this.podcast = await classicApi.fetchData<Podcast>({
          api: 0,
          path: "podcast/" + this.podcastId,
        });
        document.title = this.podcast.title;
        const orga = this.podcast.organisation;
        const privateAccess =
          "PUBLIC" !== orga.privacy &&
          this.filterOrgaId !== orga.id &&
          this.$route.query.productor !== orga.id;
        const notValid =
          (!this.podcast.availability.visibility ||
            !["READY_TO_RECORD", "READY", "PROCESSING"].includes(
              this.podcast.processingStatus ?? "",
            ) ||
            !this.podcast.valid) &&
          !this.editRight;
        if (privateAccess || notValid) {
          this.error = true;
        } else if (this.podcast.conferenceId) {
          await this.fetchConferenceStatus();
          this.intervalStatusConference = setInterval(() => {
            this.fetchConferenceStatus();
          }, 3000);
          this.playerPlay(
            { ...this.podcast, ...{ conferenceId: this.podcast.conferenceId } },
            true,
          );
        }
      } catch (error) {
        this.handle403(error as AxiosError);
        this.error = true;
      }
      this.loaded = true;
    },
    async fetchConferenceStatus() {
      if (!this.podcast?.conferenceId) {
        return;
      }
      const data = await classicApi.fetchData<ConferencePublicInfo>({
        api: 9,
        path: "conference/info/" + this.podcast.conferenceId,
      });
      this.podcastConference = {
        ...data,
        ...{
          conferenceId: this.podcast.conferenceId,
          title: "",
        },
      };
      if ("DEBRIEFING" === data.status) {
        clearInterval(this.intervalStatusConference as unknown as number);
      }
    },
  },
});
</script>
<style lang="scss">
@use "@scss/variables" as octopusVariables;
.octopus-app .video-page-container {
  align-items: stretch;
  flex-grow: 1;
  background: octopusVariables.$primaryColorReallyTransparent;
  border-radius: octopusVariables.$octopus-borderradius;
  box-shadow: 0 0 10px 1px octopusVariables.$primaryColorTransparent;
  .info-video-container {
    display: flex;
    flex-direction: column;
    .octopus-tab-pane,
    .video-module-box {
      height: 0;
      overflow-y: auto;
      @media (max-width: 960px) {
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
    @media (max-width: 960px) {
      width: 100%;
      padding: 0 !important;
    }
  }
  .really-light-secondary-bg {
    background: white;
  }
}
</style>
