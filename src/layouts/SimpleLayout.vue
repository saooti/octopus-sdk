<!-- A basic layout showing only the content -->
<template>
    <slot />
    <div class="flex-grow-1" />
    <saooti-player :locale="locale" />
</template>

<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount } from 'vue';
import { saootiPlayer } from "@saooti/saooti-player";
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

onBeforeMount(() => {
    // Stop playing to avoid issues when switching to no layout
    saootiPlayer.stop();
});


onBeforeUnmount(() => {
    // Stop playing to avoid issues when switching from no layout
    saootiPlayer.stop();
});
</script>
