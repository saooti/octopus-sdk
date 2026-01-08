<!-- A basic layout showing only the content -->
<template>
    <slot />
    <div class="flex-grow-1" />
    <PlayerComponent />
</template>

<script setup lang="ts">
import { usePlayerStore } from '../stores/PlayerStore';
import { onBeforeMount, onBeforeUnmount } from 'vue';
import PlayerComponent from '../components/misc/player/PlayerComponent.vue';

const playerStore = usePlayerStore();

onBeforeMount(() => {
    // Stop playing to avoid issues when switching to no layout
    playerStore.stop();
});


onBeforeUnmount(() => {
    // Stop playing to avoid issues when switching from no layout
    playerStore.stop();
});
</script>
