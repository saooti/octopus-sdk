<template>
  <div class="module-box overflow-visible">
    <div class="d-flex justify-content-between align-items-center">
      <h2 class="mb-3">
        {{ $t("Embed") }}
      </h2>
      <div
        v-if="noAd && !isEducation"
        class="sticker"
        :title="$t('You cannot insert advertising')"
      >
        {{ $t("No advertising") }}
      </div>
    </div>
    <template v-if="!exclusive && (authenticated || notExclusive)">
      <div class="d-flex">
        <iframe
          id="miniplayerIframe"
          title="miniplayer"
          allowfullscreen="true"
          allow="clipboard-read; clipboard-write; autoplay"
          referrerpolicy="no-referrer-when-downgrade"
          :src="iFrameSrc"
          width="100%"
          :height="iFrameHeight"
          class="max-iframe mx-3"
        />
        <div class="d-flex flex-column flex-grow-1">
          <SharePlayerTypes
            v-model:iFrameModel="iFrameModel"
            v-model:typeCustomPlayer="typeCustomPlayer"
            :podcast="podcast"
            :emission="emission"
            :playlist="playlist"
            :organisation-id="organisationId"
            :is-live="isLiveReadyToRecord"
          />
          <SharePlayerColors
            v-model:color="color"
            v-model:theme="theme"
            class="mt-3"
          />
          <ClassicCheckbox
            v-if="isPodcastNotVisible || playlist"
            v-model:textInit="isVisible"
            id-checkbox="is-visible-checkbox"
            :label="titleStillAvailable"
          />
          <PlayerParameters
            v-model:display-article="displayArticle"
            v-model:display-transcript="displayTranscript"
            v-model:display-wave="displayWave"
            v-model:proceed-reading="proceedReading"
            v-model:is-visible="isVisible"
            v-model:player-auto-play="playerAutoPlay"
            :is-visible="isVisible"
            :chose-number-episode="choseNumberEpisodes"
            :display-choice-all-episodes="displayChoiceAllEpisodes"
            :display-transcript-param="displayTranscriptParam"
            :display-article-param="displayArticleParam"
            :display-wave-param="displayWaveParam"
            @i-frame-number="iFrameNumber = $event"
            @episode-numbers="episodeNumbers = $event"
          />
          <PlayerCommonParameters
            v-if="displayInsertCode"
            v-model:insertCode="insertCode"
          />
          <ShareModalPlayer
            v-if="isShareModal"
            :embed-link="iFrame"
            :embedly-link="iFrameSrc"
            :direct-link="podcast"
            @close="isShareModal = false"
          />
          <button
            class="btn btn-primary width-fit-content mt-3"
            @click="isShareModal = true"
          >
            {{ $t("Share the player") }}
          </button>
        </div>
      </div>
    </template>
    <div v-else-if="exclusive && authenticated">
      {{ $t("Only organisation members can share the content") }}
    </div>
    <div v-else-if="!authenticated">
      {{ $t("Only authenticated members can share the content") }}
    </div>
  </div>
</template>

