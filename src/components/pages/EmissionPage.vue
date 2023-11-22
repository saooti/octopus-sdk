<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <div class="page-element-title-container">
        <div class="page-element-title">
          <h1>{{ $t("Emission") }}</h1>
        </div>
        <div class="page-element-bg" :style="backgroundDisplay" />
      </div>
      <div class="d-flex flex-column page-element">
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
              <div class="text-uppercase h2 mb-3">{{ name }}</div>
              <!-- eslint-disable vue/no-v-html -->
              <p
                class="html-wysiwyg-content descriptionText"
                v-html="urlify(description)"
              />
              <!-- eslint-enable -->
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
        <ShareButtons
          v-if="pageParameters.isShareButtons"
          :emission="emission"
          :organisation-id="emission.orga.id"
        />
        <SubscribeButtons
          v-if="pageParameters.isShareButtons && countLink >= 1"
          :emission="emission"
        />
        <ShareDistribution
          v-if="editRight && pageParameters.isShareDistribution"
          :emission-id="emissionId"
        />
        <template v-if="pageParameters.isDisplayPodcasts">
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
          />
        </template>
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
    countLink(): number {
      const platformShare = [
        "amazon",
        "googlePodcasts",
        "applePodcast",
        "deezer",
        "spotify",
        "tunein",
        "radioline",
        "podcastAddict",
        "playerFm",
        "pocketCasts",
        "iHeart",
      ];
      let count = 0;
      for (let i = 0, len = platformShare.length; i < len; i++) {
        if (undefined !== this.emission?.annotations?.[platformShare[i]])
          count++;
      }
      return count;
    },
    backgroundDisplay(): string {
      if (!this.emission) {
        return "";
      }
      return `background-image: url('${this.proxyImageUrl(
        this.emission.imageUrl,
        "250",
      )}');`;
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
  methods: {
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
        this.$emit("emissionTitle", this.name);
        this.loaded = true;
        this.handleAnnotations();
      } catch (error) {
        this.handle403(error as AxiosError);
        this.initError();
      }
    },
  },
});
</script>
