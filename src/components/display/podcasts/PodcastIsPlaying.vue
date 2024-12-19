<template>
  <div
    :class="'PLAYING' === playerStatus ? 'play-animation' : ''"
    class="bloc-paddle mx-1"
  >
    <span class="paddle1" />
    <span class="paddle2" />
    <span class="paddle3" />
  </div>
</template>

<script lang="ts">
import { usePlayerStore } from "../../../stores/PlayerStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastIsPlaying",
  computed: {
    ...mapState(usePlayerStore, [
      "playerStatus",
    ])
  },
});
</script>