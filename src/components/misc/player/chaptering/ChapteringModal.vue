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
            <svg
              v-if="actualChapter === index"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-soundwave"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5m-2 2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m-6 1.5A.5.5 0 0 1 5 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m-10 1A.5.5 0 0 1 3 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5m12 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5"
              />
            </svg>
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
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import ClassicModal from "../../modal/ClassicModal.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ChapteringModal",
  components: {
    ClassicModal,
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
@use '@scss/variables' as octopusVariables;
.octopus-app {
  .chapter-selected {
    border: octopusVariables.$octopus-primary-color 3px solid;
  }
}
</style>
