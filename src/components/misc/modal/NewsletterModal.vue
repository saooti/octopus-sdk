<template>
  <ClassicModal
    id-modal="newsletter-modal"
    :title-modal="modalTitle"
    :closable="false"
    @close="closePopup"
  >
    <template #body>
      <ShareNewsletter
        :podcast="podcast"
        :emission="emission"
        :playlist="playlist"
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
import ClassicModal from "../modal/ClassicModal.vue";
import ShareNewsletter from "../../display/sharing/ShareNewsletter.vue";
import { Podcast } from "@/stores/class/general/podcast";
import { computed } from "vue";
import { Emission } from "@/stores/class/general/emission";
import { Playlist } from "@/stores/class/general/playlist";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  podcast: { default: undefined, type: Object as () => Podcast },
  emission: { default: undefined, type: Object as () => Emission },
  playlist: { default: undefined, type: Object as () => Playlist },
})

//Emits
const emit = defineEmits(["close"]);

//Composables
const { t } = useI18n();

//Computed
const modalTitle = computed(() => {
  if (props.podcast) {
    return t("Share the episode in your newsletter");
  }
  if (props.emission) {
    return t("Share the series in your newsletter");
  }
  return t("Share the playlist in your newsletter");
});

//Methods
function closePopup(): void {
  emit("close");
}
</script>