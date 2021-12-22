<template>
  <router-link
    v-if="isImage && podcastImage"
    :to="podcastShareUrl"
  >
    <img
      :src="podcastImage"
      :alt="$t('Podcast image')"
      class="player-image"
    >
  </router-link>
  <div
    v-if="!playerError"
    class="play-button-box text-light primary-bg"
    @click="switchPausePlay"
  >
    <div
      :aria-label="$t('Play')"
      :class="{
        'saooti-play2-bounty': isPaused,
        'saooti-pause-bounty': isPlaying,
      }"
    />
  </div>
  <div
    v-if="(isPlaying || isPaused) && (media || isStop)"
    class="play-button-box primary-bg text-light"
    @click="stopPlayer"
  >
    <div
      class="saooti-stop-bounty"
      :aria-label="$t('Stop')"
    />
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import { defineComponent } from 'vue';
import { Media } from '@/store/class/general/media';
import { Podcast } from '@/store/class/general/podcast';
import { RouteLocationRaw } from 'vue-router';
export default defineComponent({
  name: 'PlayerButtons',

  props: {
    playerError: { default: false, type: Boolean},
  },

  computed: {
    isPlaying(): boolean {
      return 'PLAYING' === this.$store.state.player.status;
    },
    isPaused(): boolean {
      return 'PAUSED' === this.$store.state.player.status;
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
.player-image {
  border-radius: 0.2rem;
  height: 2.4rem;
  width: 2.4rem;
  cursor: pointer;
  /** PHONES*/
  @media (max-width: 450px) {
    height: 1.8rem;
    width: 1.8rem;
  }
}
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

</style>