<template>
  <div class="d-flex align-items-center podcast-play-bar">
    <div class="me-2">
      {{ playedTime }}
    </div>
    <div class="position-relative flex-grow-1">
      <ProgressBar
        :main-progress="percentProgress"
        class="medium"
        @mouseup="seekTo"
      />
    </div>
    <div class="ms-2">
      {{ totalTime }}
    </div>
  </div>
</template>

<script lang="ts">
import ProgressBar from "../../misc/ProgressBar.vue";
import DurationHelper from "../../../helper/duration";
import displayMethods from "../../mixins/displayMethods";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastPlayBar",
  components: {
    ProgressBar,
  },
  mixins: [displayMethods],
  props: {
    podcastId: { default: undefined, type: Number },
    duration: { default: 0, type: Number },
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerElapsed",
      "playerTotal",
    ]),
    percentProgress(): number {
      if (this.podcastId !== this.playerPodcast?.podcastId) {
        return 0;
      }
      return !this.playerElapsed ? 0 : this.playerElapsed * 100;
    },
    playedTime(): string {
      if (this.podcastId === this.playerPodcast?.podcastId) {
        if (
          this.playerElapsed &&
          this.playerElapsed > 0 &&
          this.playerTotal &&
          this.playerTotal > 0
        ) {
          return DurationHelper.formatDuration(
            Math.round(this.playerElapsed * this.playerTotal),
          );
        }
      }
      return "00:00";
    },
    totalTime(): string {
      return DurationHelper.formatDuration(Math.round(this.duration / 1000));
    },
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerUpdateSeekTime"]),
    seekTo(event: MouseEvent): void {
      if (
        !this.playerPodcast ||
        this.podcastId !== this.playerPodcast.podcastId
      ) {
        return;
      }
      const rect = (event.currentTarget as Element).getBoundingClientRect();
      const barWidth = (event.currentTarget as Element).clientWidth;
      const x = event.clientX - rect.left;
      const percentPosition = x / barWidth;
      if (percentPosition * 100 >= this.percentLiveProgress) return;
      this.playerUpdateSeekTime(this.playerTotal * percentPosition);
    },
  },
});
</script>
