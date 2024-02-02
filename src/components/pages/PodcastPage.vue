<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :pageTitle="titlePage"
        :imageUrl="podcast.imageUrl"
      />
      <div class="d-flex flex-column page-element">
        <PodcastModuleBox
          :playing-podcast="playingPodcast"
          :podcast="podcast"
          :fetch-conference="fetchConference"
          @update-podcast="updatePodcast"
        />
        <SharePlayer
          v-if="pageParameters.isSharePlayer && (authenticated || notExclusive)"
          :podcast="podcast"
          :emission="podcast.emission"
          :exclusive="exclusive"
          :not-exclusive="notExclusive"
          :organisation-id="myOrganisationId"
          :is-education="isEducation"
        />
        
        <CommentSection
          v-if="!isPodcastmaker && isComments"
          ref="commentSection"
          :podcast="podcast"
          :fetch-conference="fetchConference"
        />
        <PodcastInlineList
          class="mt-4 module-box"
          :emission-id="podcast.emission.emissionId"
          :href="'/main/pub/emission/' + podcast.emission.emissionId"
          :title="$t('More episodes of this emission')"
          :button-text="$t('All podcast emission button')"
        />
        <ShareButtons
          v-if="pageParameters.isShareButtons"
          :podcast="podcast"
          :organisation-id="podcast.organisation.id"
        />
        <ClassicLazy :min-height="550">
          <PodcastInlineList
            :podcast-id="podcastId"
            :title="$t('Suggested listening')"
          />
        </ClassicLazy>
        <ClassicLazy v-for="c in categories" :key="c.id" :min-height="550">
          <PodcastInlineList
            :iab-id="c.id"
            :href="'/main/pub/category/' + c.id"
            :title="$t('More episodes of this category : ', { name: c.name })"
            :button-text="$t('All podcast button', { name: c.name })"
          />
        </ClassicLazy>
      </div>
    </template>
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
import imageProxy from "../mixins/imageProxy";
import { orgaComputed } from "../mixins/orgaComputed";
import PodcastInlineList from "../display/podcasts/PodcastInlineList.vue";
import PodcastModuleBox from "../display/podcasts/PodcastModuleBox.vue";
import ClassicLazy from "../misc/ClassicLazy.vue";
import ClassicLoading from "../form/ClassicLoading.vue";
import octopusApi from "@saooti/octopus-api";
import crudApi from "@/api/classicCrud";
import { state } from "../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import {
  Conference,
  ConferencePublicInfo,
} from "@/stores/class/conference/conference";
import { handle403 } from "../mixins/handle403";
import { defineComponent, defineAsyncComponent } from "vue";
import { CommentPodcast } from "@/stores/class/general/comment";
import { Category } from "@/stores/class/general/category";
import { useGeneralStore } from "@/stores/GeneralStore";
import { mapState, mapActions } from "pinia";
import { AxiosError } from "axios";
const ShareButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareButtons.vue"),
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
export default defineComponent({
  name: "PodcastPage",
  components: {
    PodcastInlineList,
    ShareButtons,
    SharePlayer,
    CommentSection,
    PodcastModuleBox,
    ClassicLoading,
    ClassicLazy,
    PodcastmakerHeader
  },

  mixins: [handle403, orgaComputed, imageProxy],

  props: {
    updateStatus: { default: undefined, type: String },
    playingPodcast: { default: undefined, type: Object as () => Podcast },
    podcastId: { default: 0, type: Number },
    isEducation: { default: false, type: Boolean },
  },

  emits: ["initConferenceId", "podcastTitle"],

  data() {
    return {
      loaded: false as boolean,
      podcast: undefined as Podcast | undefined,
      error: false as boolean,
      exclusive: false as boolean,
      notExclusive: false as boolean,
      fetchConference: undefined as Conference | undefined,
    };
  },

  computed: {
    ...mapState(useGeneralStore, ["storedCategories"]),
    isComments(): boolean {
      if (!this.podcast) return true;
      let podcastComment = "INHERIT";
      if (this.podcast.annotations?.COMMENTS) {
        podcastComment = this.podcast.annotations.COMMENTS as string;
      }
      let organisationComment = "LIVE_ONLY";
      if (this.podcast.organisation.comments) {
        organisationComment = this.podcast.organisation.comments;
      }
      return !(
        "NO" === podcastComment ||
        ("INHERIT" === podcastComment && "NO" === organisationComment) ||
        ("LIVE_RECORD" === podcastComment &&
          "READY_TO_RECORD" !== this.podcast.processingStatus) ||
        ("INHERIT" === podcastComment &&
          "LIVE_ONLY" === organisationComment &&
          !this.podcast.conferenceId &&
          0 !== this.podcast.conferenceId)
      );
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    pageParameters() {
      return {
        isShareButtons: state.podcastPage.ShareButtons as boolean,
        isSharePlayer: state.podcastPage.SharePlayer as boolean,
      };
    },
    emissionMainCategory(): number {
      if (!this.podcast) {
        return 0;
      }
      if (this.podcast.emission.annotations?.mainIabId) {
        return parseInt(
          this.podcast.emission.annotations.mainIabId as string,
          10,
        );
      } else if (this.podcast.emission.iabIds?.length) {
        return this.podcast.emission.iabIds[0];
      }
      return 0;
    },
    categories(): Array<Category> {
      if ("undefined" === typeof this.podcast) return [];
      return this.storedCategories
        .filter((item: Category) => {
          return (
            this.podcast?.emission.iabIds &&
            -1 !== this.podcast.emission.iabIds.indexOf(item.id)
          );
        })
        .sort((a: Category, b: Category) => {
          if (a.id === this.emissionMainCategory) return -1;
          if (b.id === this.emissionMainCategory) return 1;
          return 0;
        });
    },
    editRight(): boolean {
      return (
        (true === this.authenticated &&
          this.myOrganisationId === this.podcast?.organisation.id) ||
        true === state.generalParameters.isAdmin
      );
    },
    isLiveReadyToRecord(): boolean {
      return (
        undefined !== this.podcast?.conferenceId &&
        0 !== this.podcast?.conferenceId &&
        "READY_TO_RECORD" === this.podcast?.processingStatus
      );
    },
    isOctopusAndAnimator(): boolean {
      return (
        !this.isPodcastmaker &&
        this.editRight &&
        (state.generalParameters.isRoleLive as boolean)
      );
    },
    titlePage(): string {
      return this.isLiveReadyToRecord
        ? this.$t("Live episode")
        : this.$t("Episode");
    },
  },
  watch: {
    updateStatus(): void {
      if (this.fetchConference && null !== this.fetchConference) {
        this.fetchConference.status = this.updateStatus;
      }
    },
    podcastId: {
      immediate: true,
      async handler() {
        await this.getPodcastDetails();
        this.initConference();
      },
    },
  },
  beforeUnmount(){
    this.contentToDisplayUpdate(null);
  },

  methods: {
    ...mapActions(useGeneralStore, ["contentToDisplayUpdate"]),
    async fetchConferencePublic() {
      const data = await octopusApi.fetchData<ConferencePublicInfo>(
        9,
        "conference/info/" + this.podcast?.conferenceId,
      );
      this.fetchConference = {
        ...data,
        ...{
          conferenceId: this.podcast?.conferenceId ?? 0,
          title: "",
        },
      };
    },
    async initConference() {
      if (!this.podcast || undefined == this.podcast.conferenceId) return;
      if (this.isOctopusAndAnimator) {
        try {
          const data = await crudApi.fetchData<Conference>(
            9,
            "conference/" + this.podcast.conferenceId,
          );
          this.fetchConference = data ?? { conferenceId: -1, title: "" };
        } catch {
          await this.fetchConferencePublic();
        }
      } else {
        await this.fetchConferencePublic();
      }
      if (
        this.fetchConference &&
        -1 !== this.fetchConference.conferenceId &&
        "PUBLISHING" !== this.fetchConference.status &&
        "DEBRIEFING" !== this.fetchConference.status
      ) {
        this.$emit("initConferenceId", this.podcast.conferenceId);
      }
    },
    updatePodcast(podcastUpdated: Podcast): void {
      this.podcast = podcastUpdated;
    },
    initError(): void {
      this.error = true;
      this.loaded = true;
    },
    handleAnnotations() {
      if (!this.podcast) {
        return;
      }
      if (this.podcast.emission.annotations?.exclusive) {
        this.exclusive = "true" === this.podcast.emission.annotations.exclusive;
        this.exclusive =
          this.exclusive &&
          this.myOrganisationId !== this.podcast.organisation.id;
      }
      if (this.podcast.emission.annotations?.notExclusive) {
        this.notExclusive =
          "true" === this.podcast.emission.annotations.notExclusive;
      }
    },
    async getPodcastDetails(): Promise<void> {
      this.loaded = false;
      this.error = false;
      try {
        const data: Podcast = await octopusApi.fetchData<Podcast>(
          0,
          "podcast/" + this.podcastId,
        );
        if (
          "PUBLIC" !== data.organisation.privacy &&
          this.filterOrgaId !== data.organisation.id
        ) {
          this.initError();
          return;
        }
        this.podcast = data;
        this.contentToDisplayUpdate(data);
        this.$emit("podcastTitle", this.podcast.title);
        this.handleAnnotations();
        if (
          (!this.podcast.availability.visibility ||
            ("READY_TO_RECORD" !== this.podcast.processingStatus &&
              "READY" !== this.podcast.processingStatus &&
              "PROCESSING" !== this.podcast.processingStatus) ||
            false === this.podcast.valid) &&
          !this.editRight
        ) {
          this.error = true;
        }
        this.loaded = true;
      } catch (error) {
        this.handle403(error as AxiosError);
        this.initError();
      }
    },

    receiveCommentEvent(event: {
      type: string;
      comment: CommentPodcast;
      oldStatus?: string;
    }): void {
      (
        this.$refs.commentSection as InstanceType<typeof CommentSection>
      ).receiveCommentEvent(event);
    },
  },
});
</script>
