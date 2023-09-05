<template>
  <div class="d-flex align-items-center justify-content-between">
    <div v-if="!isGarStudent && !noSharing" class="d-flex flex-column me-2">
      <div class="h4 mb-2">
        {{ $t("Social networks") }}
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
      </div>
    </div>
    <div v-if="podcast || emission || playlist" class="d-flex flex-column me-2">
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

    <div class="d-flex flex-column me-2">
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

    <div class="d-flex flex-column me-2">
      <div class="h4 mb-2">
        {{ $t("Copy this page URL") }}
      </div>
      <div class="d-flex align-items-center justify-content-center">
        <button
          :class="getClass()"
          class="saooti-link"
          :title="$t('Copy this page URL')"
          @click="onCopyCode(urlPage, afterCopy)"
        />
      </div>
    </div>

    <div v-if="'' !== rssUrl && displayRss" class="d-flex flex-column me-2">
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
    <SnackBar ref="snackbar" position="bottom-left" />
  </div>
</template>

<script lang="ts">
import { useAuthStore } from "@/stores/AuthStore";
import { mapState } from "pinia";
import octopusApi from "@saooti/octopus-api";
import { Emission } from "@/stores/class/general/emission";
import { Podcast } from "@/stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import SnackBar from "../../misc/SnackBar.vue";
import displayMethods from "../../mixins/displayMethods";
import { defineComponent, defineAsyncComponent } from "vue";
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
export default defineComponent({
  components: {
    ClipboardModal,
    NewsletterModal,
    QrCodeModal,
    SnackBar,
  },

  mixins: [displayMethods],

  props: {
    noSharing: { default: false, type: Boolean},
    podcast: { default: undefined, type: Object as () => Podcast },
    emission: { default: undefined, type: Object as () => Emission },
    playlist: { default: undefined, type: Object as () => Playlist },
    participantId: { default: undefined, type: Number },
    organisationId: { default: undefined, type: String },
    isVertical: { default: false, type: Boolean },
  },

  data() {
    return {
      dataRSSSave: false as boolean,
      newsletter: false as boolean,
      qrCode: false as boolean,
      displayRss: false as boolean,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["isGarStudent"]),
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
          title: "Twitter",
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
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
    rssUrl(): string {
      let api = state.generalParameters.ApiUri + "rss/";
      if (this.emission) {
        return api + "emission/" + this.emission.emissionId + ".rss";
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
  },

  methods: {
    getClass(className = "btn-rss"): string {
      return `btn ${className} share-btn mb-2 text-dark`;
    },
    openPopup(): void {
      this.dataRSSSave = !this.dataRSSSave;
    },
    afterCopy(): void {
      (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
        this.$t("Link in clipboard"),
      );
    },
  },
});
</script>
