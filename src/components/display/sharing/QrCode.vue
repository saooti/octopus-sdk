<template>
  <div class="d-flex flex-column align-items-center">
    <div class="d-flex align-items-center mb-3">
      <div class="form-label me-3">
        {{ $t("Choose color") }}
      </div>
      <VSwatches
        v-model:model-value="color"
        class="c-hand"
        show-fallback
        fallback-input-type="color"
        colors="text-advanced"
        popover-to="right"
        popover-y="bottom"
        :data-color="color"
      />
    </div>
    <qrcode-svg
      :value="url"
      :size="size"
      level="H"
      :foreground="color"
      class="myQrCode"
      :margin="2"
    />
    <button class="btn btn-primary my-3" @click="download">
      {{ $t("Download") }}
    </button>
    <SnackBar ref="snackbar" position="bottom-left" />
  </div>
</template>

<script lang="ts">
import { VSwatches } from "vue3-swatches";
import "vue3-swatches/dist/style.css";
import SnackBar from "../../misc/SnackBar.vue";
import { QrcodeSvg } from "qrcode.vue";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "QrCode",

  components: {
    SnackBar,
    QrcodeSvg,
    VSwatches,
  },
  props: {
    url: { default: "", type: String },
    orgaForColor: { default: undefined, type: String },
  },
  data() {
    return {
      size: 200 as number,
      color: "#000000" as string,
    };
  },
  created() {
    this.initDefaultColor();
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    download(): void {
      const canvas = document.getElementsByClassName("myQrCode");
      if (canvas && canvas.length > 0 && canvas[0]) {
        var svgData = canvas[0].outerHTML;
        var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "qrcode.svg";
        downloadLink.click();
        (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
          this.$t("Download started"),
        );
      }
    },
    async initDefaultColor(): Promise<void> {
      if (undefined === this.orgaForColor) return;
      const attributes = await this.getOrgaAttributes(this.orgaForColor);
      if (Object.hasOwn(attributes, "COLOR")) {
        this.color = attributes.COLOR as string;
      }
    },
  },
});
</script>
