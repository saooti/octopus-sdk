<template>
  <button
    v-if="!playerError"
    :title="t('Play')"
    :class="{
      'p-0': !displayIsPaused && !displayIsPlaying,
      'play-button-box': !isBigButton,
      'play-big-button-box': isBigButton,
    }"
    class="btn text-light bg-primary"
    @click="switchPausePlay"
  >
    <PlayIcon v-if="displayIsPaused" :size="isBigButton ? 60 : 30" />
    <PauseIcon v-if="displayIsPlaying" :size="isBigButton ? 60 : 30" />
    <ClassicSpinner
      v-if="!displayIsPaused && !displayIsPlaying"
      :small="!isBigButton"
    />
  </button>
</template>
<script setup lang="ts">
import PlayIcon from "vue-material-design-icons/Play.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import ClassicSpinner from "../../ClassicSpinner.vue";
import { computed, onMounted, onUnmounted } from "vue";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { useVastStore } from "../../../../stores/VastStore";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  playerError: { default: false, type: Boolean },
  isBigButton: { default: false, type: Boolean },
})

//Composables
const { t } = useI18n();
const playerStore = usePlayerStore();
const vastStore = useVastStore();


//Computed
const displayIsPlaying = computed(() => {
  return (
    (vastStore.isAdPlaying && !vastStore.isAdPaused) ||
    (!vastStore.isAdPlaying && playerStore.isPlaying)
  );
});
const displayIsPaused = computed(() => {
  return (
    (vastStore.isAdPlaying && vastStore.isAdPaused) ||
    (!vastStore.isAdPlaying && playerStore.isPaused)
  );
});


onMounted(()=>window.addEventListener("keydown", addKeyboardControl));
onUnmounted(()=>window.removeEventListener("keydown", addKeyboardControl))


//Methods
function addKeyboardControl(event: KeyboardEvent): void {
  if (!event || null === event) {
    return;
  }
  const element = event.target as HTMLElement;
  if (
    !element ||
    "INPUT" == element.tagName.toUpperCase() ||
    "TEXTAREA" == element.tagName.toUpperCase()
  ) {
    return;
  }
  if (" " === event.key || "Spacebar" === event.key) {
    event.preventDefault();
    switchPausePlay();
    return;
  }
  if (vastStore.isAdPlaying) {
    return;
  }
  if ("ArrowRight" === event.key && event.ctrlKey) {
    changeCurrentTime(15);
    return;
  }
  if ("ArrowLeft" === event.key && event.ctrlKey) {
    changeCurrentTime(-15);
  }
}
function changeCurrentTime(delay: number) {
  const audioPlayer: HTMLAudioElement | null = document.querySelector("#audio-player");
  if (!audioPlayer) {
    return;
  }
  audioPlayer.currentTime += delay;
}
function switchPausePlay(): void {
  if (vastStore.isAdPlaying) {
    vastStore.updateIsAdPaused(!vastStore.isAdPaused);
    return;
  }
  const audioPlayer: HTMLAudioElement | null =document.querySelector("#audio-player");
  if (!audioPlayer) {
    return;
  }
  playerStore.playerChangeStatus(!audioPlayer.paused);
}
</script>

<style lang="scss">
@use "../../../../style/playButton";
.octopus-app {
  .play-button-box:not(.small-font) {
    font-size: 1rem !important;
  }
  .play-big-button-box {
    height: 5rem;
    width: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
    border-radius: 50% !important;
    font-size: 2.5rem !important;
    flex-shrink: 0;
    cursor: pointer;
  }
}
</style>
