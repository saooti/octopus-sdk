import { mapState } from 'vuex';
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
/* eslint-disable */
let Hls:any = null;
/* eslint-enable */
import { StoreState } from '@/store/typeAppStore';
import { defineComponent } from 'vue';
export const playerLive = defineComponent({
  data() {
    return {
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      hlsReady: false as boolean,
      downloadId: null as string|null,
      audioElement: null as HTMLAudioElement|null
    };
  },
  computed: {
    ...mapState({
      live(state: StoreState) { return state.player.live}
    }),
  },
  methods: {
    onPlay(): void {
      this.$store.commit('playerPause', false);
    },
    async playLive(): Promise<void> {
      if (!this.live) return;
      const hlsStreamUrl =
        state.podcastPage.hlsUri +
        'stream/dev.' +
        this.live.conferenceId +
        '/index.m3u8';
      try {
        this.audioElement = (document.getElementById('audio-player') as HTMLAudioElement);
        if(null===this.audioElement){
          setTimeout(() => {
            this.playLive();
          }, 1000);
          return;
        }
        if (this.audioElement.canPlayType('application/vnd.apple.mpegurl')) {
          this.audioElement.src = hlsStreamUrl;
          await this.initLiveDownloadId();
          await (this.audioElement as HTMLAudioElement).play();
          this.onPlay();
        }else{
          await this.initHls(hlsStreamUrl);
        }
      } catch (error) {
        setTimeout(() => {
          this.playLive();
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
          'distributorId':this.$store.state.authentication.organisationId
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
          //TODO -> Version light min quand ce sera possible
          await import('hls.js/dist/hls.js').then((hlsLibrary) => {
            Hls = hlsLibrary.default;
          })
            await import('hls.js').then((hlsLibrary) => {
            Hls = hlsLibrary.default;
          })
        }
        if (!Hls.isSupported()) {
          reject('Hls is not supported ! ');
        }
        const hls = new Hls();
        /* if(this.$store.state.authentication.isAuthenticated && this.$store.state.oAuthParam.accessToken){
          hls = new Hls({xhrSetup:
            (xhr: XMLHttpRequest) => {
              xhr.setRequestHeader("Authorization", "Bearer " + this.$store.state.oAuthParam.accessToken);
            }
            }
          );
        } */
        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          await this.initLiveDownloadId();
          hls.attachMedia((this.audioElement as HTMLAudioElement));
          await (this.audioElement as HTMLAudioElement).play();
          this.onPlay();
          resolve();
        });
        hls.on(Hls.Events.ERROR, async() => {
          reject('There is an error while reading media content');
        });
        hls.loadSource(hlsStreamUrl);
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
  },
})
