<template>
  <div class="octopus-progress ambiance-progress c-hand-auto mt-1">
    <div
      class="octopus-progress-bar"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + adPercentProgress + '%'"
    />
  </div>
</template>

<script lang="ts">
import { useVastStore } from "@/stores/VastStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "AdsProgressBar",
  computed: {
    ...mapState(useVastStore, ["adPercentProgress"]),
  },
});
</script>
<style lang="scss">
@import "../../../../assets/progressbar.scss";
</style>
