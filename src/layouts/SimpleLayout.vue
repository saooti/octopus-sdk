<!-- A basic layout showing only the content -->
<template>
	<slot />
</template>

<script setup lang="ts">
import { usePlayerStore } from '../../stores/PlayerStore';
import { onBeforeMount } from 'vue';

const playerStore = usePlayerStore();

onBeforeMount(() => {
	// Stop playing to avoid issues when switching to no layout
	playerStore.stop();
});
</script>
