<template>
  <div v-if="!isLoading && (authenticated || !noSharing)" class="module-box">
    <div class="d-flex align-items-center justify-content-between">
      <div v-if="!isGarStudent && !noSharing" class="d-flex flex-column me-2">
        <div class="h4 mb-2">
          {{ $t("Share in one click") }}
        </div>
        <div class="d-flex align-items-center">
          <template v-for="button in arrayShareButtons" :key="button.title">
            <a
              v-if="button.condition"
              rel="noopener"
              target="_blank"
              :href="button.url"
              :class="getClass(button.className)"
              class="me-2"
              :title="button.title"
            >
              <div :class="button.icon" />
            </a>
          </template>
          <button
            :class="getClass()"
            class="saooti-link"
            :title="$t('Copy this page URL')"
            @click="onCopyCode(urlPage, afterCopy)"
          />
        </div>
      </div>
      <div class="d-flex align-items-center">
        <div
          v-if="podcast || emission || playlist"
          class="d-flex flex-column ms-4"
        >
          <div class="h4 mb-2">
            {{ $t("Newsletter") }}
          </div>
          <div class="d-flex align-items-center justify-content-center">
            <button
              :class="getClass()"
              class="saooti-newsletter"
              :title="$t('Share newsletter')"
              @click="newsletter = true"
            />
          </div>
        </div>
        <div class="d-flex flex-column ms-4">
          <div class="h4 mb-2">
            {{ $t("QR Code") }}
          </div>
          <div class="d-flex align-items-center justify-content-center">
            <button
              :class="getClass()"
              :title="$t('Share QR Code')"
              class="saooti-qrcode"
              @click="qrCode = true"
            />
          </div>
        </div>
        <div v-if="'' !== rssUrl && displayRss" class="d-flex flex-column ms-4">
          <div class="h4 mb-2">
            {{ $t("Rss feed") }}
          </div>
          <div class="d-flex align-items-center justify-content-center">
            <a
              rel="noopener"
              target="_blank"
              class="saooti-rss"
              :class="getClass()"
              :href="rssUrl"
              :title="titleRssButton"
              @click.prevent="openPopup()"
            />
          </div>
        </div>
        <div v-if="shareAiAuth" class="d-flex flex-column ms-4">
          <div class="h4 mb-2">
            {{ $t("Generate a social media post (with AI)") }}
          </div>
          <div class="d-flex align-items-center justify-content-center">
            <router-link
              :class="getClass()"
              :title="$t('Generate a social media post (with AI)')"
              :to="{
                name: 'advancedShare',
                params: { podcastId: podcast.podcastId },
              }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                class="bi bi-stars"
                viewBox="0 0 16 16"
              >
                <path
                  d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L10.863.1z"
                />
              </svg>
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
  </div>
</template>

<script lang="ts">
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
import { mapActions, mapState } from "pinia";
import { Emission } from "@/stores/class/general/emission";
import { Podcast } from "@/stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import octopusApi from "@saooti/octopus-api";
import displayMethods from "../../mixins/displayMethods";
import { defineAsyncComponent, defineComponent } from "vue";
import { Playlist } from "@/stores/class/general/playlist";
import { useAuthStore } from "@/stores/AuthStore";
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
  },
  mixins: [displayMethods],
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
    ...mapState(useAuthStore, ["isGarStudent", "authOrganisation"]),
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
    shareAiAuth(): boolean {
      return (
        !this.isPodcastmaker &&
        this.authenticated &&
        undefined !== this.podcast &&
        this.isProduction &&
        ((this.authOrganisation.attributes?.["openAi"] as
          | string
          | undefined) === "true" ??
          false)
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
          icon: "saooti-facebook",
          className: "btn-facebook",
          url: `https://www.facebook.com/sharer/sharer.php?u=${this.urlPage}`,
          condition: true,
        },
        {
          title: "X",
          icon: "saooti-twitter",
          className: "btn-twitter",
          url: `https://twitter.com/intent/tweet?text=${this.urlPage}`,
          condition: true,
        },
        {
          title: "Linkedin",
          icon: "saooti-linkedin",
          className: "btn-linkedin",
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${this.urlPage}`,
          condition: true,
        },
        {
          title: "Whatsapp",
          icon: "saooti-Whatsapp",
          className: "btn-whatsapp",
          url: `whatsapp://send?text=${this.urlPage}`,
          condition: window.matchMedia("(hover: none)").matches,
        },
      ];
    },
    urlPage(): string {
      return window.location.href;
    },
    isProduction(): boolean {
      return state.generalParameters.isProduction as boolean;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    rssUrl(): string {
      let api = state.generalParameters.ApiUri + "rss/";
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
  async created() {
    if (undefined !== this.participantId) {
      this.displayRss = await octopusApi.fetchDataPublic<boolean>(
        0,
        `rss/participants/allowed/${this.organisationId}`,
      );
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
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
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
