<template>
  <button
    v-if="!playerError"
    :title="$t('Play')"
    :class="{
      'saooti-play': displayIsPaused,
      'saooti-pause': displayIsPlaying,
      'p-0': !displayIsPaused && !displayIsPlaying,
      'play-button-box': !isBigButton,
      'play-big-button-box': isBigButton,
    }"
    class="btn text-light bg-primary"
    @click="switchPausePlay"
  >
    <ClassicSpinner
      v-if="!displayIsPaused && !displayIsPlaying"
      :small="!isBigButton"
    />
  </button>
</template>
<script lang="ts">
import ClassicSpinner from "../../ClassicSpinner.vue";
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useVastStore } from "@/stores/VastStore";
export default defineComponent({
  name: "PlayerPlayButton",

  components: {
    ClassicSpinner,
  },
  props: {
    playerError: { default: false, type: Boolean },
    isBigButton: { default: false, type: Boolean },
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(usePlayerStore, ["isPlaying", "isPaused"]),
    ...mapState(useVastStore, ["isAdPlaying", "isAdPaused"]),
    displayIsPlaying(): boolean {
      return (
        (this.isAdPlaying && !this.isAdPaused) ||
        (!this.isAdPlaying && this.isPlaying)
      );
    },
    displayIsPaused(): boolean {
      return (
        (this.isAdPlaying && this.isAdPaused) ||
        (!this.isAdPlaying && this.isPaused)
      );
    },
  },
  created() {
    window.addEventListener("keydown", this.addKeyboardControl);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.addKeyboardControl);
  },
  methods: {
    ...mapActions(useVastStore, ["updateIsAdPaused"]),
    ...mapActions(usePlayerStore, ["playerChangeStatus"]),
    addKeyboardControl(event: KeyboardEvent): void {
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
        this.switchPausePlay();
        return;
      }
      if (this.isAdPlaying) {
        return;
      }
      if ("ArrowRight" === event.key && event.ctrlKey) {
        this.changeCurrentTime(15);
        return;
      }
      if ("ArrowLeft" === event.key && event.ctrlKey) {
        this.changeCurrentTime(-15);
      }
    },
    changeCurrentTime(delay: number) {
      const audioPlayer: HTMLAudioElement | null =
        document.querySelector("#audio-player");
      if (!audioPlayer) {
        return;
      }
      audioPlayer.currentTime += delay;
    },
    switchPausePlay(): void {
      if (this.isAdPlaying) {
        this.updateIsAdPaused(!this.isAdPaused);
        return;
      }
      const audioPlayer: HTMLAudioElement | null =
        document.querySelector("#audio-player");
      if (!audioPlayer) {
        return;
      }
      this.playerChangeStatus(!audioPlayer.paused);
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .play-button-box {
    height: 2.2rem;
    width: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
    border-radius: 50% !important;
    flex-shrink: 0;
    cursor: pointer;
  }
  .play-button-box:not(.small-font){
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
