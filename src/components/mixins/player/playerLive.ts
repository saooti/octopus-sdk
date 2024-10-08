import { state } from "../../../stores/ParamSdkStore";
import uuidGenerator from "../../../helper/uuidGenerator";
import dayjs from "dayjs";
import { playerLogicProgress} from "./playerLogicProgress";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useAuthStore } from "@/stores/AuthStore";
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
    };
  },
  computed: {
    ...mapState(usePlayerStore, ["playerLive", "playerRadio", "playerVideo", "playerStatus"]),
    ...mapState(useAuthStore, ["authOrgaId"]),
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
      const hlsStreamUrl = `${state.podcastPage.hlsUri}live/dev.${this.playerLive.conferenceId}/index.m3u8`;
      this.playHls(hlsStreamUrl);
    },
    async playHls(hlsStreamUrl: string): Promise<void> {
      try {
        this.audioElement = document.getElementById(
          "audio-player",
        ) as HTMLAudioElement;
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
      } catch (error) {
        if("STOPPED"===this.playerStatus){
          return;
        }
        setTimeout(() => {
          this.playHls(hlsStreamUrl);
        }, 1000);
      }
    },
    async initHls(hlsStreamUrl: string): Promise<void> {
      return new Promise<void>(async (resolve, reject) => {
        if (null === Hls) {
          await import("hls.js").then((hlsLibrary) => {
            Hls = hlsLibrary.default;
          });
        }
        if (!Hls.isSupported()) {
          reject(new Error("Hls is not supported ! "));
        }
        this.hls = new Hls();
        this.hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          await this.initLiveDownloadId();
          this.hlsReady = true;
          this.hls.attachMedia(this.audioElement as HTMLAudioElement);
          await (this.audioElement as HTMLAudioElement).play();
          this.onPlay();
          resolve();
        });
        this.hls.on(Hls.Events.ERROR, async (event, data) => {
          reject(new Error("There is an error while reading media content"+data.details));
        });
        this.hls.loadSource(hlsStreamUrl);
      });
    },
    async endingLive(): Promise<void> {
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
