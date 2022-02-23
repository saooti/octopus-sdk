<template>
  <div
    v-if="isProgressBar"
    class="d-flex align-items-center podcast-play-bar"
  >
    <div class="me-2">
      {{ playedTime }}
    </div>
    <div class="position-relative flex-grow-1">
      <div
        class="progress flex-grow-1 c-hand"
        @mouseup="seekTo"
      >
        <div
          class="progress-bar primary-bg"
          role="progressbar"
          aria-valuenow="0"
          aria-valuemin="0"
          aria-valuemax="100"
          :style="'width: ' + percentProgress + '%'"
        />
        <div
          class="progress-bar-cursor"
          :style="'left:' + percentProgress + '%'"
        />
      </div>
    </div>
    <div class="ms-2">
      {{ totalTime }}
    </div>
  </div>
</template>

<script lang="ts">
import { Podcast } from '@/store/class/general/podcast';
import DurationHelper from '../../../helper/duration';
import { displayMethods } from '../../mixins/functions';
import { state } from '../../../store/paramStore';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastPlayBar',
  mixins: [displayMethods],
  props: {
    podcast: { default: ()=>({}), type: Object as ()=>Podcast },
  },
  computed: {
    isProgressBar(): boolean{
      return (state.emissionsPage.progressBar as boolean);
    },
    percentProgress(): number{
      if(!this.$store.state.player.podcast || this.podcast.podcastId !== this.$store.state.player.podcast.podcastId){
        return 0;
      }
      if(!this.$store.state.player.elapsed){return 0;}
      return this.$store.state.player.elapsed * 100;
    },
    playedTime(): string{
      if(this.$store.state.player.podcast && this.podcast.podcastId === this.$store.state.player.podcast.podcastId){
        if (this.$store.state.player.elapsed && this.$store.state.player.elapsed > 0 && this.$store.state.player.total && this.$store.state.player.total > 0) {
          return DurationHelper.formatDuration(
            Math.round(this.$store.state.player.elapsed * this.$store.state.player.total)
          );
        }
      }
      return '00:00';
    },
    totalTime(): string {
      return DurationHelper.formatDuration(Math.round(this.podcast.duration/1000));
    },
  },
  methods: {
    seekTo(event: MouseEvent): void {
      if(!this.$store.state.player.podcast || this.podcast.podcastId !== this.$store.state.player.podcast.podcastId){return;}
      const rect = (event.currentTarget as Element).getBoundingClientRect();
      const barWidth = (event.currentTarget as Element).clientWidth;
      const x = event.clientX - rect.left;
      const percentPosition = x / barWidth;
      if (percentPosition * 100 >= this.percentLiveProgress) return;
      const seekTime = this.$store.state.player.total * percentPosition;
      this.$store.commit("playerSeekTime", seekTime);
    }
  },
})
</script>

<style lang="scss">
.podcast-play-bar {
  .progress{
    height: 6px;
  }
  .progress-bar-cursor{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: black;
    align-self: center;
    position: absolute;
  }
}
</style>