<template>
  <ClassicModal
    id-modal="clipboard-modal"
    :title-modal="t('RSS Link')"
    @close="closePopup"
  >
    <template #body>
      <p class="d-flex justify-content-between align-items-center">
        {{ t("Rss feed:") }}
        <span id="LINK">{{ link }}</span>
        <ClassicCopyButton
          :text="t('Copy')"
          :text-after-copy="t('Copied!')"
          :data-to-copy="link"
          :snackbar-text="t('Link in clipboard')"
        />
      </p>
      <RssSection
        v-if="emission && undefined !== authStore.authOrgaId"
        :emission="emission"
      />
    </template>
  </ClassicModal>
</template>

<script setup lang="ts">
import ClassicCopyButton from "../../form/ClassicCopyButton.vue";
import ClassicModal from "../modal/ClassicModal.vue";
import { Emission } from "@/stores/class/general/emission";
import { defineAsyncComponent } from "vue";
import { useAuthStore } from "../../../stores/AuthStore";
import { useI18n } from "vue-i18n";
const RssSection = defineAsyncComponent(
  () => import("@/components/display/aggregator/RssSection.vue"),
);

//Props 
defineProps({
  link: { default: "", type: String },
  emission: { default: undefined, type: Object as () => Emission },
})

//Emits
const emit = defineEmits(["close"]);

//Composables
const { t } = useI18n();
const authStore = useAuthStore();

//Methods
function closePopup(): void {
  emit("close");
}
</script>
