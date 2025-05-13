<template>
  <div
    v-if="!inPlayer || display"
    id="test-menu-dropdown"
    class="octopus-progress"
  >
    <div
      v-if="secondaryProgress"
      class="octopus-progress-bar bg-warning"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="$t('Live progress bar')"
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
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="$t('Listening progress bar')"
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
          :style="{
            left: chapter.startPercent + '%',
            right: 100 - chapter.endPercent + '%',
          }"
        />
        <!-- If top layer widely available no need to teleport -->
        <Teleport to="#octopus-player-component">
          <ClassicPopover
            :target="'chapter-' + chapter.startPercent"
            :is-fixed="true"
            relative-class="player-container"
            :only-mouse="true"
            popover-class="octopus-small-popover popover-z-index"
            :content="chapter.title"
            :is-top-layer="true"
          />
        </Teleport>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { usePlayerStore } from "../../stores/PlayerStore";
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
.octopus-app{
  .octopus-progress{
    display: flex;
    overflow: hidden;
    background-color:var(--octopus-secondary-lighter);
    border-radius: var(--octopus-border-radius);
    position: relative;
    cursor: pointer;
    .octopus-progress-bar{
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      color: var(--octopus-color-on-primary);
      text-align: center;
      white-space: nowrap;
      background-color: var(--octopus-primary);
      transition: width 0.6s ease;
    }

    .octopus-chapter{
      position: absolute;
      background: transparent;
      background-clip: content-box;
      padding: 0 5px;
      box-shadow: inset -2px 1px 0 0 black,
                  inset 2px 1px 0 0 black;

      &:hover{
        background: var(--octopus-background-transparent);
        box-shadow: -4px 1px 0 0 black;
      }
    }

    &,.octopus-progress-bar{
      height: 4px;
      @media (width <= 960px) {
        height: 8px;
      }
    }

    &.large,&.large .octopus-progress-bar{
      height: 15px;
    }

    &.medium,&.medium .octopus-progress-bar{
      height: 6px;
    }

    .octopus-progress-bar-duration {
      width: 10px;
    }

    .octopus-progress-bar-cursor{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: black;
      align-self: center;
      position: absolute;
    }

    .end-0{
      right: 0;
    }
  }

  .player-container {
  .octopus-small-popover {
    font-size: 0.7rem;
    background: var(--octopus-player-color);
    color: white;
    border: 0;

    .p-2 {
      padding: 0.2rem !important;
    }
  }
}
}
</style>
