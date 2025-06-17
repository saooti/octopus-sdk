<template>
  <button
    v-if="vastStore.isAdPlaying && vastStore.isAdSkippable"
    :disabled="!vastStore.isSkipCurrentlyAllowed"
    class="btn skip-ad-btn"
    @click="skipAd"
  >
    {{ buttonText }}
  </button>
</template>

<script setup lang="ts">
// see if it has more solutions on https://groups.google.com/g/ima-sdk/c/ky-Q_pUXrIA/m/-P2TsMuABwAJ
import { useVastStore } from "../../../../stores/VastStore";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

//Composables
const { t } = useI18n();
const vastStore = useVastStore();

//Computed
const buttonText = computed(() => {
  if (vastStore.isSkipCurrentlyAllowed) {
    return t("Skip ad");
  }
  return t("Skip ad in seconds", {
    seconds: vastStore.timeTillSkipInSeconds,
  });
});

//Methods
function skipAd(): void {
  vastStore.updateIsAdSkipped(true);
}
</script>
<style lang="scss">
.octopus-app {
  .skip-ad-btn {
    max-width: 140px;
    text-wrap: wrap;
    text-wrap: balance;

    &:hover {
      background: white;
    }
  }
}
</style>
