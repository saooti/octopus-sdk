import { Podcast } from '@/store/class/general/podcast';
import DurationHelper from '../../../helper/duration';
import { state } from '../../../store/paramStore';
import { defineComponent } from 'vue';
import { RouteLocationRaw } from 'vue-router';
export const playerDisplay = defineComponent({
	props: {
    hlsReady: { default: false , type: Boolean},
  },
	computed:{
		playedTime(): string{
      if (this.$store.state.player.elapsed && this.$store.state.player.elapsed > 0 && this.$store.state.player.total && this.$store.state.player.total > 0) {
        return DurationHelper.formatDuration(
          Math.round(this.$store.state.player.elapsed * this.$store.state.player.total)
        );
      }
      return '--:--';
    },
		totalTime(): string {
      if (this.$store.state.player.elapsed && this.$store.state.player.elapsed > 0 && this.$store.state.player.total && this.$store.state.player.total > 0)
        return DurationHelper.formatDuration(Math.round(this.$store.state.player.total));
      return '--:--';
    },
		isPlaying(): boolean {
			return 'PLAYING' === this.$store.state.player.status;
		},
		isPaused(): boolean {
			return 'PAUSED' === this.$store.state.player.status;
		},
		podcast(): undefined|Podcast{
			return this.$store.state.player.podcast;
		},
		isImage(): boolean {
			return (state.player.image as boolean);
		},
		podcastImage(): string{
			if (this.$store.state.player.podcast) return this.$store.state.player.podcast.imageUrl;
			return '';
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
		isEmissionName(): boolean {
      return (state.player.emissionName as boolean);
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
    transcriptText():string{
      return this.$store.state.player.transcript?.actualText ?? "";
    }
	},
	created(){
    window.addEventListener('keydown', this.addKeyboardControl);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.addKeyboardControl);
  },

  methods: {
    addKeyboardControl(event: KeyboardEvent): void{
      if(!event || null ===event){return;}
      const element = event.target as HTMLElement; 
      if (!element || 'INPUT' == element.tagName.toUpperCase() || 'TEXTAREA' == element.tagName.toUpperCase()){return;}
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
    onPlay(): void {
      this.$store.commit('player/pause', false);
    },
    onPause(): void {
      this.$store.commit('player/pause', true);
    },
	}
});