<template>
  <div class="text-light player-grow-content">
    <div class="d-flex">
      <div
        v-if="playerError"
        class="text-warning player-title ms-2 me-2"
      >
        {{ $t('Podcast play error') + ' - ' }}
      </div>
      <div class="flex-grow player-title">
        {{ podcastTitle }}
      </div>
      <div
        v-if="!playerError"
        v-show="!isBarTop"
        class="hide-phone"
      >
        {{ playedTime }} / {{ totalTime }}
      </div>
    </div>
    <div
      v-if="!playerError"
      v-show="!isBarTop"
      class="progress c-hand custom-bg-darkgrey"
      style="height: 3px;"
      @mouseup="seekTo"
    >
      <div
        class="progress-bar custom-bg-grey"
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
import { CommentPodcast } from '@/store/class/comment';
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

  data() {
    return {
    };
  },

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
.player-container {
  .progress {
    align-items: flex-end;
    height: 10px;
    position: relative;
  }
  .progress-bar-duration {
    width: 10px;
  }
  .progress-bar {
    height: 4px;
    position: absolute;
  }

  .progress.custom-bg-darkgrey {
    background: #555;
  }

  .progress-bar.custom-bg-grey {
    background: #e9ecef;
  }

  .player-title,
  .hide-phone {
    font-size: 0.8rem;
    margin: 0 0 5px 0;
  }
  .player-grow-content {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    flex-shrink: 1;
    flex-basis: 20px;
    overflow: hidden;
  }
}
/** PHONES*/
@media (max-width: 960px) {
  .player-container {
    .player-title {
      font-size: 12px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>