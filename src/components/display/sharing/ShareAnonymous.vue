<template>
  <div v-if="!isLoading && !noSharing">
    <button
      id="anonymous-share-button"
      :class="btnClass"
      :title="$t('Share')"
    >
      <DotsHorizontalIcon />
    </button>
    <ClassicPopover
      target="anonymous-share-button"
      :relative-class="relativeClass"
      :is-fixed="true"
      :left-pos="true"
      :only-click="true"
    >
      <div  
        v-for="button in dropdownButtons"
        :key="button.icon"
        class="d-flex flex-column"
      >
        <button
          v-if="button.condition"
          :key="button.title"
          class="btn-transparent d-flex flex-nowrap justify-content-start align-items-center octopus-dropdown-item py-2"
          :title="button.title"
          @mousedown="clickButton(button.emitName)"
          @keydown.enter="clickButton(button.emitName)"
        >
          <component :is="button.icon" />
          <div class="ms-1">{{ button.title }}</div>
        </button>
      </div>
    </ClassicPopover>
    <QrCodeModal
      v-if="isQrCodeModal"
      :url-page="urlPage"
      :orga-for-color="organisationId"
      @close="isQrCodeModal = false"
    />
    <PlayerAnonymousModal
      v-if="isPlayerModal"
      :podcast="podcast"
      :emission="emission ?? podcast?.emission"
      :exclusive="!playerCanBeSharedOthers"
      :not-exclusive="playerCanBeSharedAnonymous"
      @close="isPlayerModal = false"
    />
    <NewsletterModal
      v-if="isNewsletterModal"
      :closable="true"
      :podcast="podcast"
      :emission="emission"
      :playlist="playlist"
      @close="isNewsletterModal = false"
    />
    <ClipboardModal
      v-if="isRssModal"
      :link="rssUrl"
      @close="isRssModal = false"
      @copy="afterCopy"
    />
    <SnackBar
      v-if="lazyLoadingSnackbar"
      ref="snackbar"
      position="bottom-left"
    />
  </div>
</template>

