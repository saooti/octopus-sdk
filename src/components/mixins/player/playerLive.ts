import { mapState } from 'vuex';
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
/* eslint-disable */
let Hls:any = null;
/* eslint-enable */
import { defineComponent } from 'vue';
import { Player } from '@/store/class/general/player';
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
    ...mapState('player',{
      live(state: Player) { return state.live}
    }),
  },
  methods: {
    onPlay(): void {
      this.$store.commit('player/pause', false);
    },
    playRadio(){
      if (!this.radio) return;
      this.playHls(this.radio.url);
    },
    playLive() {
      if (!this.live) return;
      const hlsStreamUrl = `${state.podcastPage.hlsUri}stream/dev.${this.live.conferenceId}/index.m3u8`;
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
        if (this.audioElement.canPlayType('application/vnd.apple.mpegurl')) {
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
      if(!this.live){ return;}
      let downloadId = null;
      try {
        downloadId = await octopusApi.putDataPublic<string | null>(0, 'podcast/prepare/live/'+this.live.livePodcastId, undefined);
        await octopusApi.fetchDataPublicWithParams<string | null>(0,'podcast/download/live/' + this.live.livePodcastId+".m3u8",{
          'downloadId': null!==downloadId ? downloadId : undefined,
          'origin':'octopus',
          'distributorId':this.$store.state.auth?.organisationId
        });
        this.setDownloadId(downloadId);
      } catch (error) {
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
