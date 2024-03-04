import { defineStore } from "pinia";

interface VastState {
  currentAd: any;
  isAdPlaying: boolean;
  isAdPaused: boolean;
  isAdSkippable: boolean;
  isAdSkipped: boolean;
  isSkipCurrentlyAllowed: boolean;
  timeTillSkipInSeconds: number;
  currentTimeAd:number;
  currentDurationAd: number;
  vastUrl?: string;
}
function emptyVastState(): VastState{
  return{
    currentAd:undefined,
    isAdPlaying: false,
    isAdPaused: false,
    isAdSkippable: false,
    isAdSkipped: false,
    isSkipCurrentlyAllowed: false,
    timeTillSkipInSeconds: 0,
    currentTimeAd:0,
    currentDurationAd:0,
    vastUrl: "https://pubads.g.doubleclick.net/gampad/ads?iu=/6075/Rahul_AdUnit_Test_1&description_url=[placeholder]&tfcd=0&npa=0&ad_type=audio_video&sz=640x360&ciu_szs=640x360&cust_params=yt_channel_id%3Drtryuyuu&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=",
  }
}

export const useVastStore = defineStore("VastStore", {
  state: (): VastState => (emptyVastState()),
  getters: {
    adPercentProgress():number{
      if (!this.currentTimeAd) {
        return 0;
      }
      return (this.currentTimeAd * 100) / this.currentDurationAd; 
    },
    linkAdvertising():string|undefined{
      if(this.isAdPlaying){
        return this.currentAd?.data?.clickThroughUrl;
      }
      return undefined;
    },
    titleAdvertising():string{
      if(this.isAdPlaying){
        return this.currentAd?.data?.title ? " - "+ this.currentAd.data.title:"";
      }
      return "";
    }
  },
  actions: {
    restartVastData(){
      this.$state = emptyVastState();
    },
    updateCurrentAd(currentAd: any){
      this.currentAd = currentAd;
      this.isAdSkipped = false;
    },
    updateIsAdPlaying(isAdPlaying: boolean){
      this.isAdPlaying = isAdPlaying;
    },
    updateIsAdPaused(isAdPaused: boolean){
      this.isAdPaused = isAdPaused;
    },
    updateIsAdSkipped(isAdSkipped: boolean){
      this.isAdSkipped = isAdSkipped;
    },
    updateProgressionData(currentDurationAd: number, currentTimeAd:number){
      this.currentDurationAd = currentDurationAd;
      this.currentTimeAd = currentTimeAd;
    },
    updateSkippableData(isAdSkippable:boolean, isSkipCurrentlyAllowed:boolean, timeTillSkipInSeconds:number){
      this.isAdSkippable= isAdSkippable;
      this.isSkipCurrentlyAllowed= isSkipCurrentlyAllowed;
      this.timeTillSkipInSeconds= timeTillSkipInSeconds;
    }
  },
});

