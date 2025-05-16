<template>
  <div class="d-flex flex-column align-items-center">
    <div class="d-flex align-items-center mb-3">
      <div class="form-label me-3">
        {{ $t("Color of the QR Code") }}
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
    <qrcode-vue
      :render-as="renderQrCode"
      :value="url"
      :size="size"
      level="H"
      :foreground="color"
      class="myQrCode"
      :margin="2"
    />
    <div class="d-flex align-items-center my-3">
      <FormatSwitch v-model:is-svg="isSvg" class="me-3"/>
      <button class="btn btn-primary" @click="download">
        {{ $t("Download") }}
      </button>
    </div>
    <SnackBar ref="snackbar" position="bottom-left" />
  </div>
</template>

<script lang="ts">
import { VSwatches } from "vue3-swatches";
import "vue3-swatches/dist/style.css";
import SnackBar from "../../misc/SnackBar.vue";
import QrcodeVue from "qrcode.vue";
import FormatSwitch from "./FormatSwitch.vue";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "QrCode",

  components: {
    SnackBar,
    VSwatches,
    QrcodeVue,
    FormatSwitch
  },
  props: {
    url: { default: "", type: String },
    orgaForColor: { default: undefined, type: String },
  },
  data() {
    return {
      size: 1000 as number,
      color: "#000000" as string,
      isSvg: true as boolean
    };
  },
  computed:{
    renderQrCode(){
      return this.isSvg ? 'svg' : 'canvas';
    }
  },
  created() {
    this.initDefaultColor();
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    download(): void {
      const canvas = document.getElementsByClassName("myQrCode");
      if (!canvas || canvas.length <=0 || !canvas[0]) {
        return;
      }
      const downloadLink = document.createElement("a");
      if (this.isSvg) {
        const svgData = canvas[0].outerHTML;
        const svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        downloadLink.href = svgUrl;
        downloadLink.download = "qrcode.svg";
        downloadLink.click();
        (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
          this.$t("Download started"),
        );
      }else{
        downloadLink.download = "qrcode.png";
        downloadLink.href = (canvas[0] as HTMLCanvasElement).toDataURL();
      }
      downloadLink.click();
      (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
        this.$t("Download started"),
      );
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
<style lang="scss">
.octopus-app {
  .myQrCode{
    height: 200px !important;
    width: 200px !important;
  }
}
</style>