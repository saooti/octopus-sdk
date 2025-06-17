<template>
  <progress
    class="ambiance-progress c-hand-auto mt-1"
    min="0"
    max="100"
    :value="vastStore.adPercentProgress"
    :aria-label="t('Advertising')"
  />
</template>

<script setup lang="ts">
import { useVastStore } from "../../../../stores/VastStore";
import { useI18n } from "vue-i18n";

//Composables
const { t } = useI18n();
const vastStore = useVastStore();
</script>