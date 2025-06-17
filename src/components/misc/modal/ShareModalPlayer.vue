<template>
  <ClassicModal
    id-modal="share-modal"
    :title-modal="t('Share the player')"
    @close="closePopup"
  >
    <template #body>
      <ClassicNav v-model:active-tab="activeTab" :tab-number="tabs.length">
        <template v-for="(tab, index) in tabs" #[index]>
          {{ tab }}
        </template>
        <template #tab0>
          <p class="word-break-word">{{ embedLink }}</p>
          <button
            class="btn-transparent"
            :title="t('Copy')"
            @click="onCopyCode(embedLink, afterCopy)"
          >
            <ContentCopyIcon />
          </button>
        </template>
        <template #tab1>
          <div class="d-flex flex-column flex-grow-1">
            <div class="d-flex justify-content-between align-items-center">
              <p class="word-break-word">{{ embedlyLink }}</p>
              <button
                class="btn-transparent"
                :title="t('Copy')"
                @click="onCopyCode(embedlyLink, afterCopy)"
              >
                <ContentCopyIcon />
              </button>
            </div>
            <QrCode :url="embedlyLink" />
          </div>
        </template>
        <template v-if="directLink" #tab2>
          <p class="word-break-word">{{ directLink.audioUrl }}</p>
          <button
            class="btn-transparent"
            :title="t('Copy')"
            @click="onCopyCode(directLink.audioUrl, snackbarRef)"
          >
            <ContentCopyIcon />
          </button>
        </template>
      </ClassicNav>
    </template>
    <template #footer>
      <button class="btn btn-primary m-1" @click="closePopup">
        {{ t("Close") }}
      </button>
    </template>
  </ClassicModal>
  <SnackBar ref="snackbar" position="bottom-left" />
</template>

<script setup lang="ts">
import ContentCopyIcon from "vue-material-design-icons/ContentCopy.vue";
import SnackBar from "../SnackBar.vue";
import displayHelper from "../../../helper/displayHelper";
import ClassicModal from "../modal/ClassicModal.vue";
import ClassicNav from "../ClassicNav.vue";
import QrCode from "../../display/sharing/QrCode.vue";
import { computed, ref, useTemplateRef } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  embedLink: { default: undefined, type: String },
  embedlyLink: { default: undefined, type: String },
  directLink: { default: undefined, type: Object as () => Podcast },
})

//Emits
const emit = defineEmits(["close"]);

//Data 
const activeTab = ref(0);
const snackBarRef = useTemplateRef('snackbar');

//Composables
const { t } = useI18n();

//Computed
const tabs = computed(() => {
  if (props.directLink) {
    return [t("Embed link"),t("Embedly link"),t("Direct link"),];
  }
  return [t("Embed link"), t("Embedly link")];
});


//Methods
function onCopyCode(link: string, callback: () => void){
  displayHelper.onCopyCode(link, callback);
}
function closePopup(): void {
  emit("close");
}
function afterCopy(): void {
  (snackBarRef?.value as InstanceType<typeof SnackBar>).open(t("Data in clipboard"),);
}
</script>
