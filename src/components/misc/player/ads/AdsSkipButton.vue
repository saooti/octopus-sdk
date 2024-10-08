<template>
  <button
    v-if="isAdPlaying && isAdSkippable"
    :disabled="!isSkipCurrentlyAllowed"
    class="btn skip-ad-btn"
    @click="skipAd"
  >
    {{ buttonText }}
  </button>
</template>

<script lang="ts">
import { useVastStore } from "../../../../stores/VastStore";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  //TODO see if it has more solutions on https://groups.google.com/g/ima-sdk/c/ky-Q_pUXrIA/m/-P2TsMuABwAJ
  name: "AdsSkipButton",
  computed: {
    ...mapState(useVastStore, [
      "isAdPlaying",
      "isAdSkippable",
      "isSkipCurrentlyAllowed",
      "timeTillSkipInSeconds",
    ]),
    buttonText(): string {
      if (this.isSkipCurrentlyAllowed) {
        return this.$t("Skip ad");
      }
      return this.$t("Skip ad in seconds", {
        seconds: this.timeTillSkipInSeconds,
      });
    },
  },
  methods: {
    ...mapActions(useVastStore, ["updateIsAdSkipped"]),
    skipAd(): void {
      this.updateIsAdSkipped(true);
    },
  },
});
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
