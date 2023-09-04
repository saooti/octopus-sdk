<template>
  <div class="d-flex flex-column align-items-center">
    <qrcode-vue
      :value="url"
      :size="size"
      level="H"
      :foreground="color"
      class="myQrCode"
      :margin="2"
    />
    <ClassicCheckbox
      v-if="'#000000' !== otherColor"
      v-model:textInit="isNotBlack"
      class="flex-shrink-0"
      id-checkbox="is-black-qr-code"
      :label="$t('Use organization color')"
    />
    <button class="btn m-3" @click="download">
      {{ $t("Download") }}
    </button>
    <SnackBar ref="snackbar" position="bottom-left" />
  </div>
</template>

<script lang="ts">
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import { state } from "../../../stores/ParamSdkStore";
import SnackBar from "../../misc/SnackBar.vue";
import QrcodeVue from "qrcode.vue";
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
import { useAuthStore } from "@/stores/AuthStore";
import { mapState, mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "QrCode",

  components: {
    SnackBar,
    QrcodeVue,
    ClassicCheckbox,
  },
  props: {
    url: { default: "", type: String },
  },
  data() {
    return {
      size: 200 as number,
      color: "#000000" as string,
      otherColor: "#000000" as string,
      isNotBlack: false as boolean,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authOrganisation"]),
  },
  watch: {
    isNotBlack() {
      this.color = this.isNotBlack ? this.otherColor : "#000000";
    },
  },
  created() {
    this.initColor();
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    download(): void {
      const link = document.createElement("a");
      link.download = "qrcode.png";
      const canvas = document.getElementsByClassName("myQrCode");
      if (canvas && canvas.length > 0 && canvas[0]) {
        link.href = (canvas[0] as HTMLCanvasElement).toDataURL();
        link.click();
        (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
          this.$t("Download started"),
        );
      }
    },
    async initColor(): Promise<void> {
      if (
        state.generalParameters.podcastmaker &&
        state.generalParameters.podcastmakerColor
      ) {
        this.otherColor = state.generalParameters.podcastmakerColor;
        return;
      }
      if (!state.generalParameters.authenticated) return;
      const orgaId =
        "" !== this.authOrganisation.id
          ? this.authOrganisation.id
          : state.generalParameters.organisationId;
      const attributes = await this.getOrgaAttributes(orgaId ?? "");
      if (Object.prototype.hasOwnProperty.call(attributes, "COLOR")) {
        this.otherColor = attributes.COLOR as string;
      }
    },
  },
});
</script>
