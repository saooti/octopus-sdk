<template>
  <div
    v-if="isProgressBar"
    class="d-flex align-items-center podcast-play-bar"
  >
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
import ProgressBar from '../../misc/ProgressBar.vue';
import DurationHelper from '../../../helper/duration';
import displayMethods from '../../mixins/displayMethods';
import { state } from '../../../store/paramStore';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastPlayBar',
  components:{
    ProgressBar
  },
  mixins: [displayMethods],
  props: {
    podcastId: { default: undefined, type: Number},
    duration: { default: 0, type: Number},
  },
  computed: {
    isProgressBar(): boolean{
      return (state.emissionsPage.progressBar as boolean);
    },
    percentProgress(): number{
      if(this.podcastId !== this.$store.state.player.podcast?.podcastId){
        return 0;
      }
      return !this.$store.state.player.elapsed ? 0 : this.$store.state.player.elapsed * 100;
    },
    playedTime(): string{
      if(this.podcastId === this.$store.state.player.podcast?.podcastId){
        if (this.$store.state.player.elapsed && this.$store.state.player.elapsed > 0 && this.$store.state.player.total && this.$store.state.player.total > 0) {
          return DurationHelper.formatDuration(
            Math.round(this.$store.state.player.elapsed * this.$store.state.player.total)
          );
        }
      }
      return '00:00';
    },
    totalTime(): string {
      return DurationHelper.formatDuration(Math.round(this.duration/1000));
    },
  },
  methods: {
    seekTo(event: MouseEvent): void {
      if(!this.$store.state.player.podcast || this.podcastId !== this.$store.state.player.podcast.podcastId){return;}
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