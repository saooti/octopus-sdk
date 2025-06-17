<template>
  <ClassicModal
    id-modal="qrcode-modal"
    :title-modal="t('Share QR Code')"
    @close="closePopup"
  >
    <template #body>
      <QrCode :url="urlPage" :orga-for-color="orgaForColor" />
    </template>
    <template #footer>
      <button class="btn btn-primary m-1" @click="closePopup">
        {{ t("Close") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script setup lang="ts">
import ClassicModal from "../modal/ClassicModal.vue";
import QrCode from "../../display/sharing/QrCode.vue";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  urlPage: { default: undefined, type: String },
  orgaForColor: { default: undefined, type: String },
})

//Emits
const emit = defineEmits(["close"]);
 
//Composables
const { t } = useI18n();

//Methods
function closePopup(): void {
  emit("close");
}
</script>