<script lang="ts">
import QrcodeIcon from "vue-material-design-icons/Qrcode.vue";
import LinkVariantIcon from "vue-material-design-icons/LinkVariant.vue";
import DotsHorizontalIcon from "vue-material-design-icons/DotsHorizontal.vue";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import displayHelper from "../../../helper/displayHelper";
import { defineAsyncComponent, defineComponent } from "vue";
import { useApiStore } from "../../../stores/ApiStore";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
import { mapActions, mapState } from "pinia";
import { state } from "../../../stores/ParamSdkStore";
import classicApi from "../../../api/classicApi";
const SnackBar = defineAsyncComponent(() => import("../../misc/SnackBar.vue"));
const NewsletterModal = defineAsyncComponent(
  () => import("../../misc/modal/NewsletterModal.vue"),
);
const QrCodeModal = defineAsyncComponent(
  () => import("../../misc/modal/QrCodeModal.vue"),
);
const ClipboardModal = defineAsyncComponent(
  () => import("../../misc/modal/ClipboardModal.vue"),
);
const PlayerAnonymousModal = defineAsyncComponent(
  () => import("../sharing/PlayerAnonymousModal.vue"),
);
const CodeTagsIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/CodeTags.vue"),
);
const EmailNewsletterIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/EmailNewsletter.vue"),
);
const RssIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/Rss.vue"),
);
export default defineComponent({
  name: "PodcastShareAnonymous",
  components: {
    ClassicPopover,
    DotsHorizontalIcon,
    LinkVariantIcon,
    EmailNewsletterIcon,
    QrcodeIcon,
    CodeTagsIcon,
    RssIcon,
    SnackBar,
    NewsletterModal,
    QrCodeModal,
    ClipboardModal,
    PlayerAnonymousModal
  },

  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    emission: { default: undefined, type: Object as () => Emission },
    playlist: { default: undefined, type: Object as () => Playlist },
    participantId: { default: undefined, type: Number },
    organisationId: { default: undefined, type: String },
    relativeClass: { default: "page-element", type: String },
    btnClass: { default: "btn btn-transparent", type: String },
  },

  data() {
    return {
      lazyLoadingSnackbar: false as boolean,
      isNewsletterModal: false as boolean,
      isQrCodeModal: false as boolean,
      displayRss: false as boolean,
      noSharing: true as boolean,
      playerCanBeSharedAnonymous: false as boolean,
      playerCanBeSharedOthers: false as boolean,
      isLoading: true as boolean,
      isRssModal: false as boolean,
      isPlayerModal: false as boolean
    };
  },
  computed:{
    ...mapState(useAuthStore, ["isGarRole","authOrgaId"]),
    ...mapState(useApiStore, ["apiUrl"]),
    urlPage(): string {
      return window.location.href;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    rssUrl(): string {
      const api = this.apiUrl + "rss/";
      if (
        (!this.isPodcastmaker && this.playlist) ||
        this.podcast ||
        this.emission
      ) {
        return "";
      }
      if (this.participantId) {
        return api + "participant/" + this.participantId + ".rss";
      }
      if (this.playlist) {
        return api + "playlist/" + this.playlist.playlistId + ".rss";
      }
      if (this.organisationId) {
        return api + "productor/" + this.organisationId + ".rss";
      }
      return "";
    },
    titleRssButton(): string {
      if (this.participantId) {
        return this.$t("Subscribe to this participant");
      }
      if (this.emission) {
        return this.$t("Subscribe to this emission");
      }
      return this.$t("Subscribe to this RSS feed");
    },
    dropdownButtons() {
      return [
        {
          title: this.$t("Copy this page URL"),
          icon: "LinkVariantIcon",
          condition:true,
          emitName: "link",
        },
        {
          title: this.$t("Share the player"),
          icon: "CodeTagsIcon",
          condition: !this.isPodcastmaker && (this.playerCanBeSharedAnonymous || (this.playerCanBeSharedOthers && this.authOrgaId)),
          emitName: "player",
        },
        {
          title: this.$t("Share newsletter"),
          icon: "EmailNewsletterIcon",
          condition: this.podcast || this.emission || this.playlist,
          emitName: "newsletter",
        },
        {
          title: this.$t("Share QR Code"),
          icon: "QrcodeIcon",
          condition: true,
          emitName: "qrcode",
        },
        {
          title: this.titleRssButton,
          icon: "RssIcon",
          condition: '' !== this.rssUrl && this.displayRss && !this.isGarRole,
          emitName: "rss",
        },
      ];
    },
  },
  created() {
    this.initShareButtons();
  },
  methods:{
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    async initShareButtons() {
      if (undefined !== this.participantId) {
        this.displayRss = await classicApi.fetchData<boolean>({
          api: 0,
          path: `rss/participants/allowed/${this.organisationId}`,
          isNotAuth: true,
        });
      } else {
        this.displayRss = true;
      }
      this.determinePlayerCanBeShared();
      if (!this.organisationId) {
        return;
      }
      const attributes = await this.getOrgaAttributes(this.organisationId);
      this.noSharing = "true" === attributes.noSharing;
      this.isLoading = false;
    },
    determinePlayerCanBeShared() {
      const emissionAnnot = this.podcast?.emission.annotations ?? this.emission?.annotations;
      if (!emissionAnnot) { return }
      if (emissionAnnot.exclusive) {
        this.playerCanBeSharedOthers = "true" !== emissionAnnot.exclusive;
      }
      if (emissionAnnot.notExclusive) {
        this.playerCanBeSharedAnonymous = "true" === emissionAnnot.notExclusive;
      }
    },
    clickButton(name: string) {
      switch (name) {
        case "link":
          displayHelper.onCopyCode(this.urlPage, this.afterCopy);
          break;
        case "newsletter":
          this.isNewsletterModal = true;
          break;
        case "qrcode":
          this.isQrCodeModal = true;
          break;
        case "rss":
          this.isRssModal = true;
          break;
        case "player": 
          this.isPlayerModal = true;
          break;
        default:
          break;
      }
    },
    afterCopy(): void {
      if (!this.lazyLoadingSnackbar) {
        this.lazyLoadingSnackbar = true;
        setTimeout(() => {
          this.afterCopy();
        }, 500);
      } else {
        (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
          this.$t("Link in clipboard"),
        );
      }
    },
  }
});
</script>
