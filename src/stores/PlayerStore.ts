import DurationHelper from "../helper/duration";
import { Media } from "@/stores/class/general/media";
import { MediaRadio, Radio } from "@/stores/class/general/player";
import { Podcast } from "@/stores/class/general/podcast";
import { defineStore } from "pinia";
import { Chaptering, ChapteringPercent } from "./class/chaptering/chaptering";
import octopusApi from "@saooti/octopus-api";
interface Transcript {
  actual: number;
  actualText: string;
  value: Array<{ endTime: number; startTime: number; text: string }>;
}
interface PlayerState {
  playerStatus: string; //STOPPED, LOADING, PLAYING, PAUSED
  playerPodcast: Podcast | undefined;
  playerVolume?: number; //From 0 to 1
  playerElapsed: number; //From 0 to 1
  playerTotal: number;
  playerMedia: Media | undefined;
  playerLive: Podcast | undefined;
  playerRadio: Radio | undefined;
  playerStop?: boolean;
  playerSeekTime?: number;
  playerTranscript?: Transcript;
  playerLargeVersion: boolean;
  playerVideo: boolean;
  playerChaptering?: Chaptering;
}
export const usePlayerStore = defineStore("PlayerStore", {
  state: (): PlayerState => ({
    playerStatus: "STOPPED",
    playerPodcast: undefined,
    playerVolume: 1,
    playerElapsed: 0,
    playerTotal: 0,
    playerMedia: undefined,
    playerLive: undefined,
    playerRadio: undefined,
    playerSeekTime: 0,
    playerLargeVersion: false,
    playerVideo: false,
    playerChaptering: undefined,
  }),
  getters: {
    playerChapteringPercent(): ChapteringPercent|undefined{
      if(!this.playerChaptering || 0===this.playerTotal){
        return;
      }
      const chapteringKeys = Object.keys(this.playerChaptering);
      let chapteringPercent: ChapteringPercent = [];
      for (let i = 0, len = chapteringKeys.length; i < len; i++) {
        chapteringPercent.push({
          startTime : chapteringKeys[i],
          startPercent: (DurationHelper.convertTimestamptoSeconds(chapteringKeys[i]) * 100 ) / (Math.round(this.playerTotal)),
          endPercent:100,
          title: this.playerChaptering[chapteringKeys[i]]
        });
      }
      for (let i = 0, len = chapteringPercent.length; i < len; i++) {
        chapteringPercent[i].endPercent = chapteringPercent[i].startPercent + ((chapteringPercent[i+1]?.startPercent ?? 100) - chapteringPercent[i].startPercent);
      }
      return chapteringPercent;
    },
    playerHeight() {
      if ("STOPPED" === this.playerStatus) return 0;
      if (this.playerVideo) return "0px"/* "281px" */;
      if (this.playerLargeVersion) return "27rem";
      if (window.innerWidth > 450) return "6rem";
      return "3.5rem";
    },
    playedTime(): string {
      if (
        this.playerElapsed &&
        this.playerElapsed > 0 &&
        this.playerTotal &&
        this.playerTotal > 0
      ) {
        return DurationHelper.formatDuration(
          Math.round(this.playerElapsed * this.playerTotal),
        );
      }
      return "--:--";
    },
    totalTime(): string {
      if (
        this.playerElapsed &&
        this.playerElapsed > 0 &&
        this.playerTotal &&
        this.playerTotal > 0
      )
        return DurationHelper.formatDuration(Math.round(this.playerTotal));
      return "--:--";
    },
    isPlaying(): boolean {
      return "PLAYING" === this.playerStatus;
    },
    isPaused(): boolean {
      return "PAUSED" === this.playerStatus;
    },
    podcastImage(): string {
      if (this.playerRadio) {
        return this.playerRadio.podcast?.imageUrl ?? "";
      }
      return this.playerPodcast?.imageUrl ?? "";
    },
    emissionName(): string {
      return this.playerPodcast?.emission?.name ?? "";
    },
    transcriptText(): string {
      return this.playerTranscript?.actualText ?? "";
    },
    radioUrl(): string|undefined {
      return this.playerRadio?.url ?? undefined;
    },
  },
  actions: {
    async playerPlay(param?: any, isVideo = false) {
      if (!param) {
        this.playerStatus = "STOPPED";
        this.playerPodcast = undefined;
        this.playerMedia = undefined;
        this.playerLive = undefined;
        this.playerRadio = undefined;
        this.playerElapsed = 0;
        this.playerVideo = false;
        this.playerChaptering=undefined;
        return;
      }
      if (
        (this.playerPodcast &&
          this.playerPodcast.podcastId === param.podcastId && isVideo === this.playerVideo) ||
        (this.playerMedia && this.playerMedia.mediaId === param.mediaId) ||
        (this.playerLive && this.playerLive.conferenceId === param.conferenceId && isVideo === this.playerVideo)
      ) {
        //Do nothing
        return;
      }
      this.playerStatus = "LOADING";
      this.playerPodcast = undefined;
      this.playerMedia = undefined;
      this.playerLive = undefined;
      this.playerRadio = undefined;
      this.playerVideo = isVideo;
      this.playerElapsed = 0;
      this.playerChaptering=undefined;
      if (
        param.conferenceId &&
        (!param.podcastId || param.processingStatus !== "READY")
      ) {
        this.playerLive = param;
        return;
      }
      if (param.podcastId) {
        this.playerPodcast = param;
        if(param.annotations?.chaptering){
          this.playerChaptering =  await octopusApi.fetchDataPublic<Chaptering>(4, (param.annotations.chaptering as string));
        }
        return;
      }
      if (param.mediaId) {
        this.playerMedia = param;
        return;
      }
      if (param.canalId) {
        this.playerRadio = { ...param, ...{ isInit: false } };
      }
    },

    playerChangeStatus(isPause: boolean) {
      if (isPause) {
        this.playerStatus = "PAUSED";
      } else {
        this.playerStatus = "PLAYING";
      }
    },

    playerUpdateSeekTime(seekTime: number) {
      this.playerSeekTime = seekTime;
    },

    playerMetadata(metadata: MediaRadio, history: Array<MediaRadio>) {
      if (!this.playerRadio) {
        return;
      }
      this.playerRadio.metadata = metadata;
      this.playerRadio.history = history;
    },
    playerRadioPodcast(podcast: Podcast | undefined) {
      if (!this.playerRadio) {
        return;
      }
      this.playerRadio.podcast = podcast;
    },

    playerUpdateElapsed(elapsed: number, total?: number) {
      this.playerElapsed = elapsed;
      if(total){
        this.playerTotal = total;
      }
    },

    playerUpdateTranscript(transcript?: Transcript) {
      this.playerTranscript = transcript;
    },
    playerUpdateLargeVersion(largeVersion: boolean) {
      this.playerLargeVersion = largeVersion;
    },
  },
});
