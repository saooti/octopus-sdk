<template>
  <router-link
    v-if="isImage && podcastImage"
    :to="podcastShareUrl"
  >
    <img
      :src="podcastImage"
      :alt="$t('Podcast image')"
      class="player-image c-hand"
    >
  </router-link>
  <div
    v-if="!playerError"
    class="play-button-box"
    :class="{
      'primary-bg': !isLoading,
      'text-light': !isLoading,
    }"
    @click="switchPausePlay"
  >
    <div
      class="text-light"
      :aria-label="$t('Play')"
      :class="{
        saooti: isPlaying || isPaused,
        'saooti-play2-bounty': isPaused,
        'saooti-pause-bounty': isPlaying,
        loading: isLoading,
      }"
    />
  </div>
  <div
    v-if="(isPlaying || isPaused) && (media || isStop)"
    class="play-button-box primary-bg text-light"
    @click="stopPlayer"
  >
    <div
      class="text-light saooti-stop-bounty"
      :aria-label="$t('Stop')"
    />
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import { defineComponent } from 'vue';
import { Media } from '@/store/class/media';
import { Podcast } from '@/store/class/podcast';
import { RouteLocationRaw } from 'vue-router';
export default defineComponent({
  name: 'PlayerButtons',

  props: {
    playerError: { default: false, type: Boolean},
  },

  data() {
    return {
    };
  },

  computed: {
    isPlaying(): boolean {
      return 'PLAYING' === this.$store.state.player.status;
    },
    isPaused(): boolean {
      return 'PAUSED' === this.$store.state.player.status;
    },
    isLoading(): boolean {
      return 'LOADING' === this.$store.state.player.status;
    },
    isImage(): boolean {
      return (state.player.image as boolean);
    },
    podcastImage(): string{
      if (this.$store.state.player.podcast) return this.$store.state.player.podcast.imageUrl;
      return '';
    },
    isStop(): boolean{
      return this.$store.state.player.stop;
    },
    media(): undefined|Media{
      return this.$store.state.player.media;
    },
    podcast(): undefined|Podcast{
      return this.$store.state.player.podcast;
    },

    podcastShareUrl(): RouteLocationRaw|string {
      if (this.podcast) {
        return {
          name: 'podcast',
          params: { podcastId: this.podcast.podcastId.toString() },
          query: { productor: this.$store.state.filter.organisationId },
        };
      }
      return '';
    },
  },
  created(){
    window.addEventListener('keydown', this.addKeyboardControl);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.addKeyboardControl);
  },

  methods: {
    addKeyboardControl(event: KeyboardEvent): void{
      if (' ' === event.key || 'Spacebar' === event.key) {
        event.preventDefault();
        this.switchPausePlay();
			}else if ('ArrowRight' === event.key && event.ctrlKey) {
        const audioPlayer: HTMLAudioElement|null = document.querySelector('#audio-player');
        if(!audioPlayer){return;}
        audioPlayer.currentTime += 15;
			}else if ('ArrowLeft' === event.key && event.ctrlKey) {
        const audioPlayer: HTMLAudioElement|null = document.querySelector('#audio-player');
        if(!audioPlayer){return;}
        audioPlayer.currentTime -=15;
			}
    },
    switchPausePlay(): void {
      const audioPlayer: HTMLAudioElement|null = document.querySelector('#audio-player');
      if(!audioPlayer){return;}
      if (audioPlayer.paused) {
        this.onPlay();
      } else {
        this.onPause();
      }
    },
    stopPlayer(): void {
      this.$store.commit('playerPlayPodcast');
    },
    
    onPlay(): void {
      this.$store.commit('playerPause', false);
    },
    onPause(): void {
      this.$store.commit('playerPause', true);
    },
  },
})
</script>

<style lang="scss">
.play-button-box {
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.5rem;
  border-radius: 50%;
  font-size: 1.2rem;
  flex-shrink: 0;
  cursor: pointer;
}

.player-container {
  .player-image {
    border-radius: 0.2rem;
    height: 2.4rem;
    width: 2.4rem;
  }

}
/** PHONES*/
@media (max-width: 450px) {
  .player-container {
    .player-image {
      height: 2rem;
      width: 2rem;
    }
  }
}

</style>