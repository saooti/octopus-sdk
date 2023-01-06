import { Podcast } from '@/store/class/general/podcast';
import DurationHelper from '../../../helper/duration';
import { state } from '../../../store/paramStore';
import { defineComponent } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { MetadataRadio, Radio } from '@/store/class/general/player';
import octopusApi from '@saooti/octopus-api';
export const playerDisplay = defineComponent({
	props: {
    hlsReady: { default: false , type: Boolean},
  },
  data() {
    return {
      radioInterval: undefined as  ReturnType<typeof setTimeout>|undefined,
    };
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
      if(this.$store.state.player.radio){
        return this.$store.state.player.radio.metadata.title + " " + this.$store.state.player.radio.metadata.artist;
      }
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
    },
    radio(): Radio{
      return this.$store.state.player.radio?.url;
    }
	},
  watch:{
    radio: {
      deep: true,
      immediate:true,
      handler(){
        clearInterval((this.radioInterval as unknown as number));
        if(this.radio){
          this.fetchRadioMetadata();
          this.radioInterval = setInterval(() => {
            this.fetchRadioMetadata();
          }, 2000);
        }
      }
    },
  },
	created(){
    window.addEventListener('keydown', this.addKeyboardControl);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.addKeyboardControl);
    clearInterval((this.radioInterval as unknown as number));
  },
  methods: {
    async fetchRadioMetadata(): Promise<void>{
      const metadata = await octopusApi.fetchData<MetadataRadio>(14, 'player/playing/'+this.$store.state.player.radio.canalId);
      this.$store.commit('player/radioMetadata', metadata.currently);
    },
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