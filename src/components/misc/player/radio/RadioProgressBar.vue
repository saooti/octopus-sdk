<template>
  <progress
    class="c-hand-auto mt-1"
    min="0"
    max="100"
    :value="percentProgress"
    :aria-label="$t('Radio')"
    :class="isAmbiance ? 'ambiance-progress' : ''"
  />
</template>

<script lang="ts">
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import dayjs from "dayjs";
import { defineComponent } from "vue";
export default defineComponent({
  name: "RadioProgressBar",

  components: {},
  emits: ["updateNotListenTime"],
  data() {
    return {
      percentInterval: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },

  computed: {
    ...mapState(usePlayerStore, ["playerRadio", "playerElapsed"]),
    isAmbiance(): boolean {
      return !this.playerRadio?.podcast?.podcastId;
    },
    percentProgress(): number {
      if (!this.playerElapsed) {
        return 0;
      }
      return this.playerElapsed * 100;
    },
  },
  mounted() {
    this.handlePercentInterval();
  },
  unmounted() {
    clearInterval(this.percentInterval as unknown as number);
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerUpdateElapsed"]),
    handlePercentInterval(): void {
      this.percentInterval = setInterval(() => {
        this.calculatePercent();
      }, 1000);
    },
    calculatePercent(): void {
      if (!this.playerRadio?.metadata) {
        return;
      }
      const actualMilliSecondsPlayed = dayjs()
        .subtract(18, "second")
        .diff(dayjs(this.playerRadio.metadata.startDate));
      const percentPlayed =
        actualMilliSecondsPlayed /
        (this.playerRadio?.metadata.playDuration * 1000);
      this.playerUpdateElapsed(
        percentPlayed,
        this.playerRadio?.metadata.playDuration,
      );
    },
  },
});
</script>
