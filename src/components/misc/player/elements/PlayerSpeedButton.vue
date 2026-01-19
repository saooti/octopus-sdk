<template>
  <button
    id="player-speed-button"
    :title="t('Change speed')"
    class="btn play-button-box small-font btn-transparent text-light me-0"
  >
    {{ "×" + speedArray[speedIndex] }}
  </button>
  <ClassicPopover
    target="player-speed-button"
    relative-class="player-container"
    class="player-speed-dropdown"
    :constrain-height="state.player.topPlacement !== true"
    :top-pos="state.player.topPlacement !== true"
    only-click
    is-fixed
  >
    <button
      v-for="(speed, index) in speedArray"
      :key="speed"
      class="octopus-dropdown-item speed-style"
      @mousedown="changeSpeed(index)"
      @keydown.enter="changeSpeed(index)"
    >
      {{ "×" + speed }}
    </button>
  </ClassicPopover>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ClassicPopover from "../../ClassicPopover.vue";
import { onMounted, Ref, ref } from "vue";
import { state } from "../../../../stores/ParamSdkStore";

//Data 
const speedIndex = ref(2);
const speedArray = ref([0.5, 0.75, 1, 1.25, 1.5, 1.75]);
const audioPlayer: Ref<HTMLAudioElement | null> = ref(null);

//Composables
const { t } = useI18n();

onMounted(()=>{
  audioPlayer.value = document.querySelector("#audio-player");
})

//Methods
function changeSpeed(index: number) {
  speedIndex.value = index;
  if (audioPlayer.value) {
    audioPlayer.value.playbackRate = speedArray.value[speedIndex.value];
  }
}
</script>

<style scoped lang="scss">

.octopus-app {
  .speed-style {
    font-size: 12px;
  }

  .player-speed-dropdown {
    min-width: 100px;
  }
}
</style>
