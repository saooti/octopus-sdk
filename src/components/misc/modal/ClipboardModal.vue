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
      <!--
        RssSection is not defined in the SDK: it is resolved at runtime from
        the consuming app's globally registered components (app.component()),
        and renders nothing if the app hasn't registered one under that name.
      -->
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
import { useAuthStore } from "../../../stores/AuthStore";
import { useI18n } from "vue-i18n";

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
