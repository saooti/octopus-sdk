import uuidGenerator from "../../../helper/uuidGenerator";
import dayjs from "dayjs";
import { playerLogicProgress} from "./playerLogicProgress";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useApiStore } from "../../../stores/ApiStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { mapState, mapActions } from "pinia";
/* eslint-disable */
let Hls:any = null;
/* eslint-enable */
const maxMinutesSessionId = 1;
import { defineComponent } from "vue";
export const playerLive = defineComponent({
  mixins: [playerLogicProgress],
  data() {
    return {
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      hlsReady: false as boolean,
      downloadId: null as string | null,
      audioElement: null as HTMLAudioElement | null,
      hls: null as any,
      hlsRetryTimeout: undefined as ReturnType<typeof setTimeout> | undefined,
      playPromise: undefined as any,
      errorHls: false as boolean,
    };
  },
  computed: {
    ...mapState(usePlayerStore, ["playerLive", "playerRadio", "playerVideo", "playerStatus"]),
    ...mapState(useAuthStore, ["authOrgaId"]),
    ...mapState(useApiStore, ["hlsUrl"]),
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerChangeStatus"]),
    onPlay(): void {
      this.playerChangeStatus("PAUSED"===this.playerStatus);
    },
    playRadio() {
      if (!this.playerRadio) return;
      this.handleSessionIdRadio();
      this.playHls(this.playerRadio.url+"?origin=octopus&sessionId="+this.playerRadio.sessionId);
    },
    handleSessionIdRadio(){
      if(!this.playerRadio) return;
      if(this.playerRadio.sessionId && dayjs().diff(dayjs(this.playerRadio.dateSessionId), 'm')<maxMinutesSessionId){
        return;
      }
      this.playerRadio.sessionId = uuidGenerator.uuidv4();
    },
    playLive() {
      if (!this.playerLive) return;
      const hlsStreamUrl = `${this.hlsUrl}live/dev.${this.playerLive.conferenceId}/index.m3u8`;
      this.playHls(hlsStreamUrl);
    },
    async playHls(hlsStreamUrl: string): Promise<void> {
      try {
        if(null===this.audioElement){
          this.audioElement = document.getElementById(
            "audio-player",
          ) as HTMLAudioElement;
        }
        if (null === this.audioElement) {
          setTimeout(() => {
            this.playHls(hlsStreamUrl);
          }, 1000);
          return;
        }
        const ua = navigator.userAgent.toLowerCase();
        const isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
        if (
          this.audioElement.canPlayType("application/vnd.apple.mpegurl") &&
          !isAndroid
        ) {
          this.audioElement.src = hlsStreamUrl;
          await this.initLiveDownloadId();
          this.hlsReady = true;
          await this.audioElement.play();
          this.onPlay();
        } else {
          await this.initHls(hlsStreamUrl);
        }
      } catch {
        this.onHlsError(hlsStreamUrl);
      }
    },
    onHlsError(hlsStreamUrl:string){
      if("STOPPED"!==this.playerStatus && undefined===this.hlsRetryTimeout){
        this.hlsRetryTimeout = setTimeout(() => {
          this.errorHls = false;
          this.playHls(hlsStreamUrl);
          this.hlsRetryTimeout = undefined;
        }, 5000);
      }
    },
    async initHls(hlsStreamUrl: string) {
      if (null === Hls) {
        await import("hls.js").then((hlsLibrary) => {
          Hls = hlsLibrary.default;
        });
      }
      if (!Hls.isSupported()) {
        throw new Error("Hls is not supported ! ");
      }
      this.hls = new Hls();
      this.hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        await this.initLiveDownloadId();
        this.hlsReady = true;
        if(true===this.errorHls){
          return;
        }
        this.playPromise = (this.audioElement as HTMLAudioElement).play();
        this.playPromise.then(() =>{
          this.playPromise = undefined;
          this.onPlay();
        }).catch(()=>{
          this.onHlsError(hlsStreamUrl);
          this.playPromise = undefined;
        })
      });
      this.hls.on(Hls.Events.ERROR, async (e, data:any) => {
        this.errorHls = true;
        if(undefined===this.playPromise && data.fatal){
          this.onHlsError(hlsStreamUrl);
        }
      });
      this.hls.loadSource(hlsStreamUrl);
      this.hls.attachMedia(this.audioElement as HTMLAudioElement);
    },
    async endingLive(): Promise<void> {
      clearTimeout(this.hlsRetryTimeout);
      this.hlsRetryTimeout = undefined;
      this.audioElement = null;
      const audio: HTMLElement | null = document.getElementById("audio-player");
      if (audio && this.hls) {
        this.hls.destroy();
        this.hls = null;
      }else{
        (audio as HTMLAudioElement).pause();
      }
      (audio as HTMLAudioElement).src = "";
    },
  },
});
