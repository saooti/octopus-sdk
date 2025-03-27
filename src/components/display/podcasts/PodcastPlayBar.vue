<template>
  <div class="d-flex align-items-center">
    <button
      v-if="
        playerPodcast !== podcast ||
        (playerPodcast === podcast && 'PAUSED' === playerStatus)
      "
      class="btn play-button-box bg-primary"
      @click="play(podcast)"
    >
      <PlayIcon class="text-light" :title="$t('Play')" />
    </button>
    <button v-else class="btn play-button-box bg-primary" @click="pause()">
      <PauseIcon class="text-light" :title="$t('Pause')" />
    </button>
    <div class="d-flex align-items-center podcast-play-bar flex-grow-1">
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
  </div>
</template>

<script lang="ts">
import PlayIcon from "vue-material-design-icons/Play.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import ProgressBar from "../../misc/ProgressBar.vue";
import DurationHelper from "../../../helper/durationHelper";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import { defineComponent } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
export default defineComponent({
  name: "PodcastPlayBar",
  components: {
    ProgressBar,
    PlayIcon,
    PauseIcon
  },
  props: {
    podcast: { default: () => ({}), type: Object as () => Podcast },
    displayButonPlay:{ default: false, type: Boolean },
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerElapsed",
      "playerTotal",
      "playerStatus"
    ]),
    percentProgress(): number {
      if (this.podcast?.podcastId !== this.playerPodcast?.podcastId) {
        return 0;
      }
      return !this.playerElapsed ? 0 : this.playerElapsed * 100;
    },
    playedTime(): string {
      if (this.podcast?.podcastId === this.playerPodcast?.podcastId) {
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
      return DurationHelper.formatDuration(Math.round(this.podcast.duration / 1000));
    },
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerPlay", "playerChangeStatus"]),
    ...mapActions(usePlayerStore, ["playerUpdateSeekTime"]),
    play(podcast: Podcast): void {
      if (podcast === this.playerPodcast) {
        this.playerChangeStatus(false);
      } else {
        this.playerPlay(podcast);
      }
    },
    pause(): void {
      this.playerChangeStatus(true);
    },
    seekTo(event: MouseEvent): void {
      if (
        !this.playerPodcast ||
        this.podcast?.podcastId !== this.playerPodcast.podcastId
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
<style lang="scss">
@use "../../../style/playButton";
</style>