<template>
  <div v-if="actualChapter" class="d-flex mb-1">
    <button
      class="btn-transparent d-flex align-items-center text-truncate medium-text text-light"
      @click="showChaptering = !showChaptering"
    >
      <div class="text-truncate">
        {{ actualIndex + 1 + " - " + actualChapter.title }}
      </div>
      <ChevronRightIcon :size="16" />
    </button>
    <ChapteringModal
      v-if="showChaptering"
      :actual-chapter="actualIndex"
      @close="showChaptering = false"
    />
  </div>
  <div v-else-if="playerStore.playerChapteringPercent" class="margin-chaptering"></div>
</template>
<script setup lang="ts">
import ChevronRightIcon from "vue-material-design-icons/ChevronRight.vue";
import { ChapterPercent } from "@/stores/class/chaptering/chaptering";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { defineAsyncComponent, Ref, ref, watch } from "vue";
const ChapteringModal = defineAsyncComponent(
  () => import("./ChapteringModal.vue"),
);

//Data 
const actualChapter : Ref<ChapterPercent | undefined>= ref(undefined);
const actualIndex = ref(-1);
const showChaptering = ref(false);


//Composables
const playerStore = usePlayerStore();

//Watch
watch(()=>playerStore.playerElapsed, () => {
  if (!playerStore.playerChapteringPercent) {
    actualChapter.value = undefined;
    return;
  }
  const progressPercent = (playerStore.playerElapsed ?? 0) * 100;
  if (
    actualChapter.value &&
    isInChapter(progressPercent, actualChapter.value)
  ) {
    return;
  }
  for (
    let i = 0, len = playerStore.playerChapteringPercent.length;
    i < len;
    i++
  ) {
    if (
      isInChapter(progressPercent, playerStore.playerChapteringPercent[i])
    ) {
      actualChapter.value = playerStore.playerChapteringPercent[i];
      actualIndex.value = i;
      return;
    }
  }
  actualChapter.value = undefined;
  actualIndex.value = -1;
}, {immediate: true});


//Methods
function isInChapter(val: number, chapter: ChapterPercent) {
  return (
    Math.floor(chapter.startPercent) <= val &&
    val < Math.floor(chapter.endPercent)
  );
}
</script>
<style lang="scss">
.octopus-app .margin-chaptering {
  height: 23px;
}
</style>
