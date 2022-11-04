<template>
  <ProgressBar
    v-if="!playerError"
    :main-progress="percentProgress"
    :secondary-progress="percentLiveProgress"
    :alert-bar="displayAlertBar?durationLivePosition:undefined"
    :class="classProgress"
    @mouseup="seekTo"
  />
  <CommentPlayer
    v-if="showTimeline"
    :total-time="totalSecondes"
    :comments="comments"
  />
</template>

<script lang="ts">
import ProgressBar from '../ProgressBar.vue'
import { CommentPodcast } from '@/store/class/general/comment';
import { defineComponent, defineAsyncComponent } from 'vue';
const CommentPlayer = defineAsyncComponent(() => import('../../display/comments/CommentPlayer.vue'));
export default defineComponent({
  name: 'PlayerProgressBar',

  components: {
    CommentPlayer,
    ProgressBar
  },
  props: {
    classProgress:{ default: "", type: String},
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