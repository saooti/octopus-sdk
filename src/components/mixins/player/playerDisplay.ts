import { state } from '../../../stores/ParamSdkStore';
import { defineComponent } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { MetadataRadio } from '@/stores/class/general/player';
import { usePlayerStore } from '@/stores/PlayerStore';
import { useFilterStore } from '@/stores/FilterStore';
import { mapState, mapActions } from 'pinia';
import octopusApi from '@saooti/octopus-api';
import dayjs from 'dayjs';
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
        return this.playerRadio.metadata.title + " " + this.playerRadio.metadata.artist;
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
      handler(){
        clearInterval((this.radioInterval as unknown as number));
        if(this.playerRadio){
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
    ...mapActions(usePlayerStore, ['playerMetadata', 'playerChangeStatus']),
    async fetchRadioMetadata(): Promise<void>{
      const metadata = await octopusApi.fetchData<MetadataRadio>(14, 'player/playing/'+this.playerRadio?.canalId);
      const arrayMetadata = metadata.previously;
      arrayMetadata.unshift(metadata.currently);
      for(let i = 0; i < arrayMetadata.length; i++){
        if(dayjs().valueOf()-29000 > dayjs(arrayMetadata[i].startDate).valueOf()){
          this.playerMetadata(arrayMetadata[i]);
          return;
        }
      }
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