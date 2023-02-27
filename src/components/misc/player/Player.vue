<template>
  <div
    class="player-container"
    :style="{ height: playerHeight }"
    @transitionend="onHidden"
  >
    <template v-if="display">
      <audio
        id="audio-player"
        :src="!playerLive && !playerRadio? audioUrlToPlay: undefined"
        autoplay
        @timeupdate="onTimeUpdate"
        @ended="onFinished"
        @playing="onPlay"
        @durationChange="onTimeUpdate"
        @error="onError"
        @seeked="onSeeked"
      />
      <PlayerCompact
        v-if="!largeVersion"
        v-model:notListenTime="notListenTime"
        :player-error="playerError"
        :hls-ready="hlsReady"
        :comments="comments"
        :display-alert-bar="displayAlertBar"
        :percent-live-progress="percentLiveProgress"
        :duration-live-position="durationLivePosition"
        :listen-time="listenTime"
        @stopPlayer="stopPlayer"
        @changePlayerLargeVersion="largeVersion = true"
      />
      <PlayerLarge
        v-else
        v-model:notListenTime="notListenTime"
        :player-error="playerError"
        :hls-ready="hlsReady"
        :comments="comments"
        :display-alert-bar="displayAlertBar"
        :percent-live-progress="percentLiveProgress"
        :duration-live-position="durationLivePosition"
        :listen-time="listenTime"
        @stopPlayer="stopPlayer"
        @changePlayerLargeVersion="largeVersion = false"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { CommentPodcast } from '@/stores/class/general/comment';
import { playerLogic } from '../../mixins/player/playerLogic';
import PlayerCompact from '../player/PlayerCompact.vue';
import PlayerLarge from '../player/PlayerLarge.vue';
import { usePlayerStore } from '@/stores/PlayerStore';
import { mapState, mapActions } from 'pinia';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'Player',

  components: {
    PlayerCompact,
    PlayerLarge
  },
  mixins:[playerLogic],
  emits: ['hide'],
  data() {
    return {
      forceHide: false as boolean,
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      downloadId: null as string|null,
      playerError: false as boolean,
      listenError: false as boolean,
      percentLiveProgress: 0 as number,
      durationLivePosition: 0 as number,
      displayAlertBar: false as boolean,
      hlsReady: false as boolean,
      comments: [] as Array<CommentPodcast>,
      showTimeline: false as boolean,
      largeVersion: false as boolean,
      audioUrlToPlay: "" as string
    };
  },
  computed: {
    ...mapState(usePlayerStore, ['playerStatus']),
    display(){
      return 'STOPPED' !== this.playerStatus;
    },
    playerHeight() {
      if ('STOPPED' === this.playerStatus || this.forceHide) return 0;
      if (this.largeVersion) return '27rem';
      if (window.innerWidth > 450 && !this.showTimeline) return '5rem';
      if (window.innerWidth > 450 && this.showTimeline) return '6rem';
      return '3.5rem';
    },
  },

  watch: {
    playerHeight(): void {
      this.$emit('hide', 0 === this.playerHeight);
    },
  },
  
  methods: {
    ...mapActions(usePlayerStore, ['playerPlay']),
    onHidden(): void {
      if (this.forceHide) {
        this.playerPlay();
        this.forceHide = false;
      }
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
.player-container {
  max-height: 94%;
  position: sticky;
  overflow: hidden;
  z-index: 12;
  width: 100%;
  bottom: 0;
  display: flex;
  flex-direction: column;
  transition: height 1s;
  background: #282828 !important;
  font-size: 1rem;

  @media (max-width: 960px) {
    .d-flex {
      flex-wrap: nowrap !important;
    }
  }
}
}
</style>