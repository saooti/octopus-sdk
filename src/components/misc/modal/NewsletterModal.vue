<template>
  <ClassicModal
    id-modal="newsletter-modal"
    :title-modal="newsletterInfo.titleModal"
    :closable="false"
    @close="closePopup"
  >
    <template #body>
      <div class="d-flex flex-column">
        <div class="d-flex">
          <div class="d-flex flex-column flex-shrink-0 me-3">
            <h4 class="mb-3">
              {{ $t("Configure your Newsletter tile") }}
            </h4>
            <div
              v-for="colors in arrayColors"
              :key="colors.mainText"
              class="d-flex align-items-center mb-3"
            >
              <VSwatches
                v-model="colors.color"
                class="c-hand me-2"
                show-fallback
                fallback-input-type="color"
                colors="text-advanced"
                popover-to="right"
                :data-color="colors.color"
              />
              <div class="d-flex flex-column">
                <div class="fw-bold">{{ colors.mainText }}</div>
                <div v-if="colors.secondText" class="descriptionText">
                  {{ colors.secondText }}
                </div>
              </div>
            </div>
          </div>
          <!-- eslint-disable vue/no-v-html -->
          <div v-html="newsletterHtml" />
          <!-- eslint-enable -->
        </div>
        <button
          class="btn flex-grow-1 mt-3 fw-bold"
          @click="onCopyCode(newsletterHtml, afterCopy)"
        >
          <span class="saooti-copy me-2" />
          {{ $t("Copy and embed the HTML code into your email tool") }}
        </button>
        <SnackBar ref="snackbar" position="bottom-left" />
      </div>
    </template>
    <template #footer>
      <button class="btn btn-primary m-1" @click="closePopup">
        {{ $t("Close") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import ClassicModal from "../modal/ClassicModal.vue";
import SnackBar from "../../misc/SnackBar.vue";
// @ts-ignore
import { VSwatches } from "vue3-swatches";
import "vue3-swatches/dist/style.css";
import displayMethods from "../../mixins/displayMethods";
import { Podcast } from "@/stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import { defineComponent } from "vue";
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
import { useAuthStore } from "@/stores/AuthStore";
import { mapState, mapActions } from "pinia";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
export default defineComponent({
  name: "NewsletterModal",

  components: {
    SnackBar,
    VSwatches,
    ClassicModal,
  },

  mixins: [displayMethods],

  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    emission: { default: undefined, type: Object as () => Emission },
    playlist: { default: undefined, type: Object as () => Playlist },
  },

  emits: ["close"],

  data() {
    return {
      arrayColors: [
        {
          color: "#40a372",
          mainText: this.$t("Choose main color"),
          secondText: this.$t("Newsletter elements"),
        },
        { color: "#000000", mainText: this.$t("Choose text color") },
        { color: "#FFFFFF", mainText: this.$t("Choose background color") },
      ],
      shareUrl: window.location.href,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authOrganisation"]),
    newsletterInfo() {
      if (this.podcast) {
        return {
          titleModal: this.$t("Share the episode in your newsletter"),
          imageUrl: `${this.podcast.imageUrl}" alt="${this.$t(
            "Podcast image",
          )}`,
          title: this.podcast.title,
          description: this.podcast.description ?? "",
          shareText: this.$t("Listen this episode"),
          emissionHtml: `<tr><td style="padding:5px 0;">
          <div style="display:flex; margin-top:5px;">
          <div style="font-size:20px; color:${this.arrayColors[1].color}; margin-right:5px;text-wrap: nowrap;">${this.$t(
            "Emission",
          )} :</div>
          <a href="${this.shareUrl}" style="font-size: 18px;color: ${
            this.arrayColors[0].color
          };overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${this.podcast.emission.name}</a>
          </div></td></tr>`,
          articleHtml:
            !this.podcast?.article || 0 === this.podcast.article?.length
              ? ``
              : `<tr><td style="padding:5px 0;">
          <div style="display:flex;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M7 17h7v-2H7zm0-4h10v-2H7zm0-4h10V7H7zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z"/></svg>
          <a href="${
            this.podcast.article
          }" style="color: ${this.arrayColors[1].color};margin-top:2px">${this.$t(
            "See associated article",
          )}</a>
          </div></td></tr>
          `,
          colorTitle: `color:${this.arrayColors[1].color};`,
        };
      }
      if (this.emission) {
        return {
          titleModal: this.$t("Share the series in your newsletter"),
          imageUrl: `${this.emission.imageUrl}" alt="${this.$t(
            "Emission image",
          )}`,
          title: this.emission.name,
          description: this.emission.description ?? "",
          shareText: this.$t("Listen to all episodes"),
          emissionHtml: ``,
          articleHtml: ``,
          colorTitle: `color:${this.arrayColors[0].color};`,
        };
      }
      return {
        titleModal: this.$t("Share the playlist in your newsletter"),
        imageUrl: `${this.playlist?.imageUrl}" alt="${this.$t(
          "Playlist image",
        )}`,
        title: this.playlist?.title,
        description: this.playlist?.description ?? "",
        shareText: this.$t("Listen to all episodes"),
        emissionHtml: ``,
        articleHtml: ``,
        colorTitle: `color:${this.arrayColors[0].color};`,
      };
    },
    newsletterHtml(): string {
      return `<table style="background:${this.arrayColors[2].color};color:${this.arrayColors[1].color};table-layout: fixed;width:100%;font-size: 14px;">
<tr>
<td valign="top" width="30%" rowspan="7" style="padding-right:5px;"><img width="100%" src="${
        this.newsletterInfo.imageUrl
      }" style="border-radius: 4px;"></td>
<td valign="top" width="70%" style="padding:5px 0;"><div style="margin-top:5px;font-size: 24px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;font-weight:bold;${
        this.newsletterInfo.colorTitle
      }">${this.newsletterInfo.title}</div></td>
</tr>${this.newsletterInfo.emissionHtml}
<tr><td style="padding:5px 0;"><div style="overflow: hidden;display: -webkit-box;-webkit-line-clamp: 6;-webkit-box-orient: vertical;word-break: break-word;">${
        this.newsletterInfo.description
      }</div></td></tr>
<tr><td valign="top" style="padding:5px 0;"><a href="${this.shareUrl}" style="color: ${
        this.arrayColors[0].color
      };">${this.$t("See more")}</a></td></tr>
<tr>${this.newsletterInfo.articleHtml}
<td width="1" style="padding:5px 0;"><a href="${this.shareUrl}" style="font-size: 18px;color: ${
        this.arrayColors[0].color
      };text-decoration: none; display:flex;"><svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="currentColor" d="m9.5 16.5l7-4.5l-7-4.5zM12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22"/></svg><div style="margin-top: 15px; color:${this.arrayColors[1].color};">${
        this.newsletterInfo.shareText
      }</div></a></td>
</tr>
</table>
`;
    },
  },
  created() {
    this.initData();
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    closePopup(): void {
      this.$emit("close");
    },
    afterCopy(): void {
      (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
        this.$t("Data in clipboard"),
      );
    },
    async initData(): Promise<void> {
      const orgaId =
        "" !== this.authOrganisation.id
          ? this.authOrganisation.id
          : state.generalParameters.organisationId;
      if (!orgaId || orgaId?.length) {
        return;
      }
      const attributes = await this.getOrgaAttributes(orgaId ?? "");
      if (
        Object.hasOwn(attributes, "podcastmakerUrl") &&
        (attributes.podcastmakerUrl as string | undefined | null)?.length
      ) {
        this.shareUrl =
          attributes.podcastmakerUrl +
          window.location.pathname +
          window.location.search;
      }
      if (
        state.generalParameters.podcastmaker &&
        state.generalParameters.podcastmakerColor
      ) {
        this.arrayColors[0].color = state.generalParameters.podcastmakerColor;
        return;
      }
      if (Object.hasOwn(attributes, "COLOR")) {
        this.arrayColors[0].color = attributes.COLOR as string;
      }
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  #newsletter-modal {
    .octopus-modal-body {
      overflow-x: inherit;
      @media (max-width: 500px) {
        overflow-x: auto;
      }
    }
    .octopus-modal-dialog {
      max-width: 80%;
      max-height: calc(100% - 3.5rem) !important;
    }
    .octopus-modal-content {
      max-height: calc(100vh - 100px) !important;
    }
  }
}
</style>
