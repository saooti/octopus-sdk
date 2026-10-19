<!-- A basic layout showing only the content -->
<template>
    <slot />
    <div class="flex-grow-1" />
    <PlayerComponent />
</template>

<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount } from 'vue';
/*
TODO PLAYER
import { usePlayerStore } from '../stores/PlayerStore';
import PlayerComponent from '../components/misc/player/PlayerComponent.vue';
*/

/*
TODO PLAYER
const playerStore = usePlayerStore();

onBeforeMount(() => {
    // Stop playing to avoid issues when switching to no layout
    playerStore.stop();
});


onBeforeUnmount(() => {
    // Stop playing to avoid issues when switching from no layout
    playerStore.stop();
});
*/
</script>
