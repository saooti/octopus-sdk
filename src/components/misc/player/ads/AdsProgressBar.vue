<template>
  <progress
    class="ambiance-progress c-hand-auto mt-1"
    min="0"
    max="100"
    :value="adPercentProgress"
    :aria-label="$t('Advertising')"
  />
</template>

<script lang="ts">
import { useVastStore } from "../../../../stores/VastStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "AdsProgressBar",
  computed: {
    ...mapState(useVastStore, ["adPercentProgress"]),
  },
});
</script>