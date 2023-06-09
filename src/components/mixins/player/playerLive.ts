import { state } from '../../../stores/ParamSdkStore';
import octopusApi from '@saooti/octopus-api';
import { usePlayerStore } from '@/stores/PlayerStore';
import { useAuthStore } from '@/stores/AuthStore';
import { mapState, mapActions } from 'pinia';
/* eslint-disable */
let Hls:any = null;
/* eslint-enable */
import { defineComponent } from 'vue';
export const playerLive = defineComponent({
  data() {
    return {
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      hlsReady: false as boolean,
      downloadId: null as string|null,
      audioElement: null as HTMLAudioElement|null,
      hls: null as any,
    };
  },
  computed: {
    ...mapState(usePlayerStore, ['playerLive', 'playerRadio']),
    ...mapState(useAuthStore, ['authOrgaId'])
  },
  methods: {
    ...mapActions(usePlayerStore, ['playerChangeStatus']),
    onPlay(): void {
      this.playerChangeStatus(false);
    },
    playRadio(){
      if (!this.playerRadio) return;
      this.playHls(this.playerRadio.url);
    },
    playLive() {
      if (!this.playerLive) return;
      const hlsStreamUrl = `${state.podcastPage.hlsUri}live/dev.${this.playerLive.conferenceId}/index.m3u8`;
      this.playHls(hlsStreamUrl);
    },
    async playHls(hlsStreamUrl: string): Promise<void>{
      try {
        this.audioElement = (document.getElementById('audio-player') as HTMLAudioElement);
        if(null===this.audioElement){
          setTimeout(() => {
            this.playHls(hlsStreamUrl);
          }, 1000);
          return;
        }
        const ua = navigator.userAgent.toLowerCase();
        const isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
        if (this.audioElement.canPlayType('application/vnd.apple.mpegurl') && !isAndroid) {
          this.audioElement.src = hlsStreamUrl;
          await this.initLiveDownloadId();
          await this.audioElement.play();
          this.onPlay();
        }else{
          await this.initHls(hlsStreamUrl);
        }
      } catch (error) {
        setTimeout(() => {
          this.playHls(hlsStreamUrl);
        }, 1000);
      }
    },
    async initLiveDownloadId(){
      if(!this.playerLive || this.downloadId){ return;}
      try {
        let downloadId = await octopusApi.putDataPublic<string | null>(0, 'podcast/prepare/live/'+this.playerLive.podcastId, undefined);
        await octopusApi.fetchDataPublicWithParams<string | null>(0,'podcast/download/live/' +this.playerLive.podcastId +".m3u8",{
          'downloadId': null!==downloadId ? downloadId : undefined,
          'origin':'octopus',
          'distributorId':this.authOrgaId
        });
        this.setDownloadId(downloadId);
      } catch (error) {
        this.downloadId = null;
        console.log('ERROR downloadId');
      }
      this.hlsReady = true;
    },
    async initHls(hlsStreamUrl: string): Promise<void> {
      return new Promise<void>(async(resolve, reject) => {
        if(null === Hls){
          await import('hls.js').then((hlsLibrary) => {
            Hls = hlsLibrary.default;
          })
        }
        if (!Hls.isSupported()) {
          reject('Hls is not supported ! ');
        }
        this.hls = new Hls();
        this.hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          await this.initLiveDownloadId();
          this.hls.attachMedia((this.audioElement as HTMLAudioElement));
          await (this.audioElement as HTMLAudioElement).play();
          this.onPlay();
          resolve();
        });
        this.hls.on(Hls.Events.ERROR, async() => {
          reject('There is an error while reading media content');
        });
        this.hls.loadSource(hlsStreamUrl);
      });
    },
    setDownloadId(newValue: string|null): void {
      this.endListeningProgress();
      this.downloadId = newValue;
    },
    async endListeningProgress(): Promise<void> {
      if (!this.downloadId) return;
      try {
        await octopusApi.putDataPublic(0, 'podcast/listen/' + this.downloadId + '?seconds=' +  Math.round(this.listenTime), undefined);
      } catch{
        //Do nothing
      }
      this.downloadId = null;
      this.notListenTime = 0;
      this.lastSend = 0;
      this.listenTime = 0;
    },
    endingLive():void{
      const audio: HTMLElement|null = document.getElementById('audio-player');
      if(audio && this.hls){
        this.hls.destroy();
        (audio as HTMLAudioElement).src = '';
        this.hls = null;
      }
    }
  },
})