<script lang="ts">
import { orgaComputed } from "../../mixins/orgaComputed";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
import { useAuthStore } from "@/stores/AuthStore";
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
import { mapState, mapActions } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
const ShareModalPlayer = defineAsyncComponent(
  () => import("../../misc/modal/ShareModalPlayer.vue"),
);
const PlayerParameters = defineAsyncComponent(
  () => import("./PlayerParameters.vue"),
);
const PlayerCommonParameters = defineAsyncComponent(
  () => import("./PlayerCommonParameters.vue"),
);
const SharePlayerTypes = defineAsyncComponent(
  () => import("./SharePlayerTypes.vue"),
);
const SharePlayerColors = defineAsyncComponent(
  () => import("./SharePlayerColors.vue"),
);
const ClassicCheckbox = defineAsyncComponent(
  () => import("../../form/ClassicCheckbox.vue"),
);
export default defineComponent({
  components: {
    ShareModalPlayer,
    SharePlayerColors,
    PlayerParameters,
    SharePlayerTypes,
    ClassicCheckbox,
    PlayerCommonParameters,
  },
  mixins: [orgaComputed],
  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    emission: { default: undefined, type: Object as () => Emission },
    playlist: { default: undefined, type: Object as () => Playlist },
    organisationId: { default: undefined, type: String },
    isEducation: { default: false, type: Boolean },
    exclusive: { default: false, type: Boolean },
    notExclusive: { default: true, type: Boolean },
  },

  data() {
    return {
      typeCustomPlayer: "",
      iFrameModel: "default" as string,
      isShareModal: false as boolean,
      color: "#40a372" as string,
      theme: "#000000" as string,
      proceedReading: true as boolean,
      episodeNumbers: "number" as string,
      iFrameNumber: "3" as string,
      isVisible: false as boolean,
      displayArticle: true as boolean,
      displayTranscript: true as boolean,
      displayWave: false as boolean,
      playerAutoPlay: false as boolean,
      orgaAttributes: undefined as
        | { [key: string]: string | number | boolean | undefined }
        | undefined,
      insertCode: false as boolean,
    };
  },

  computed: {
    ...mapState(useAuthStore, ["authOrganisation"]),
    displayWaveParam(): boolean {
      return "default" === this.iFrameModel || "emission" === this.iFrameModel;
    },
    choseNumberEpisodes():boolean{
      return this.displayChoiceAllEpisodes || this.isTypeSuggestion;
    },
    displayArticleParam(): boolean {
      return (
        undefined !== this.podcast &&
        undefined !== this.podcast.article &&
        0 !== this.podcast.article.length &&
        ("default" === this.iFrameModel ||
          "large" === this.iFrameModel ||
          "largeMore" === this.iFrameModel)
      );
    },
    displayInsertCode(): boolean {
      let orgaResourceId = "";
      if (this.podcast) {
        orgaResourceId = this.podcast.organisation.id;
      }
      if (this.emission) {
        orgaResourceId = this.emission.orga.id;
      }
      if (this.playlist) {
        orgaResourceId = this.playlist.organisation?.id ?? "";
      }
      return this.authenticated && orgaResourceId === this.myOrganisationId;
    },
    displayTranscriptParam(): boolean {
      return (
        this.isTranscriptionAuthorize && (this.isDefault || this.isEmission)
      );
    },
    isTranscriptionAuthorize(): boolean {
      if (!this.orgaAttributes) {
        return false;
      }
      return this.orgaAttributes &&
        Object.hasOwn(this.orgaAttributes, "speechtotext.active")
        ? (this.orgaAttributes["speechtotext.active"] as boolean)
        : false;
    },
    displayChoiceAllEpisodes(): boolean {
      return !this.podcast || this.isTypeEmission;
    },
    baseUrl(): string {
      return state.podcastPage.MiniplayerUri as string;
    },
    isDefault(): boolean {
      return "default" === this.iFrameModel;
    },
    isEmission(): boolean {
      return "emission" === this.iFrameModel;
    },
    isLargeEmission(): boolean {
      return "emissionLarge" === this.iFrameModel;
    },
    isTypeSuggestion(): boolean {
      return "largeSuggestion" === this.iFrameModel || "SUGGESTION"===this.typeCustomPlayer;
    },
    isTypeEmission():boolean{
      return this.isEmission || this.isLargeEmission || "EMISSION"===this.typeCustomPlayer;
    },
    titleStillAvailable(): string {
      return this.isPodcastNotVisible
        ? this.$t("Podcast still available")
        : this.$t("Podcasts still available");
    },
    isLiveReadyToRecord(): boolean {
      if (this.podcast)
        return (
          undefined !== this.podcast.conferenceId &&
          0 !== this.podcast.conferenceId &&
          this.podcast.processingStatus === "READY_TO_RECORD"
        );
      return false;
    },
    noAd(): boolean {
      return (
        (this.podcast?.organisation.id !== this.organisationId &&
          "NO" === this.podcast?.monetisable) ||
        ("UNDEFINED" === this.podcast?.monetisable &&
          "NO" === this.podcast?.emission.monetisable)
      );
    },
    iFrameSrc(): string {
      if ("video" === this.iFrameModel) {
        return (
          "https://www.ultimedia.com/deliver/generic/iframe/mdtk/01009833/zone/1/showtitle/1/src/" +
          this.podcast?.video?.videoId +
          "/sound/true"
        );
      }
      let url = [""];
      let iFrameNumber =
        this.displayChoiceAllEpisodes && "all" === this.episodeNumbers
          ? "/0"
          : "/" + this.iFrameNumber;
      url.push(`${this.baseUrl}miniplayer/`);
      if (!this.podcast && !this.playlist && this.emission) {
        url = this.constructEmissionUrl(url);
      } else if (this.playlist) {
        url = this.constructPlaylistUrl(url);
      } else if (this.emission && this.podcast) {
        url.push(`${this.iFrameModel}/`);
        if (this.isTypeEmission) {
          url.push(
            `${this.emission.emissionId}${iFrameNumber}/${this.podcast.podcastId}`,
          );
        } else if (this.isTypeSuggestion) {
          url.push(`${this.podcast.podcastId}${iFrameNumber}`);
        } else {
          url.push(`${this.podcast.podcastId}`);
        }
      }
      return this.addUrlParameters(url).join("");
    },
    iFrameHeight(): string {
      switch (this.iFrameModel) {
        case "video":
          return "281px";
        case "large":
          if (this.podcast) return "140px";
          return "350px";
        case "largeMore":
          return "210px";
        case "emissionLarge":
        case "largeSuggestion":
          return "350px";
        case "emission":
          return "520px";
        case "videoLive":
          return "450px";
        default:
          return "530px";
      }
    },
    iFrame(): string {
      const specialDigiteka = this.podcast?.video?.videoId
        ? 'allowfullscreen="true" referrerpolicy="no-referrer-when-downgrade"'
        : "";
      return `<iframe src="${this.iFrameSrc}" width="100%" height="${this.iFrameHeight}" scrolling="no" frameborder="0" ${specialDigiteka} allow="clipboard-read; clipboard-write; autoplay"></iframe>`;
    },
    isPodcastNotVisible(): boolean {
      return (
        undefined !== this.podcast &&
        !this.podcast.availability.visibility &&
        ("default" === this.iFrameModel || "large" === this.iFrameModel)
      );
    },
    dataTitle(): number {
      if (this.podcast) return this.podcast.podcastId;
      if (this.emission) return this.emission.emissionId;
      if (this.playlist) return this.playlist.playlistId;
      return 0;
    },
  },
  created() {
    this.initSharePlayer();
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    async initSharePlayer() {
      const orgaId =
        "" !== this.authOrganisation.id
          ? this.authOrganisation.id
          : state.generalParameters.organisationId;
      this.orgaAttributes = await this.getOrgaAttributes(orgaId ?? "");
      this.initColor();
      if (this.isLiveReadyToRecord) {
        this.iFrameModel = "large";
      }
      if ("true" === this.podcast?.annotations?.["fromTTS"]) {
        this.displayTranscript = false;
      }
    },
    getIframeNumber(): string {
      return this.displayChoiceAllEpisodes && "all" === this.episodeNumbers
        ? "/0"
        : "/" + this.iFrameNumber;
    },
    constructEmissionUrl(url: Array<string>) {
      if (!this.emission) {
        return [];
      }
      switch (this.iFrameModel) {
        case "default":
          url.push("emission");
          break;
        case "large":
          url.push("emissionLarge");
          break;
        default:
          url.push(`${this.iFrameModel}`);
          break;
      }
      url.push(`/${this.emission.emissionId}${this.getIframeNumber()}`);
      return url;
    },
    constructPlaylistUrl(url: Array<string>) {
      if (!this.playlist) {
        return [];
      }
      switch (this.iFrameModel) {
        case "default":
          url.push("playlist");
          break;
        case "large":
          url.push("playlistLarge");
          break;
        default:
          url.push(`${this.iFrameModel}`);
          break;
      }
      url.push(`/${this.playlist.playlistId}`);
      return url;
    },
    addUrlParameters(url: Array<string>) {
      url.push("?distributorId=" + this.organisationId);
      url.push(
        `&color=${this.color.substring(1)}&theme=${this.theme.substring(1)}`,
      );
      if (!this.proceedReading) {
        url.push("&proceed=false");
      }
      if (!this.displayArticle && this.displayArticleParam) {
        url.push("&article=false");
      }
      if (!this.displayTranscript) {
        url.push("&transcript=false");
      }
      if (!this.displayWave) {
        url.push("&wave=false");
      }
      if (this.playerAutoPlay) {
        url.push("&autoplay=true");
      }
      if (this.isVisible) {
        url.push("&key=" + window.btoa(this.dataTitle.toString()));
      }
      if (this.insertCode) {
        url.push("&insertCode=true");
      }
      return url;
    },
    initColor(): void {
      if (!this.orgaAttributes) {
        return;
      }
      this.color = Object.hasOwn(this.orgaAttributes, "COLOR")
        ? (this.orgaAttributes.COLOR as string)
        : "#40a372";
      this.theme = Object.hasOwn(this.orgaAttributes, "THEME")
        ? (this.orgaAttributes.THEME as string)
        : "#000000";
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
@import "../../../assets/iframe.scss";
.octopus-app {
  .sticker {
    align-self: center;
    background: $octopus-primary-color;
    padding: 0.5rem;
    transition: all 0.5s ease;
    color: white;
    font-weight: bold;
    letter-spacing: 1px;
    box-shadow: 10px 10px 34px -15px hsla(0, 0%, 0%, 0.4);
    border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
    border: solid 2px #41403e;
    &:hover {
      box-shadow: 2px 8px 4px -6px hsla(0, 0%, 0%, 0.3);
      background: transparent;
      color: $octopus-primary-color;
    }
  }
}
</style>
