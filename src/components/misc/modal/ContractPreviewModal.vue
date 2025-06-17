<template>
  <ClassicModal
    id-modal="checking-modal"
    :title-modal="t('Contract preview')"
    @close="closePopup"
  >
    <template #body>
      <h2 class="mb-3">{{ selectedContract?.name }}</h2>
      <div v-for="page in thisPages" :key="page">
        <VuePDF :pdf="thisPdf" :page="page" />
      </div>
    </template>
    <template #footer>
      <div class="d-flex justify-content-end">
        <button class="btn btn-primary m-1" @click="onDownloadContract()">
          {{ t("Download") }}
        </button>
        <button class="btn m-1 btn-primary" @click="closePopup">
          {{ t("Close") }}
        </button>
      </div>
    </template>
  </ClassicModal>
</template>

<script setup lang="ts">
import { useApiStore } from "../../../stores/ApiStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { Contract } from "../../../stores/class/contract/contract";
// @ts-expect-error Problème de bibliothèque
import { usePDF, VuePDF, PDFDocumentLoadingTask } from "@tato30/vue-pdf";
import { defineAsyncComponent, ShallowRef, ref, Ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const ClassicModal = defineAsyncComponent(() => import("./ClassicModal.vue"));


//Props 
const props = defineProps({
  selectedContract: { default: undefined, type: Object as () => Contract },
})

//Emits
const emit = defineEmits(["download", "close"]);


//Data 
const pdfSource = ref("");
const thisPdf: Ref<PDFDocumentLoadingTask> = ref(undefined);
const thisPages: Ref< number | ShallowRef<number>> = ref(0);

//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const apiStore = useApiStore();

//Computed
const pdfToDisplay = computed(() => {
  if ("" !== pdfSource.value) {
    return pdfSource.value;
  }
  return undefined;
});

//Watch
watch(pdfToDisplay, async () => {
  if (undefined === pdfToDisplay.value) {
    return;
  }
  const { pdf, pages } = usePDF(pdfToDisplay.value);
  thisPdf.value = pdf;
  thisPages.value = pages;
});

onMounted(()=>initSrcContract())


//Methods
function closePopup(): void {
  emit("close");
}
function initSrcContract(): void {
  let source = "";
  if (props.selectedContract) {
    source = apiStore.keycloakUrl + "contract/" + props.selectedContract.id;
  }
  pdfSource.value = source + "?access_token=" + authStore.authParam.accessToken;
}
function onDownloadContract(): void {
  emit("download", props.selectedContract);
}
</script>
