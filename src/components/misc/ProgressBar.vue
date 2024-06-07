<template>
  <div
    v-if="!inPlayer || display"
    id="test-menu-dropdown"
    class="octopus-progress"
  >
    <div
      v-if="secondaryProgress"
      class="octopus-progress-bar bg-light"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + secondaryProgress + '%'"
    />
    <template v-if="playerMedia">
      <div
        v-if="mediaCueInPercent > 0"
        class="octopus-progress-bar bg-complementary"
        :style="{ width: +mediaCueInPercent + '%' }"
      />
      <div
        v-if="mediaCueOutPercent < 100"
        class="octopus-progress-bar end-0 bg-complementary"
        :style="{ width: +100 - mediaCueOutPercent + '%' }"
      />
    </template>
    <div
      class="octopus-progress-bar bg-primary"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + mainProgress + '%'"
    />
    <template v-if="playerMedia">
      <div
        v-if="mediaCueInPercent > 0"
        class="octopus-progress-bar octopus-progress-bar-duration bg-complementary"
        :style="{ left: +mediaCueInPercent + '%' }"
      />
      <div
        v-if="mediaCueOutPercent < 100"
        class="octopus-progress-bar end-0 octopus-progress-bar-duration bg-complementary"
        :style="{ right: +100 - mediaCueOutPercent + '%' }"
      />
    </template>
    <div
      v-if="alertBar"
      class="octopus-progress-bar octopus-progress-bar-duration bg-danger"
      :style="'left: ' + alertBar + '%'"
    />
    <div
      v-if="isProgressCursor"
      class="octopus-progress-bar-cursor"
      :style="'left:' + mainProgress + '%'"
    />
    <template v-if="playerChapteringPercent">
      <template v-for="chapter in playerChapteringPercent" :key="chapter">
        <div
          :id="'chapter-' + chapter.startPercent"
          class="octopus-progress-bar octopus-chapter"
          role="progressbar"
          aria-valuenow="0"
          aria-valuemin="0"
          aria-valuemax="100"
          :style="{
            left: chapter.startPercent + '%',
            right: 100 - chapter.endPercent + '%',
          }"
        />
        <Teleport to="#octopus-player-component">
          <ClassicPopover
            :target="'chapter-' + chapter.startPercent"
            :is-fixed="true"
            relative-class="player-container"
            :only-mouse="true"
            popover-class="octopus-small-popover popover-z-index"
            :content="chapter.title"
          />
        </Teleport>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
const ClassicPopover = defineAsyncComponent(
  () => import("../misc/ClassicPopover.vue"),
);
export default defineComponent({
  name: "ProgressBar",
  components: {
    ClassicPopover,
  },
  props: {
    alertBar: { default: undefined, type: Number },
    mainProgress: { default: 0, type: Number },
    secondaryProgress: { default: 0, type: Number },
    isProgressCursor: { default: false, type: Boolean },
    inPlayer: { default: false, type: Boolean },
  },
  data() {
    return {
      mediaCueInPercent: 0 as number,
      mediaCueOutPercent: 100 as number,
    };
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerMedia",
      "playerChapteringPercent",
      "playerStatus",
    ]),
    display() {
      return "STOPPED" !== this.playerStatus;
    },
  },
  watch: {
    playerMedia: {
      deep: true,
      immediate: true,
      handler() {
        if (this.playerMedia) {
          this.mediaCueInPercent = this.timeMediaToPercent(
            this.playerMedia.cueIn ?? 0,
          );
          this.mediaCueOutPercent = this.timeMediaToPercent(
            this.playerMedia.cueOut ?? null,
          );
        }
      },
    },
  },
  methods: {
    timeMediaToPercent(value: number | null): number {
      if (null === value || !this.playerMedia) {
        return 100;
      }
      return (value * 100) / (this.playerMedia?.duration ?? 1);
    },
  },
});
</script>

<style lang="scss">
@import "../../assets/progressbar.scss";
.octopus-app .player-container {
  .octopus-small-popover {
    font-size: 0.7rem;
    background: #282828;
    color: white;
    border: 0;
    .p-2 {
      padding: 0.2rem !important;
    }
  }
}
</style>
