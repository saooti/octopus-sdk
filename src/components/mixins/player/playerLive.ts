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
        await this.initHls(hlsStreamUrl);
      } catch (error) {
        console.log(error);
        setTimeout(() => {
          this.playLive();
        }, 1000);
      }
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
        let hls = new Hls();
        if(this.$store.state.authentication.isAuthenticated && this.$store.state.oAuthParam.accessToken){
          hls = new Hls({xhrSetup:
            (xhr: any) => {
              xhr.setRequestHeader("Authorization", "Bearer " + this.$store.state.oAuthParam.accessToken);
            }
            }
          );
        }
        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          if(!this.live){ return; }
          let downloadId = null;
          try {
            downloadId = await octopusApi.requestLiveDownloadId(
              this.live.livePodcastId
            );
            await octopusApi.markPlayingLive(
              this.live.livePodcastId,
              downloadId,
              'octopus',
              this.$store.state.authentication.organisationId
            );
            this.setDownloadId(downloadId);
          } catch (error) {
            console.log('ERROR downloadId');
          }
          this.hlsReady = true;
          const audio: HTMLElement|null = document.getElementById('audio-player');
          hls.attachMedia((audio as HTMLAudioElement));
          await (audio as HTMLAudioElement).play();
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
        await octopusApi.updatePlayerTime(
          this.downloadId,
          Math.round(this.listenTime)
        );
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
