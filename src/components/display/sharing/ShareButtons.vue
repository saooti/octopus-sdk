<template>
  <section v-if="!isLoading && (authOrgaId || !noSharing)" class="module-box">
    <div class="share-buttons-display">
      <div v-if="!isGarRole && !noSharing" class="d-flex flex-column me-2">
        <h3 class="mb-2">
          {{ $t("Share in one click") }}
        </h3>
        <div class="d-flex align-items-center">
          <template v-for="button in arrayShareButtons" :key="button.title">
            <a
              v-if="button.condition"
              rel="noreferrer noopener"
              target="_blank"
              :href="button.url"
              :class="getClass(button.className)"
              class="me-2"
              :title="$t('New window', {text: button.title})"
            >
              <component :is="button.icon" :size="34" />
            </a>
          </template>
          <button
            :class="getClass()"
            :title="$t('Copy this page URL')"
            @click="onCopyCode(urlPage, afterCopy)"
          >
            <LinkVariantIcon />
          </button>
        </div>
      </div>
      <div class="d-flex-column align-items-center">
        <div
          v-if="podcast || emission || playlist"
          class="d-flex flex-column share-left-not-phone"
        >
          <h3 class="mb-2">
            {{ $t("Newsletter") }}
          </h3>
          <button
            :class="getClass()"
            :title="$t('Share newsletter')"
            @click="newsletter = true"
          >
            <EmailNewsletterIcon />
          </button>
        </div>
        <div class="d-flex flex-column share-left-not-phone">
          <h3 class="mb-2">
            {{ $t("QR Code") }}
          </h3>
          <button
            :class="getClass()"
            :title="$t('Share QR Code')"
            @click="qrCode = true"
          >
            <QrcodeIcon />
          </button>
        </div>
        <div
          v-if="'' !== rssUrl && displayRss && !isGarRole"
          class="d-flex flex-column ms-4"
        >
          <h3 class="mb-2">
            {{ $t("Rss feed") }}
          </h3>
          <div class="d-flex align-items-center justify-content-center">
            <a
              rel="noreferrer noopener"
              target="_blank"
              :class="getClass()"
              :href="rssUrl"
              :title="$t('New window', {text: titleRssButton})"
              @click.prevent="openPopup()"
            >
              <RssIcon />
            </a>
          </div>
        </div>
        <div v-if="shareAiAuth" class="d-flex flex-column ms-4">
          <h3 class="mb-2">
            {{ $t("Generate a social media post (with AI)") }}
          </h3>
          <div class="d-flex align-items-center justify-content-center">
            <router-link
              :class="getClass()"
              :title="$t('Generate a social media post (with AI)')"
              :to="{
                name: 'advancedShare',
                params: { podcastId: podcast.podcastId },
              }"
            >
              <CreationIcon />
            </router-link>
          </div>
        </div>
      </div>

      <ClipboardModal
        v-if="dataRSSSave"
        :link="rssUrl"
        :emission="emission"
        @close="dataRSSSave = false"
        @copy="afterCopy"
      />
      <NewsletterModal
        v-if="newsletter"
        :closable="true"
        :podcast="podcast"
        :emission="emission"
        :playlist="playlist"
        @close="newsletter = false"
      />
      <QrCodeModal
        v-if="qrCode"
        :closable="true"
        :url-page="urlPage"
        @close="qrCode = false"
      />
      <SnackBar
        v-if="lazyLoadingSnackbar"
        ref="snackbar"
        position="bottom-left"
      />
    </div>
  </section>
</template>

