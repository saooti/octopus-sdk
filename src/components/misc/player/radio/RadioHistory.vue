<template>
  <div v-if="playerRadioHistory.length" class="d-flex align-items-center mt-3">
    <div class="fw-bold me-3">
      {{ t("Previously") + ":" }}
    </div>
    <button
      v-if="indexStart !== 0"
      class="btn btn-transparent text-light"
      @click="handleResize(0)"
    >
      <ChevronLeftIcon />
    </button>
    <div ref="historyListContainer" class="history-list-container">
      <div
        v-for="(pastItem, index) in playerRadioHistory"
        :id="'history' + index"
        :key="pastItem.title"
        class="d-flex flex-shrink-0"
      >
        <div class="d-flex flex-shrink-0 align-items-end">
          <time :datetime="pastItem.startDate" class="me-2 hour-past-item">{{
            displayTimeItem(pastItem)
          }}</time>
          <span class="me-3">{{ displayPreviousItem(pastItem) }}</span>
        </div>
      </div>
    </div>
    <button
      v-if="indexNotDisplay <= playerRadioHistory.length - 1"
      class="btn btn-transparent text-light"
      @click="handleResize(indexNotDisplay)"
    >
      <ChevronRightIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import ChevronLeftIcon from "vue-material-design-icons/ChevronLeft.vue";
import ChevronRightIcon from "vue-material-design-icons/ChevronRight.vue";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import dayjs from "dayjs";
import radioHelper from "../../../../helper/radio/radioHelper";
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";
import { MediaRadio } from "@/stores/class/general/player";
import { useI18n } from "vue-i18n";


//Data 
const indexStart = ref(0);
const indexNotDisplay = ref(100);
const historyListContainerRef = useTemplateRef('historyListContainer');

//Composables
const { t } = useI18n();
const playerStore = usePlayerStore();


//Computed
const playerRadioHistory = computed(() => playerStore.playerRadio?.history ?? []);
   

//Watch
watch(playerRadioHistory, () => {
  nextTick(() => {
    handleResize(0);
  });
}, {deep: true,immediate: true});


onMounted(()=>window.addEventListener("resize", () => {handleResize(0);}))
onUnmounted(()=>window.removeEventListener("resize", () => {handleResize(0);}))


//Methods
function displayEverythingAfterIndex(indexAsked: number) {
  for (let index = 0; index < playerRadioHistory.value.length; index++) {
    const el = historyListContainerRef?.value?.querySelector('#history' + index);
    if (!el) continue;
    if (index < indexAsked && !el.classList.contains("hid")) {
      el.classList.add("hid");
      continue;
    }
    if (index >= indexAsked && el.classList.contains("hid")) {
      el.classList.remove("hid");
    }
  }
}
function handleResize(indexAsked: number): void {
  const historyList = historyListContainerRef?.value as HTMLElement;
  if (null === historyList || !historyList) {
    return;
  }
  indexStart.value = indexAsked;
  indexNotDisplay.value = playerRadioHistory.value.length;
  displayEverythingAfterIndex(indexAsked);
  for (
    let index = indexStart.value + 1;
    index < playerRadioHistory.value.length;
    index++
  ) {
    const el = historyListContainerRef?.value?.querySelector('#history' + index);
    if (!el) continue;
    if (index > indexNotDisplay.value && !el.classList.contains("hid")) {
      el.classList.add("hid");
      continue;
    }
    const parent = el.parentElement;
    if (parent && el.offsetLeft + el.clientWidth > parent.clientWidth) {
      indexNotDisplay.value = index;
      el.classList.add("hid");
    }
  }
}
function displayTimeItem(item: MediaRadio): string {
  return dayjs(item.startDate).format("HH:mm");
}
function displayPreviousItem(item: MediaRadio): string {
  if (item.podcastId) {
    return item.title;
  }
  return radioHelper.displayTitle(item);
}
</script>
<style lang="scss">
.octopus-app {
  .history-list-container {
    display: inline-flex;
    justify-content: flex-start;
    overflow: hidden;
    flex-grow: 1;
    width: 0;
    position: relative;
  }

  .hour-past-item {
    font-size: 0.8rem;
    color: oklch(89% 0 0deg);
  }
}
</style>
