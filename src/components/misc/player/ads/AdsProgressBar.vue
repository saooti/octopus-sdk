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

<style scoped lang="scss">
.octopus-app {
  progress {
      background-color: var(--octopus-player-progress-background-color);
      border-radius: var(--octopus-border-radius);
      accent-color: var(--octopus-player-progress-color-current);
      color: var(--octopus-player-progress-color-current);
      border: none;

      &::-moz-progress-bar, &::-webkit-progress-value {
        background: var(--octopus-player-progress-color-current);
      }
  }
}
</style>
