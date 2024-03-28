<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="$t('Emission')"
        :image-url="emission.imageUrl"
      />
      <div
        class="d-flex flex-column page-element"
        :class="isPodcastmaker ? 'page-element-podcastmaker' : ''"
      >
        <div class="module-box">
          <div class="d-flex mb-2">
            <div class="w-100">
              <img
                v-lazy="proxyImageUrl(emission.imageUrl, '250')"
                width="250"
                height="250"
                :alt="$t('Emission name image', { name: name })"
                class="img-box img-box-podcast mb-3 flex-column justify-content-start align-items-start position-relative flex-shrink-0 float-start me-3"
              />
              <div class="h2 mb-3">{{ name }}</div>
              <!-- eslint-disable vue/no-v-html -->
              <p
                class="html-wysiwyg-content descriptionText"
                v-html="urlify(description)"
              />
              <!-- eslint-enable -->
              <div v-if="lastPodcast" class="d-flex align-items-center mt-3">
                <PodcastPlayButton
                  :podcast="lastPodcast"
                  :just-buttons="true"
                />
                <div class="ms-2 fw-bold">
                  {{ $t("Listen to the latest episode") }}
                </div>
              </div>
              <SubscribeButtons
                v-if="isPodcastmaker"
                class="mt-4"
                :emission="emission"
                :window-width="1000"
                :justify-center="false"
              />
            </div>
          </div>
          <EditBox
            v-if="editRight && pageParameters.isEditBox"
            :emission="emission"
            :rss-emission="rssEmission"
            :ftp-emission="ftpEmission"
            @is-updated="getEmissionDetails"
          />
        </div>
        <SharePlayer
          v-if="pageParameters.isSharePlayer && (authenticated || notExclusive)"
          :emission="emission"
          :exclusive="exclusive"
          :not-exclusive="notExclusive"
          :organisation-id="myOrganisationId"
          :is-education="isEducation"
        />
        <div v-if="pageParameters.isDisplayPodcasts" class="module-box">
          <LiveHorizontalList
            v-if="!isPodcastmaker"
            class="mx-2"
            :emission-id="emissionId"
          />
          <PodcastFilterList
            class="mx-2"
            :show-count="true"
            :emission-id="emissionId"
            :category-filter="false"
            :edit-right="editRight"
            :productor-id="[emission.orga.id]"
            @fetch="podcastsFetched"
          />
        </div>
        <ShareButtons
          v-if="pageParameters.isShareButtons"
          :emission="emission"
          :organisation-id="emission.orga.id"
        />
        <ShareDistribution
          v-if="editRight && pageParameters.isShareDistribution"
          :emission-id="emissionId"
        />
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded ? $t('Loading content ...') : undefined"
      :error-text="error ? $t(`Emission doesn't exist`) : undefined"
    />
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import { state } from "../../stores/ParamSdkStore";
import displayMethods from "../mixins/displayMethods";
import imageProxy from "../mixins/imageProxy";
import { orgaComputed } from "../mixins/orgaComputed";
import { handle403 } from "../mixins/handle403";
import { Emission } from "@/stores/class/general/emission";
import ClassicLoading from "../form/ClassicLoading.vue";
import { defineComponent, defineAsyncComponent } from "vue";
import { AxiosError } from "axios";
import { mapActions } from "pinia";
import { useGeneralStore } from "@/stores/GeneralStore";
import { Podcast } from "@/stores/class/general/podcast";
const PodcastFilterList = defineAsyncComponent(
  () => import("../display/podcasts/PodcastFilterList.vue"),
);
const SharePlayer = defineAsyncComponent(
  () => import("../display/sharing/SharePlayer.vue"),
);
const ShareButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareButtons.vue"),
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
export default defineComponent({
  components: {
    PodcastFilterList,
    SharePlayer,
    ShareButtons,
    ShareDistribution,
    EditBox,
    SubscribeButtons,
    LiveHorizontalList,
    ClassicLoading,
    PodcastPlayButton,
    PodcastmakerHeader,
  },
  mixins: [displayMethods, handle403, orgaComputed, imageProxy],
  props: {
    emissionId: { default: undefined, type: Number },
    isEducation: { default: false, type: Boolean },
  },
  emits: ["emissionTitle"],

  data() {
    return {
      loaded: false as boolean,
      title: "" as string,
      emission: undefined as Emission | undefined,
      error: false as boolean,
      rssEmission: false as boolean,
      ftpEmission: false as boolean,
      exclusive: false as boolean,
      notExclusive: false as boolean,
      fetchLive: true as boolean,
      lastPodcast: undefined as Podcast | undefined,
    };
  },

  computed: {
    pageParameters() {
      return {
        isEditBox: state.podcastPage.EditBox as boolean,
        isShareButtons: state.podcastPage.ShareButtons as boolean,
        isSharePlayer: state.podcastPage.SharePlayer as boolean,
        isShareDistribution: state.podcastPage.ShareDistribution as boolean,
        isDisplayPodcasts: state.emissionPage.isDisplayPodcasts as boolean,
      };
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    rssUrl(): string {
      return `${state.generalParameters.ApiUri}rss/emission/${this.emissionId}`;
    },
    name(): string {
      return this.emission?.name ?? "";
    },
    description(): string {
      return this.emission?.description ?? "";
    },
    editRight(): boolean {
      return (
        (true === this.authenticated &&
          this.myOrganisationId === this.emission?.orga.id) ||
        true === state.generalParameters.isAdmin
      );
    },
  },
  watch: {
    emissionId: {
      immediate: true,
      handler() {
        this.getEmissionDetails();
      },
    },
  },
  beforeUnmount() {
    this.contentToDisplayUpdate(null);
  },

  methods: {
    ...mapActions(useGeneralStore, ["contentToDisplayUpdate"]),
    initError(): void {
      this.error = true;
      this.loaded = true;
    },
    handleAnnotations() {
      if (!this.emission?.annotations) return;
      this.rssEmission = "RSS" === this.emission.annotations.SOURCE_KIND;
      this.ftpEmission = "FTP" === this.emission.annotations.SOURCE_KIND;
      if (this.emission.annotations.exclusive) {
        this.exclusive = "true" === this.emission.annotations.exclusive;
        this.exclusive =
          this.exclusive && this.myOrganisationId !== this.emission.orga.id;
      }
      if (this.emission.annotations.notExclusive) {
        this.notExclusive = "true" === this.emission.annotations.notExclusive;
      }
    },
    async getEmissionDetails(): Promise<void> {
      this.loaded = false;
      this.error = false;
      try {
        this.emission = await octopusApi.fetchData<Emission>(
          0,
          "emission/" + this.emissionId,
        );
        if (
          "PUBLIC" !== this.emission.orga.privacy &&
          this.filterOrgaId !== this.emission.orga.id
        ) {
          this.initError();
          return;
        }
        this.contentToDisplayUpdate(this.emission);
        this.$emit("emissionTitle", this.name);
        this.loaded = true;
        this.handleAnnotations();
      } catch (error) {
        this.handle403(error as AxiosError);
        this.initError();
      }
    },
    podcastsFetched(podcasts: Array<Podcast>) {
      for (const podcast of podcasts) {
        if (
          "READY" === podcast.processingStatus &&
          podcast.availability.visibility
        ) {
          this.lastPodcast = podcast;
          return;
        }
      }
    },
  },
});
</script>
