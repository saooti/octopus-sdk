<template>
  <div class="text-light player-grow-content">
    <div class="d-flex mb-1">
      <div
        v-if="playerError"
        class="text-warning mx-2"
      >
        {{ $t('Podcast play error') + ' - ' }}
      </div>
      <div class="flex-grow-1 text-ellipsis">
        {{ podcastTitle }}
      </div>
      <div
        v-if="!playerError && !isBarTop"
        class="hide-phone"
      >
        {{ playedTime }} / {{ totalTime }}
      </div>
    </div>
    <div
      v-if="!playerError"
      v-show="!isBarTop"
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
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import DurationHelper from '../../helper/duration';
import { CommentPodcast } from '@/store/class/general/comment';
import { defineComponent, defineAsyncComponent } from 'vue';
const CommentPlayer = defineAsyncComponent(() => import('../display/comments/CommentPlayer.vue'));
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
    notListenTime: { default: 0, type: Number},
  },
  emits: ['update:notListenTime'],
  
  computed: {
    isEmissionName(): boolean {
      return (state.player.emissionName as boolean);
    },
    isBarTop(): boolean {
      return (state.player.barTop as boolean);
    },
    playedTime(): string{
      if (this.$store.state.player.elapsed && this.$store.state.player.elapsed > 0 && this.$store.state.player.total && this.$store.state.player.total > 0) {
        return DurationHelper.formatDuration(
          Math.round(this.$store.state.player.elapsed * this.$store.state.player.total)
        );
      }
      return '--:--';
    },
    percentProgress(): number{
      if(!this.$store.state.player.elapsed){return 0;}
      return this.$store.state.player.elapsed * 100;
    },
    totalTime(): string {
      if (this.$store.state.player.elapsed && this.$store.state.player.elapsed > 0 && this.$store.state.player.total && this.$store.state.player.total > 0)
        return DurationHelper.formatDuration(Math.round(this.$store.state.player.total));
      return '--:--';
    },
    totalSecondes(): number{
      return this.$store.state.player.total;
    },
    podcastTitle(): string {
      if (this.$store.state.player.podcast) {
        if (this.isEmissionName)
          return this.emissionName + ' - ' + this.$store.state.player.podcast.title;
        return this.$store.state.player.podcast.title;
      }
      if (this.$store.state.player.media) return this.$store.state.player.media.title;
      if (this.$store.state.player.live) {
        if (!this.hlsReady)
          return this.$store.state.player.live.title + ' (' + this.$t('Start in a while') + ')';
        return this.$store.state.player.live.title;
      }
      return '';
    },
    emissionName(): string {
      if (this.$store.state.player.podcast) return this.$store.state.player.podcast.emission.name;
      return '';
    },
  },

  
  methods: {
    seekTo(event: MouseEvent): void {
      const audioPlayer: HTMLAudioElement|null = document.querySelector('#audio-player');
      if(!audioPlayer ||null===event.currentTarget){return;}
      const rect = (event.currentTarget as Element).getBoundingClientRect();
      const barWidth = (event.currentTarget as Element).clientWidth;
      const x = event.clientX - rect.left;
      const percentPosition = x / barWidth;
      if (percentPosition * 100 >= this.percentLiveProgress) return;
      const seekTime = this.$store.state.player.total * percentPosition;
      if (this.$store.state.player.podcast || this.$store.state.player.live) {
        this.$emit('update:notListenTime',seekTime - this.listenTime);
      }
      audioPlayer.currentTime = seekTime;
    }
  },
})
</script>

<style lang="scss">
.player-grow-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  font-size: 0.8rem;
  .progress {
    height: 4px;
    position: relative;
  }
  .progress-bar-duration {
    width: 10px;
  }
  .progress-bar {
    height: 4px;
    position: absolute;
  }
}
</style>