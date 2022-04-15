<template>
  <div
    v-if="!playerError"
    class="progress c-hand"
    @mouseup="seekTo"
  >
    <div
      class="progress-bar bg-light"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + percentLiveProgress + '%'"
    />
    <div
      class="progress-bar primary-bg"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + percentProgress + '%'"
    />
    <div
      v-if="displayAlertBar"
      class="progress-bar progress-bar-duration bg-danger"
      :style="'left: ' + durationLivePosition + '%'"
    />
  </div>
  <CommentPlayer
    v-if="showTimeline"
    :total-time="totalSecondes"
    :comments="comments"
  />
</template>

<script lang="ts">
import { CommentPodcast } from '@/store/class/general/comment';
import { defineComponent, defineAsyncComponent } from 'vue';
const CommentPlayer = defineAsyncComponent(() => import('../../display/comments/CommentPlayer.vue'));
export default defineComponent({
  name: 'PlayerProgressBar',

  components: {
    CommentPlayer,
  },
  props: {
    hlsReady: { default: false, type: Boolean},
    showTimeline: { default: false, type: Boolean},
    comments: { default: ()=>[], type: Array as ()=>Array<CommentPodcast>},
    displayAlertBar: { default: false, type: Boolean},
    percentLiveProgress: { default: 0, type: Number},
    durationLivePosition: { default: 0, type: Number},
    playerError: { default: false, type: Boolean},
    listenTime: { default: 0, type: Number},
  },
  emits: ['updateNotListenTime'],
  
  computed: {
    percentProgress(): number{
      if(!this.$store.state.player.elapsed){return 0;}
      return this.$store.state.player.elapsed * 100;
    },
    totalSecondes(): number{
      return this.$store.state.player.total;
    },
  },

  
  methods: {
    seekTo(event: MouseEvent): void {
      const audioPlayer: HTMLAudioElement|null = document.querySelector('#audio-player');
      if(!audioPlayer || null===event.currentTarget){return;}
      const rect = (event.currentTarget as Element).getBoundingClientRect();
      const barWidth = (event.currentTarget as Element).clientWidth;
      const x = event.clientX - rect.left;
      const percentPosition = x / barWidth;
      if (percentPosition * 100 >= this.percentLiveProgress) return;
      const seekTime = this.$store.state.player.total * percentPosition;
      this.isSeekTo(audioPlayer, seekTime);
    },
    isSeekTo(audioPlayer: HTMLAudioElement, seekTime: number): void {
      if (this.$store.state.player.podcast || this.$store.state.player.live) {
        this.$emit('updateNotListenTime',seekTime - this.listenTime);
      }
      audioPlayer.currentTime = seekTime;
    }
    
  },
})
</script>

<style lang="scss">
.octopus-app{
  .progress {
    height: 4px;
    position: relative;
    @media (max-width: 960px) {
      height: 8px;
    }
  }
  .progress-bar-duration {
    width: 10px;
  }
  .progress-bar {
    height: 4px;
    position: absolute;
    @media (max-width: 960px) {
      height: 8px;
    }
  }
}
</style>