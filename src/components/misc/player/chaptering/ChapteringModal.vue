<template>
  <ClassicModal
    id-modal="chaptering-modal"
    :title-modal="t('Chaptering')"
    @close="closePopup"
  >
    <template #body>
      <div class="d-flex flex-column">
        <button
          v-for="(chapter, index) in playerStore.playerChapteringPercent"
          :key="chapter"
          class="btn d-flex flex-nowrap align-items-center p-2 mt-1 c-hand text-truncate mb-1"
          :class="actualChapter === index ? 'chapter-selected' : 'border'"
          @click="goToChapter(index)"
        >
          <div class="d-flex align-items-center me-auto">
            <WaveformIcon v-if="actualChapter === index" />
            <div v-else>{{ index + 1 }}</div>
            <div class="ms-2">{{ "- " + chapter.title }}</div>
          </div>
          <div>{{ chapter.startDisplay }}</div>
        </button>
      </div>
    </template>
    <template #footer>
      <button class="btn m-1" @click="closePopup">
        {{ t("Close") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script setup lang="ts">
import WaveformIcon from "vue-material-design-icons/Waveform.vue";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import ClassicModal from "../../modal/ClassicModal.vue";
import { onMounted, Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  actualChapter: { default: -1, type: Number }
})

//Emits
const emit = defineEmits(["close"]);

//Data 
const audioPlayer : Ref<HTMLAudioElement | null>= ref(null);

//Composables
const { t } = useI18n();
const playerStore = usePlayerStore();


onMounted(()=>{
  audioPlayer.value = document.querySelector("#audio-player");
})

//Methods
function closePopup(): void {
  emit("close");
}
function goToChapter(index: number) {
  if (!playerStore.playerChapteringPercent || !audioPlayer.value) {
    return;
  }
  const seekTime =
  playerStore.playerTotal *
    (playerStore.playerChapteringPercent[index].startPercent / 100);
  playerStore.playerUpdateSeekTime(seekTime);
  if (0 === seekTime) {
    playerStore.playerUpdateElapsed(0);
  }
  audioPlayer.value.currentTime = seekTime;
}
</script>
<style lang="scss">

.octopus-app .chapter-selected {
  border: var(--octopus-primary) 3px solid;
}
</style>
