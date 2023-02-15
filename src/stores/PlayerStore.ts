import DurationHelper from '../helper/duration';
import { Media } from '@/stores/class/general/media';
import { MediaRadio, Radio } from '@/stores/class/general/player';
import { Podcast } from '@/stores/class/general/podcast';
import { defineStore } from 'pinia';
interface Transcript{
	actual: number, 
	actualText:string,
	value : Array<{endTime: number, startTime:number, text: string}>
}
interface PlayerState{
	playerStatus: string; //STOPPED, LOADING, PLAYING, PAUSED
	playerPodcast: Podcast|undefined;
	playerVolume?: number; //From 0 to 1
	playerElapsed: number; //From 0 to 1
	playerTotal: number;
	playerMedia: Media|undefined;
	playerLive: Podcast|undefined;
	playerRadio: Radio|undefined; 
	playerStop?: boolean;
	playerSeekTime?: number;
	playerTranscript?:Transcript;
}
export const usePlayerStore = defineStore('PlayerStore', {
  state: (): PlayerState => ({
    playerStatus: 'STOPPED',
    playerPodcast: undefined,
    playerVolume: 1,
    playerElapsed: 0,
    playerTotal: 0,
    playerMedia: undefined,
    playerLive: undefined,
    playerRadio: undefined,
    playerSeekTime:0,
  }),
	getters: {
		playedTime(): string{
      if (this.playerElapsed && this.playerElapsed > 0 && this.playerTotal && this.playerTotal > 0) {
        return DurationHelper.formatDuration(
          Math.round(this.playerElapsed * this.playerTotal)
        );
      }
      return '--:--';
    },
		totalTime(): string {
      if (this.playerElapsed && this.playerElapsed > 0 && this.playerTotal && this.playerTotal > 0)
        return DurationHelper.formatDuration(Math.round(this.playerTotal));
      return '--:--';
    },
		isPlaying(): boolean {
			return 'PLAYING' === this.playerStatus;
		},
		isPaused(): boolean {
			return 'PAUSED' === this.playerStatus;
		},
		podcastImage(): string{
      return this.playerPodcast?.imageUrl ?? "";
		},
		emissionName(): string {
			return this.playerPodcast?.emission?.name ?? "";
    },
		transcriptText():string{
      return this.playerTranscript?.actualText ?? "";
    },
    radioUrl(): string{
      return this.playerRadio?.url ?? "";
    }
  },
  actions: {
    playerPlay(param?: any) {
			if (!param) {
				this.playerStatus = 'STOPPED';
				this.playerPodcast = undefined;
				this.playerMedia = undefined;
				this.playerLive = undefined;
				this.playerRadio = undefined;
				this.playerElapsed = 0;
				return;
			}
			if (
				(this.playerPodcast && this.playerPodcast.podcastId === param.podcastId) ||
				(this.playerMedia && this.playerMedia.mediaId === param.mediaId) ||
				(this.playerLive && this.playerLive.conferenceId === param.conferenceId)
			) {
				//Do nothing
				return;
			}
			this.playerStatus = 'LOADING';
			this.playerPodcast = undefined;
			this.playerMedia = undefined;
			this.playerLive = undefined;
			this.playerRadio = undefined;
			this.playerElapsed = 0;
			if (
				param.conferenceId &&
				(!param.podcastId || param.processingStatus !== 'READY')
			) {
				this.playerLive = param;
			} else if (param.podcastId) {
				this.playerPodcast = param;
			} else if (param.mediaId) {
				this.playerMedia = param;
			}else if(param.canalId){
				this.playerRadio = {...param,...{isInit: false}};
			}
		},

		playerChangeStatus(isPause: boolean) {
			if (isPause) {
				this.playerStatus = 'PAUSED';
			} else {
				this.playerStatus = 'PLAYING';
			}
		},

		playerUpdateSeekTime(seekTime: number){
			this.playerSeekTime = seekTime;
		},

		playerMetadata(metadata: MediaRadio){
			if(!this.playerRadio){return;}
			this.playerRadio.metadata = metadata;
		},

		playerUpdateElapsed(elapsed: number, total:number){
			this.playerElapsed = elapsed;
			this.playerTotal = total;
		},

		playerUpdateTranscript(transcript?:Transcript) {
			this.playerTranscript = transcript;
		},
  }
})