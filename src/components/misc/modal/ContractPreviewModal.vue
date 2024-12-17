<template>
  <ClassicModal
    id-modal="checking-modal"
    :title-modal="$t('Contract preview')"
    @close="$emit('close')"
  >
    <template #body>
      <h2 class="mb-3">{{ selectedContract?.name }}</h2>
      <div v-for="page in pages" :key="page">
        <VuePDF :pdf="pdf" :page="page" />
      </div>
    </template>
    <template #footer>
      <div class="d-flex justify-content-end">
        <button class="btn btn-primary m-1" @click="onDownloadContract()">
          {{ $t("Download") }}
        </button>
        <button class="btn m-1 btn-primary" @click="$emit('close')">
          {{ $t("Close") }}
        </button>
      </div>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { useApiStore } from "../../../stores/ApiStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { Contract } from "../../../stores/class/contract/contract";
// @ts-expect-error Problème de bibliothèque
import { usePDF, VuePDF, PDFDocumentLoadingTask } from "@tato30/vue-pdf";
import { defineComponent, defineAsyncComponent, ShallowRef } from "vue";
const ClassicModal = defineAsyncComponent(() => import("./ClassicModal.vue"));
export default defineComponent({
  name: "ContractPreviewModal",
  components: {
    ClassicModal,
    VuePDF,
  },
  props: {
    selectedContract: { default: undefined, type: Object as () => Contract },
  },
  emits: ["download", "close"],
  data() {
    return {
      pdfSource: "" as string,
      pdf: undefined as PDFDocumentLoadingTask,
      pages: 0 as number | ShallowRef<number>,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authParam"]),
    ...mapState(useApiStore, ["keycloakUrl"]),

    pdfToDisplay(): string | undefined {
      if ("" !== this.pdfSource) {
        return this.pdfSource;
      }
      return undefined;
    },
  },
  watch: {
    pdfToDisplay() {
      if (undefined === this.pdfToDisplay) {
        return;
      }
      const { pdf, pages } = usePDF(this.pdfToDisplay);
      this.pdf = pdf;
      this.pages = pages;
    },
  },
  mounted() {
    this.initSrcContract();
  },
  methods: {
    initSrcContract(): void {
      let source = "";
      if (this.selectedContract) {
        source = this.keycloakUrl + "contract/" + this.selectedContract.id;
      }
      this.pdfSource = source + "?access_token=" + this.authParam.accessToken;
    },
    onDownloadContract(): void {
      this.$emit("download", this.selectedContract);
    },
  },
});
</script>
