<template>
  <ClassicModal
    id-modal="player-anonymous-modal"
    :title-modal="t('Share the player')"
    @close="closePopup"
  >
    <template #body>
      <SharePlayer
        :podcast="podcast"
        :emission="emission"
        :exclusive="exclusive"
        :not-exclusive="notExclusive"
        :organisation-id="authStore.authOrgaId"
      />
    </template>
    <template #footer>
      <button class="btn btn-primary m-1" @click="closePopup">
        {{ t("Close") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script setup lang="ts">
import { Podcast } from "@/stores/class/general/podcast";
import ClassicModal from "../../misc/modal/ClassicModal.vue";
import SharePlayer from "./SharePlayer.vue";
import { useAuthStore } from "../../../stores/AuthStore";
import { Emission } from "@/stores/class/general/emission";
import { useI18n } from "vue-i18n";

//Props
defineProps({
  podcast: { default: undefined, type: Object as () => Podcast },
  emission: { default: undefined, type: Object as () => Emission },
  exclusive: { default: false, type: Boolean },
  notExclusive: { default: true, type: Boolean },
});

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
