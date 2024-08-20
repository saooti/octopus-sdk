import octopusApi from "@saooti/octopus-api";
import { CommentPodcast } from "@/stores/class/general/comment";
import cookies from "../cookies";
import { playerLive } from "./playerLive";
import { playerTranscript } from "./playerTranscript";
import { playerStitching } from "./playerStitching";
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import { useGeneralStore } from "@/stores/GeneralStore";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import { FetchParam } from "@/stores/class/general/fetchParam";
import { useVastStore } from "@/stores/VastStore";
import dayjs from "dayjs";
export const playerLogic = defineComponent({
  mixins: [cookies, playerLive, playerTranscript, playerStitching],
  data() {
    return {
      forceHide: false as boolean,
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      downloadId: null as string | null,
      playerError: false as boolean,
      listenError: false as boolean,
      percentLiveProgress: 0 as number,
      durationLivePosition: 0 as number,
      displayAlertBar: false as boolean,
      hlsReady: false as boolean,
      comments: [] as Array<CommentPodcast>,
      showTimeline: false as boolean,
      audioUrlToPlay: "" as string,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authOrgaId", "authParam"]),
    ...mapState(useGeneralStore, ["consentTcf"]),
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerMedia",
      "playerLive",
      "playerRadio",
      "playerVolume",
      "playerStatus",
      "playerSeekTime",
      "playerVideo"
    ]),
    ...mapState(useVastStore, ["useVastPlayerPodcast"]),

    audioUrl(): string {
      return this.getAudioUrl();
    },
  },

  watch: {
    async audioUrl(): Promise<void> {
      this.playerError = false;
      if (
        this.playerMedia ||
        !this.playerPodcast ||
        this.playerVideo ||
        !this.playerPodcast.availability.visibility ||
        this.listenError
      ) {
        this.audioUrlToPlay = this.audioUrl;
        return;
      }
      const response = await octopusApi.fetchDataPublicWithParams<{
        location: string;
        downloadId: number;
      }>(0, "podcast/download/register/"+this.playerPodcast.podcastId + ".mp3", this.getAudioUrlParameters(), {'X-Extra-UA':'Saooti Player'});
      this.setDownloadId(response.downloadId.toString());
      this.audioUrlToPlay = response.location;
    },
    playerPodcast: {
      deep: true,
      handler() {
        this.reInitPlayer();
        this.getTranscription();
      },
    },
    playerLive: {
      deep: true,
      handler() {
        if(this.playerVideo){
          return;
        }
        this.$nextTick(async () => {
          this.hlsReady = false;
          this.reInitPlayer();
          this.playLive();
        });
      },
    },
    playerRadio() {
      this.$nextTick(async () => {
        this.hlsReady = false;
        this.reInitPlayer();
        this.playRadio();
      });
    },
    playerStatus() {
      const audioPlayer: HTMLAudioElement | null =
        document.querySelector("#audio-player");
      if (!audioPlayer) return;
      if (this.playerLive && !this.hlsReady) {
        audioPlayer.pause();
        this.percentLiveProgress = 0;
        this.durationLivePosition = 0;
        return;
      }
      if ("PAUSED" === this.playerStatus && this.playerRadio) {
        this.playerRadio.dateSessionId = dayjs().toISOString();
        this.hlsReady = false;
        this.reInitPlayer();
        this.endingLive();
      } else if ("PAUSED" === this.playerStatus) {
        audioPlayer.pause();
      } else if ("PLAYING" === this.playerStatus && this.playerRadio) {
        if (this.playerRadio.isInit) {
          this.playRadio();
        } else {
          this.playerRadio.isInit = true;
        }
      } else if ("PLAYING" === this.playerStatus) {
        audioPlayer.play();
      }
    },
  },

  methods: {
    ...mapActions(usePlayerStore, ["playerPlay", "playerUpdateElapsed"]),
    getDomain(): string {
      let domain = "";
      const domainArray: RegExpExecArray | null = /\.(.+)/.exec(
        window.location.host,
      );
      if (domainArray && null !== domainArray) {
        domain = domainArray[1];
      }
      return domain;
    },
    getAudioUrlParameters(): FetchParam {
      if (!this.playerPodcast) return {};
      const parameters: FetchParam = {
        origin: "octopus",
        accepted: this.useVastPlayerPodcast
      };
      if (this.authOrgaId) {
        parameters.distributorId = this.authOrgaId;
      }
      if (this.consentTcf) {
        parameters.consent = this.consentTcf;
      }
      if (
        "SECURED" === this.playerPodcast.organisation.privacy &&
        this.authParam.accessToken
      ) {
        parameters.access_token =this.authParam.accessToken;
      }
      return parameters;
    },
    getAudioUrl(): string {
      if (this.playerMedia){
        return this.playerMedia.audioUrl ? this.playerMedia.audioUrl : "";
      }
      if (!this.playerPodcast || this.playerVideo) return "";
      if (
        !this.playerPodcast.availability.visibility ||
        "PROCESSING" === this.playerPodcast.processingStatus
      )
        return this.playerPodcast.audioStorageUrl;
      if (this.listenError) return this.playerPodcast.audioStorageUrl;
      return this.playerPodcast.podcastId + ".mp3?"+this.getAudioUrlParameters().toString();
    },
    reInitPlayer(): void {
      this.setDownloadId(null);
      this.listenError = false;
      this.initComments();
      if (this.playerLive || this.playerRadio) {
        this.endingLive();
      }
    },
    stopPlayer(): void {
      this.playerPlay();
    },
    onError(): void {
      if (
        this.playerPodcast &&
        "" !== this.audioUrlToPlay &&
        !this.listenError
      ) {
        this.listenError = true;
      } else if (
        (this.playerPodcast && "" !== this.audioUrlToPlay) ||
        this.playerMedia
      ) {
        this.playerError = true;
      }
    },
    streamDurationForSafari(mediaTarget: HTMLMediaElement) {
      let streamDuration = mediaTarget.duration;
      if (Infinity === streamDuration) {
        const seekable = mediaTarget.seekable;
        if (seekable) {
          streamDuration = seekable.end(seekable.length - 1);
        } else {
          streamDuration = mediaTarget.currentTime;
        }
      }
      return streamDuration;
    },

    onTimeUpdatePodcast(streamDuration: number, currentTime: number) {
      this.displayAlertBar = false;
      this.percentLiveProgress = 100;
      this.playerUpdateElapsed(currentTime / streamDuration, streamDuration);
      this.onTimeUpdateTranscript(currentTime);
    },
    onTimeUpdateLive(streamDuration: number, currentTime: number) {
      if (!this.playerLive) {
        return;
      }
      const scheduledDuration = this.playerLive.duration / 1000;
      if (scheduledDuration > streamDuration) {
        this.displayAlertBar = false;
        this.percentLiveProgress = (streamDuration / scheduledDuration) * 100;
        this.playerUpdateElapsed(
          currentTime / scheduledDuration,
          scheduledDuration,
        );
      } else {
        this.percentLiveProgress = 100;
        this.displayAlertBar = true;
        this.durationLivePosition = (scheduledDuration / streamDuration) * 100;
        this.playerUpdateElapsed(currentTime / streamDuration, streamDuration);
      }
    },
    onTimeUpdate(event: Event): void {
      if (this.playerRadio) {
        return;
      }
      const mediaTarget = event.currentTarget as HTMLMediaElement;
      if (this.playerPodcast || this.playerLive) {
        this.onTimeUpdateProgress(mediaTarget.currentTime);
      }
      const streamDuration = this.streamDurationForSafari(mediaTarget);
      if (!streamDuration) return;
      if (!mediaTarget.currentTime) return;
      if (!this.playerLive) {
        this.onTimeUpdatePodcast(streamDuration, mediaTarget.currentTime);
        return;
      }
      this.onTimeUpdateLive(streamDuration, mediaTarget.currentTime);
    },
    onSeeked(event: Event): void {
      const mediaTarget = event.currentTarget as HTMLMediaElement;
      const currentTime = mediaTarget.currentTime;
      this.onSeekedTranscript(currentTime);
    },
    onFinished(): void {
      this.setDownloadId(null);
      this.contentEndedAdsLoader();
      if (this.playerLive) {
        this.endingLive();
      }
      this.forceHide = true;
    },
  },
});
