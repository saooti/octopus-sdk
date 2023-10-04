<template>
  <div class="module-box overflow-visible">
    <h2 class="big-h2 mb-3 height-40">
      {{ $t("Embed") }}
    </h2>
    <div class="d-flex">
      <iframe
        id="miniplayerIframeRadio"
        title="miniplayer"
        :src="iFrameSrc"
        width="100%"
        height="140px"
        class="max-iframe mx-3 flex-grow-1"
      />
      <div class="d-flex flex-column flex-grow-1 align-items-center">
        <SharePlayerColors v-model:color="color" v-model:theme="theme" />
        <ShareModalPlayer
          v-if="isShareModal"
          :embed-link="iFrame"
          :embedly-link="iFrameSrc"
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
  </div>
</template>

<script lang="ts">
import { orgaComputed } from "../../mixins/orgaComputed";
import { state } from "../../../stores/ParamSdkStore";
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
import { useAuthStore } from "@/stores/AuthStore";
import { mapState, mapActions } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import { Canal } from "@/stores/class/radio/canal";
const ShareModalPlayer = defineAsyncComponent(
  () => import("../../misc/modal/ShareModalPlayer.vue"),
);
const SharePlayerColors = defineAsyncComponent(
  () => import("./SharePlayerColors.vue"),
);
export default defineComponent({
  components: {
    ShareModalPlayer,
    SharePlayerColors,
  },
  mixins: [orgaComputed],
  props: {
    canal: { default: undefined, type: Object as () => Canal },
    organisationId: { default: undefined, type: String },
  },

  data() {
    return {
      isShareModal: false as boolean,
      color: "#40a372" as string,
      theme: "#000000" as string,
      orgaAttributes: undefined as
        | { [key: string]: string | number | boolean | undefined }
        | undefined,
    };
  },

  computed: {
    ...mapState(useAuthStore, ["authOrganisation"]),
    iFrameSrc(): string {
      return `${state.podcastPage.MiniplayerUri}miniplayer/radio/${this.canal
        ?.id}?distributorId=${this.organisationId}&color=${this.color.substring(
        1,
      )}&theme=${this.theme.substring(1)}`;
    },

    iFrame(): string {
      return `<iframe src="${this.iFrameSrc}" width="100%" height="140px" scrolling="no" allow="clipboard-read; clipboard-write; autoplay" frameborder="0"></iframe>`;
    },
  },
  async created() {
    const orgaId =
      "" !== this.authOrganisation.id
        ? this.authOrganisation.id
        : state.generalParameters.organisationId;
    this.orgaAttributes = await this.getOrgaAttributes(orgaId ?? "");
    this.initColor();
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    initColor(): void {
      if (!this.orgaAttributes) {
        return;
      }
      this.color = Object.prototype.hasOwnProperty.call(
        this.orgaAttributes,
        "COLOR",
      )
        ? (this.orgaAttributes.COLOR as string)
        : "#40a372";
      this.theme = Object.prototype.hasOwnProperty.call(
        this.orgaAttributes,
        "THEME",
      )
        ? (this.orgaAttributes.THEME as string)
        : "#000000";
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
@import "../../../assets/iframe.scss";
</style>
