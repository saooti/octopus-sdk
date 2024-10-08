import { defineStore } from "pinia";
import { AdPosition } from "./class/adserver/adPosition";

interface VastState {
  currentAd: any;
  isAdPlaying: boolean;
  isAdPaused: boolean;
  isAdSkippable: boolean;
  isAdSkipped: boolean;
  isSkipCurrentlyAllowed: boolean;
  timeTillSkipInSeconds: number;
  currentTimeAd: number;
  currentDurationAd: number;

  useVastPlayerPodcast: boolean;
  adPositionIndex: number;
  adPositionsPodcasts: { [key: number]: Array<AdPosition> };
}

function emptyVastState(): VastState {
  return {
    currentAd: undefined,
    isAdPlaying: false,
    isAdPaused: false,
    isAdSkippable: false,
    isAdSkipped: false,
    isSkipCurrentlyAllowed: false,
    timeTillSkipInSeconds: 0,
    currentTimeAd: 0,
    currentDurationAd: 0,

    useVastPlayerPodcast: false,
    adPositionIndex: 0,
    adPositionsPodcasts: {},
  };
}

export const useVastStore = defineStore("VastStore", {
  state: (): VastState => emptyVastState(),
  getters: {
    adPercentProgress(): number {
      if (!this.currentTimeAd) {
        return 0;
      }
      return (this.currentTimeAd * 100) / this.currentDurationAd;
    },
    linkAdvertising(): string | undefined {
      if (this.isAdPlaying) {
        return this.currentAd?.data?.clickThroughUrl;
      }
      return undefined;
    },
    titleAdvertising(): string {
      if (this.isAdPlaying) {
        return this.currentAd?.data?.title
          ? " - " + this.currentAd.data.title
          : "";
      }
      return "";
    },
  },
  actions: {
    restartVastData() {
      const saveAdPositionsPodcasts = this.adPositionsPodcasts;
      this.$state = emptyVastState();
      this.adPositionsPodcasts = saveAdPositionsPodcasts;
    },
    updateAdPositionIndex(index: number) {
      this.adPositionIndex = index;
    },
    updateAdPositionsPodcasts(
      podcastId: number,
      adPositions: Array<AdPosition>,
    ) {
      this.adPositionsPodcasts[podcastId] = adPositions;
    },
    updateCurrentAd(currentAd: any) {
      this.currentAd = currentAd;
      this.isAdSkipped = false;
    },
    updateIsAdPlaying(isAdPlaying: boolean) {
      this.isAdPlaying = isAdPlaying;
    },
    updateIsAdPaused(isAdPaused: boolean) {
      this.isAdPaused = isAdPaused;
    },
    updateIsAdSkipped(isAdSkipped: boolean) {
      this.isAdSkipped = isAdSkipped;
    },
    updateProgressionData(currentDurationAd: number, currentTimeAd: number) {
      this.currentDurationAd = currentDurationAd;
      this.currentTimeAd = currentTimeAd;
    },
    updateSkippableData(
      isAdSkippable: boolean,
      isSkipCurrentlyAllowed: boolean,
      timeTillSkipInSeconds: number,
    ) {
      this.isAdSkippable = isAdSkippable;
      this.isSkipCurrentlyAllowed = isSkipCurrentlyAllowed;
      this.timeTillSkipInSeconds = timeTillSkipInSeconds;
    },
    updateuseVastPlayerPodcast(useVastPlayerPodcast: boolean) {
      this.useVastPlayerPodcast = useVastPlayerPodcast;
    },
  },
});
