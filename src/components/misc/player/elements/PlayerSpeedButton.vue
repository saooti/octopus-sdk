<template>
  <button
    id="player-speed-button"
    :title="$t('Change speed')"
    class="btn play-button-box small-font btn-transparent text-light me-0"
  >
    {{ "×" + speedArray[speedIndex] }}
  </button>
  <ClassicPopover
    target="player-speed-button"
    relative-class="player-container"
    class="player-speed-dropdown"
    :top-pos="true"
    :only-click="true"
  >
    <button
      v-for="(speed, index) in speedArray"
      :key="speed"
      class="octopus-dropdown-item speed-style"
      @mousedown="changeSpeed(index)"
    >
      {{ "×" + speed }}
    </button>
  </ClassicPopover>
</template>
<script lang="ts">
import ClassicPopover from "../../ClassicPopover.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PlayerSpeedButton",
  components: {
    ClassicPopover,
  },

  data() {
    return {
      audioPlayer: null as HTMLAudioElement | null,
      speedIndex: 2 as number,
      speedArray: [0.5, 0.75, 1, 1.25, 1.5, 1.75],
    };
  },
  mounted() {
    this.audioPlayer = document.querySelector("#audio-player");
  },
  methods: {
    changeSpeed(index: number) {
      this.speedIndex = index;
      if (this.audioPlayer) {
        this.audioPlayer.playbackRate = this.speedArray[this.speedIndex];
      }
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .speed-style {
    font-size: 12px;
  }
  .player-speed-dropdown {
    min-width: 100px;
  }
}
</style>
