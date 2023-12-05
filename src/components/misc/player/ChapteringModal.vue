<template>
  <ClassicModal
    id-modal="chaptering-modal"
    :title-modal="$t('Chaptering')"
    @close="closePopup"
  >
    <template #body>
      <div class="d-flex flex-column">
        <a
          v-for="(chapter, index) in playerChapteringPercent"
          :key="chapter"
          class="c-hand text-truncate mb-1"
          @click="goToChapter(index)"
        >
          {{ chapter.startTime + " - " + chapter.title }}
        </a>
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
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import ClassicModal from "../modal/ClassicModal.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ChapteringModal",
  components: {
    ClassicModal,
  },
  props: {},
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
