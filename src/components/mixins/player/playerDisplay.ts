import { state } from '../../../stores/ParamSdkStore';
import { defineComponent } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import {fetchRadioData} from '../../mixins/radio/fetchRadioData';
import { MediaRadio } from '@/stores/class/general/player';
import { usePlayerStore } from '@/stores/PlayerStore';
import { useFilterStore } from '@/stores/FilterStore';
import { mapState, mapActions } from 'pinia';
import { Podcast } from '@/stores/class/general/podcast';
export const playerDisplay = defineComponent({
	props: {
    hlsReady: { default: false , type: Boolean},
  },
  mixins: [fetchRadioData],
  data() {
    return {
      radioInterval: undefined as  ReturnType<typeof setTimeout>|undefined,
    };
  },
	computed:{
    ...mapState(usePlayerStore, [
      'playerPodcast',
      'playerRadio',
      'playerLive',
      'playerMedia',
      'playedTime',
      'totalTime',
      'isPlaying',
      'isPaused',
      'podcastImage',
      'emissionName',
      'transcriptText',
      'radioUrl'
    ]),
    ...mapState(useFilterStore, ['filterOrgaId']),
		isImage(): boolean {
			return (state.player.image as boolean);
		},
		podcastShareUrl(): RouteLocationRaw|string {
      if(this.playerRadio?.podcast?.podcastId){
        return {
					name: 'podcast',
					params: { podcastId: this.playerRadio?.podcast?.podcastId.toString() },
					query: { productor: this.filterOrgaId },
				};
      }
			if (this.playerPodcast) {
				return {
					name: 'podcast',
					params: { podcastId: this.playerPodcast.podcastId.toString() },
					query: { productor: this.filterOrgaId },
				};
			}
			return '';
		},
		isEmissionName(): boolean {
      return (state.player.emissionName as boolean);
    },
		podcastTitle(): string {
      if(this.playerRadio){
        if(this.playerRadio.podcast){
          return this.playerRadio.podcast.title;
        }
        return this.displayTitle(this.playerRadio.metadata);
      }
      if (this.playerPodcast) {
        if (this.isEmissionName)
          return this.emissionName + ' - ' + this.playerPodcast.title;
        return this.playerPodcast.title;
      }
      if (this.playerMedia) return this.playerMedia.title;
      if (this.playerLive) {
        if (!this.hlsReady)
          return this.playerLive.title + ' (' + this.$t('Start in a while') + ')';
        return this.playerLive.title;
      }
      return '';
    },
	},
  watch:{
    playerRadio: {
      deep: true,
      immediate:true,
      handler(newValue,oldValue){
        if(oldValue && newValue && newValue.canalId === oldValue.canalId){return;}
        clearInterval((this.radioInterval as unknown as number));
        if(this.playerRadio){
          this.fetchCurrentlyPlaying();
          this.radioInterval = setInterval(() => {
            this.fetchCurrentlyPlaying();
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
  },
  methods: {
    ...mapActions(usePlayerStore, ['playerMetadata', 'playerChangeStatus', 'playerRadioPodcast']),
    async fetchCurrentlyPlaying(): Promise<void>{
      this.fetchRadioMetadata(this.playerRadio?.canalId??0,this.playerRadio?.metadata.title??"", this.updateMetadata);
    },
    updateMetadata(metadata: MediaRadio, podcast?:Podcast): void{
      this.playerMetadata(metadata);
      this.playerRadioPodcast(podcast);
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
      this.playerChangeStatus(!audioPlayer.paused);
    },
	}
});