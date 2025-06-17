<template>
  <div
    :class="'PLAYING' === playerStore.playerStatus ? 'play-animation' : ''"
    class="bloc-paddle mx-1"
  >
    <span class="paddle1" />
    <span class="paddle2" />
    <span class="paddle3" />
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from "../../../stores/PlayerStore";

const playerStore = usePlayerStore();
</script>