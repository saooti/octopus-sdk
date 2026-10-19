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

<script setup lang="ts">
import { useSaootiPlayer } from '@/components/composable/useSaootiPlayer';

const { playerStatus } = useSaootiPlayer();
</script>
