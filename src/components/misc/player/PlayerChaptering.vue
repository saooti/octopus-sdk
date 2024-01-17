<template>
  <div v-if="actualChapter" class="d-flex mb-1">
    <button
      class="btn-transparent d-flex align-items-center text-truncate medium-text text-light"
      @click="showChaptering = !showChaptering"
    >
      <div class="text-truncate">
        {{ actualIndex + 1 + " - " + actualChapter.title }}
      </div>
      <span class="saooti-right small-text" />
    </button>
    <ChapteringModal
      v-if="showChaptering"
      :actual-chapter="actualIndex"
      @close="showChaptering = false"
    />
  </div>
  <div v-else-if="playerChapteringPercent" class="margin-chaptering"></div>
</template>
<script lang="ts">
import { ChapterPercent } from "@/stores/class/chaptering/chaptering";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
const ChapteringModal = defineAsyncComponent(
  () => import("./ChapteringModal.vue"),
);
export default defineComponent({
  name: "PlayerChaptering",

  components: {
    ChapteringModal,
  },
  data() {
    return {
      actualChapter: undefined as ChapterPercent | undefined,
      actualIndex: -1 as number,
      showChaptering: false as boolean,
    };
  },
  computed: {
    ...mapState(usePlayerStore, ["playerChapteringPercent", "playerElapsed"]),
  },
  watch: {
    playerElapsed: {
      immediate: true,
      handler() {
        if (!this.playerChapteringPercent) {
          this.actualChapter = undefined;
          return;
        }
        const progressPercent = (this.playerElapsed ?? 0) * 100;
        if (
          this.actualChapter &&
          this.isInChapter(progressPercent, this.actualChapter)
        ) {
          return;
        }
        for (
          let i = 0, len = this.playerChapteringPercent.length;
          i < len;
          i++
        ) {
          if (
            this.isInChapter(progressPercent, this.playerChapteringPercent[i])
          ) {
            this.actualChapter = this.playerChapteringPercent[i];
            this.actualIndex = i;
            return;
          }
        }
        this.actualChapter = undefined;
        this.actualIndex = -1;
      },
    },
  },
  methods: {
    isInChapter(val: number, chapter: ChapterPercent) {
      return (
        Math.floor(chapter.startPercent) <= val &&
        val < Math.floor(chapter.endPercent)
      );
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .margin-chaptering {
    height: 23px;
  }
}
</style>
