import { defineStore } from "pinia";
import { AdserverOtherEmission } from "./class/adserver/adserverOtherEmission";
import { AdPosition } from "./class/adserver/adPosition";

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
  adConfigPodcasts: {[key:number]:AdserverOtherEmission}
  adPositionPodcasts: {[key:number]:Array<AdPosition>}
}
//TODO remove vastUrl for dynamic url

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

    
    //TODO soit faire un nouveau store soit gérer le rest mieux !!!!

    vastUrl: "https://pubads.g.doubleclick.net/gampad/ads?iu=/6075/Rahul_AdUnit_Test_1&description_url=[placeholder]&tfcd=0&npa=0&ad_type=audio_video&sz=640x360&ciu_szs=640x360&cust_params=yt_channel_id%3Drtryuyuu&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=",
    adConfigPodcasts:{},
    adPositionPodcasts:{}
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
      const saveAdConfigPodcasts = this.adConfigPodcasts;
      this.$state = emptyVastState();
      this.adConfigPodcasts = saveAdConfigPodcasts;
    },
    updateAdConfigPodcasts(podcastId:number, adConfig: AdserverOtherEmission){
      this.adConfigPodcasts[podcastId] = adConfig;
      console.log(this.adConfigPodcasts);
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