<script lang="ts">
import XIcon from "../../icons/XIcon.vue";
import CreationIcon from "vue-material-design-icons/Creation.vue";
import RssIcon from "vue-material-design-icons/Rss.vue";
import WhatsappIcon from "vue-material-design-icons/Whatsapp.vue";
import LinkedinIcon from "vue-material-design-icons/Linkedin.vue";
import FacebookIcon from "vue-material-design-icons/Facebook.vue";
import QrcodeIcon from "vue-material-design-icons/Qrcode.vue";
import EmailNewsletterIcon from "vue-material-design-icons/EmailNewsletter.vue";
import LinkVariantIcon from "vue-material-design-icons/LinkVariant.vue";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { useApiStore } from "../../../stores/ApiStore";
import { mapActions, mapState } from "pinia";
import { Emission } from "@/stores/class/general/emission";
import { Podcast } from "@/stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import { useAuthStore } from "../../../stores/AuthStore";
import classicApi from "../../../api/classicApi";
import displayHelper from "../../../helper/displayHelper";
import { defineAsyncComponent, defineComponent } from "vue";
import { Playlist } from "@/stores/class/general/playlist";
const ClipboardModal = defineAsyncComponent(
  () => import("../../misc/modal/ClipboardModal.vue"),
);
const NewsletterModal = defineAsyncComponent(
  () => import("../../misc/modal/NewsletterModal.vue"),
);
const QrCodeModal = defineAsyncComponent(
  () => import("../../misc/modal/QrCodeModal.vue"),
);
const SnackBar = defineAsyncComponent(() => import("../../misc/SnackBar.vue"));
export default defineComponent({
  components: {
    ClipboardModal,
    NewsletterModal,
    QrCodeModal,
    SnackBar,
    LinkVariantIcon,
    EmailNewsletterIcon,
    QrcodeIcon,
    FacebookIcon,
    LinkedinIcon,
    WhatsappIcon,
    RssIcon,
    XIcon,
    CreationIcon,
  },
  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    emission: { default: undefined, type: Object as () => Emission },
    playlist: { default: undefined, type: Object as () => Playlist },
    participantId: { default: undefined, type: Number },
    organisationId: { default: undefined, type: String },
  },
  data() {
    return {
      noSharing: true as boolean,
      isLoading: true as boolean,
      dataRSSSave: false as boolean,
      newsletter: false as boolean,
      qrCode: false as boolean,
      displayRss: false as boolean,
      lazyLoadingSnackbar: false as boolean,
    };
  },
  computed: {
    ...mapState(useAuthStore, [
      "isGarRole",
      "authOrganisation",
      "isRoleProduction",
      "authOrgaId",
    ]),
    ...mapState(useApiStore, ["apiUrl"]),
    shareAiAuth(): boolean {
      return (
        !this.isPodcastmaker &&
        undefined !== this.authOrgaId &&
        undefined !== this.podcast &&
        this.isRoleProduction &&
        (this.authOrganisation.attributes?.["openAi.active"] as
          | string
          | undefined) === "true"
      );
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
    arrayShareButtons() {
      return [
        {
          title: "Facebook",
          icon: "FacebookIcon",
          className: "btn-facebook",
          url: `https://www.facebook.com/sharer/sharer.php?u=${this.urlPage}`,
          condition: true,
        },
        {
          title: "X",
          icon: "XIcon",
          className: "btn-twitter",
          url: `https://twitter.com/intent/tweet?text=${this.urlPage}`,
          condition: true,
        },
        {
          title: "Linkedin",
          icon: "LinkedinIcon",
          className: "btn-linkedin",
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${this.urlPage}`,
          condition: true,
        },
        {
          title: "Whatsapp",
          icon: "WhatsappIcon",
          className: "btn-whatsapp",
          url: `whatsapp://send?text=${this.urlPage}`,
          condition: window.matchMedia("(hover: none)").matches,
        },
      ];
    },
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
  },
  created() {
    this.initShareButtons();
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    onCopyCode(link: string, callback: () => void){
      displayHelper.onCopyCode(link, callback);
    },
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
      if (!this.organisationId) {
        return;
      }
      const attributes = await this.getOrgaAttributes(this.organisationId);
      this.noSharing = "true" === attributes.noSharing;
      this.isLoading = false;
    },
    getClass(className = "btn-rss"): string {
      return `btn ${className} share-btn mb-2 text-dark`;
    },
    openPopup(): void {
      this.dataRSSSave = !this.dataRSSSave;
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
  },
});
</script>
<style lang="scss">
.octopus-app {
  .share-buttons-display {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (width <= 960px) {
      flex-direction: column;
      align-items: baseline;
    }

    > .d-flex-column {
      align-items: flex-start !important;
    }
  }

  @media (width >= 960px) {
    .share-left-not-phone {
      align-items: center;
      justify-content: center;
      margin-left: 1.5rem !important;
    }
  }
}
</style>
