<template>
  <ClassicModal
    id-modal="chaptering-modal"
    :title-modal="$t('Chaptering')"
    @close="closePopup"
  >
    <template #body>
      <div class="d-flex flex-column">
        <button
          v-for="(chapter, index) in playerChapteringPercent"
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
        {{ $t("Close") }}
      </button>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import WaveformIcon from "vue-material-design-icons/Waveform.vue";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import ClassicModal from "../../modal/ClassicModal.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ChapteringModal",
  components: {
    ClassicModal,
    WaveformIcon,
  },
  props: { actualChapter: { default: -1, type: Number } },
  emits: ["close"],
  data() {
    return {
      audioPlayer: null as HTMLAudioElement | null,
    };
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerLive",
      "playerChapteringPercent",
      "playerTotal",
      "playerElapsed",
    ]),
  },
  created() {
    this.audioPlayer = document.querySelector("#audio-player");
  },
  methods: {
    ...mapActions(usePlayerStore, [
      "playerUpdateSeekTime",
      "playerUpdateElapsed",
    ]),
    closePopup(): void {
      this.$emit("close");
    },
    goToChapter(index: number) {
      if (!this.playerChapteringPercent || !this.audioPlayer) {
        return;
      }
      const seekTime =
        this.playerTotal *
        (this.playerChapteringPercent[index].startPercent / 100);
      this.playerUpdateSeekTime(seekTime);
      if (0 === seekTime) {
        this.playerUpdateElapsed(0);
      }
      this.audioPlayer.currentTime = seekTime;
    },
  },
});
</script>
<style lang="scss">

.octopus-app .chapter-selected {
  border: var(--octopus-primary) 3px solid;
}
</style>
