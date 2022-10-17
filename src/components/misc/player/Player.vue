<template>
  <div
    class="w-100 transition-height bg-dark"
    :style="{ height: playerHeight }"
  >
    <div
      class="player-container"
      :style="{ height: playerHeight }"
      @transitionend="onHidden"
    >
      <template v-if="display">
        <audio
          id="audio-player"
          :src="!live? audioUrlToPlay: undefined"
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
  </div>
</template>
<script lang="ts">
import { mapState } from 'vuex';
import { CommentPodcast } from '@/store/class/general/comment';
import { playerLogic } from '../../mixins/player/playerLogic';
import { StoreState } from '@/store/typeAppStore';
import PlayerCompact from '../player/PlayerCompact.vue';
import PlayerLarge from '../player/PlayerLarge.vue';
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
    ...mapState({
      display: (state: StoreState) => 'STOPPED' !== state.player.status,
      playerHeight(state: StoreState) {
        if ('STOPPED' === state.player.status || this.forceHide) return 0;
        if (this.largeVersion) return '27rem';
        if (window.innerWidth > 450 && !this.showTimeline) return '5rem';
        if (window.innerWidth > 450 && this.showTimeline) return '6rem';
        return '3.5rem';
      },
    }),
  },

  watch: {
    playerHeight(): void {
      this.$emit('hide', 0 === this.playerHeight);
    },
  },
  
  methods: {
    onHidden(): void {
      if (this.forceHide) {
        this.$store.commit('playerPlayPodcast');
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
  position: fixed;
  overflow: hidden;
  z-index: 12;
  width: 100%;
  bottom: 0;
  display: flex;
  flex-direction: column;
  transition: height 1s;
  background: #282828 !important;
  font-size: 1rem;

  .player-progress-border {
    height: 10px;
    width: 3px;
    background: black;
  }

  @media (max-width: 960px) {
    .d-flex {
      flex-wrap: nowrap !important;
    }
  }
}
}
</style>