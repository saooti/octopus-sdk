<template>
  <div
    class="octopus-progress c-hand-auto mt-1"
    :class="isAmbiance ? 'ambiance-progress' : ''"
  >
    <div
      class="octopus-progress-bar"
      :class="isBack ? 'no-transition' : ''"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + percentProgress + '%'"
    />
  </div>
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
      isBack: false as boolean,
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
    handlePercentInterval(/* clear: boolean */): void {
      /*  if(clear){
        clearInterval((this.percentInterval as unknown as number));
        this.percentInterval = undefined;
        return;
      } */
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
      this.isBack = percentPlayed < this.playerElapsed;
      this.playerUpdateElapsed(
        percentPlayed,
        this.playerRadio?.metadata.playDuration,
      );
    },
  },
});
</script>
<style lang="scss">
@use "../../../../assets/progressbar";
</style>
