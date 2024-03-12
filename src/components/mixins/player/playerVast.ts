import { defineComponent } from "vue";
import { loadScript } from "../loadScript";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useVastStore } from "@/stores/VastStore";
import { mapState, mapActions } from "pinia";

let adsLoader: any;
let adsManager:any;
let adDisplayContainer:any;
let adsRequest: any;

export const playerVast = defineComponent({
  mixins:[loadScript],
  data() {
    return {
      imaLoaded: false as boolean,
      isContentFinished: false as boolean,
      audioContainer: null as HTMLAudioElement|null,
      isAdRequested: false as boolean,
      statusPlayerWhenLoaded: "" as string
    };
  },
  computed: {
    ...mapState(usePlayerStore, ["playerPodcast", "playerStatus","playerCurrentChange","playerVideo"]),
    ...mapState(useVastStore, ["isAdPlaying", "currentAd", "isAdPaused", "isAdSkipped", "vastUrl"]),
  },
  watch:{
    isAdPaused(){
      this.onAdChangePlayingStatus();
    },
    isAdSkipped(){
      this.onAdSkipped();
    }
  },
  methods: {
    ...mapActions(useVastStore, ["updateIsAdPlaying","updateIsAdPaused", "updateSkippableData", "updateCurrentAd", "updateProgressionData", "restartVastData"]),
    ...mapActions(usePlayerStore, ["playerChangeStatus"]),
    prepareIMA(){
      if(!this.imaLoaded){
        this.imaLoaded = true;
        this.loadIMA();
      }else{
        this.initializeIMA();
      }
    },
    loadIMA(){
      this.loadScript('//imasdk.googleapis.com/js/sdkloader/ima3.js', true, (isIMALoaded:boolean) => {
        if(isIMALoaded) {
          this.initializeIMA();
        }
      });
    },
    initializeIMA(): void {
      console.log("Initialize IMA");
      this.initializeDisplayContainer();
      if(!adDisplayContainer || !adsLoader){
        return;
      }
    },
    onRequestAd(vastUrl: string){
      this.isAdRequested = true;
      console.log("Request ad "+vastUrl);
      this.initializeAdsRequest(vastUrl);
      adsLoader.requestAds(adsRequest);
    },
    initializeDisplayContainer():void{
      if(adDisplayContainer){return};
      this.audioContainer = (document.getElementById('audio-player') as HTMLAudioElement); 
      if(null===this.audioContainer){return;}
      adDisplayContainer = new google.ima.AdDisplayContainer(document.getElementById('ad-container'), this.audioContainer);
      adDisplayContainer.initialize();
      this.initializeAdsLoader();
    },
    initializeAdsLoader():void{
      adsLoader = new google.ima.AdsLoader(adDisplayContainer);
      adsManager = null;
      adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this.onAdsManagerLoaded,
        false
      );
      adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdError,
        false
      );
    },
    initializeAdsRequest(vastUrl: string):void{
      adsRequest = new google.ima.AdsRequest();
      adsRequest.setAdWillAutoPlay(true);
      adsRequest.adTagUrl = vastUrl;
    },
    onAdsManagerLoaded(adsManagerLoadedEvent: any) {
      const adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
      adsManager = adsManagerLoadedEvent.getAdsManager(this.audioContainer, adsRenderingSettings);
      this.startAdManager();
    },
    startAdManager(){
      console.log("Start manager");
      this.initAdManagerEvents();
      try {
        adsManager.init(0, 0, google.ima.ViewMode.NORMAL);
        adsManager.start();
      } catch (adError) {
        console.log(adError);
        this.playerChangeStatus(false);
        this.destroyAdManager();
      }
    },
    initAdManagerEvents(){
      adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,this.onAdError);
      adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested);
      adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested);
      let events = [
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED, google.ima.AdEvent.Type.AD_PROGRESS,
        google.ima.AdEvent.Type.COMPLETE, google.ima.AdEvent.Type.LOADED, 
        google.ima.AdEvent.Type.PAUSED, google.ima.AdEvent.Type.STARTED,
      ];
      for (let index in events) {
        adsManager.addEventListener(events[index], this.onAdEvent);
      }
      //adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, this.onAdEvent);
    },
    onAdError(adErrorEvent: any) {
      console.log(adErrorEvent.getError());
      this.destroyAdManager();
    },
    destroyAdManager(){
      if(!adsManager){return;}
      console.log("Destroy manager");
      adsManager?.destroy();
      adsManager = null;
      this.restartVastData();
      this.isContentFinished=false;
      this.isAdRequested = false;
    },
    onAdEvent(adEvent: any) {
      const ad = adEvent.getAd();
      if(ad){
        this.updateCurrentAd(ad);
      }
      switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
          this.statusPlayerWhenLoaded= this.playerStatus;
          if (!ad.isLinear()) {
            this.playerChangeStatus(false);
            this.isAdRequested = false;
          }
          break;
        case google.ima.AdEvent.Type.STARTED:
          console.log("Launched status : "+this.statusPlayerWhenLoaded);
          if("PLAYING"!==this.statusPlayerWhenLoaded){
            this.updateIsAdPaused(true);
            adsManager.pause();
          }
          break;
        case google.ima.AdEvent.Type.AD_PROGRESS:
          this.isAdRequested = false;
          const adProgressData = adEvent.getAdData();
          this.updateProgressionData(adProgressData.duration,adProgressData.currentTime);
          this.updateSkippableData(
            this.currentAd.getSkipTimeOffset()!== -1,
            adsManager.getAdSkippableState(),
            Math.ceil(this.currentAd.getSkipTimeOffset() - adProgressData.currentTime));
          break;
      }
    },
    onContentPauseRequested() {
      this.updateIsAdPlaying(true);
      this.playerChangeStatus(true);
    },
    onContentResumeRequested() {
      this.updateIsAdPlaying(false);
      if (!this.isContentFinished) {
        this.playerChangeStatus(false);
      }
    },
    contentEndedAdsLoader():void{
      if (this.isAdPlaying) return;
      this.isContentFinished = true;
      adsLoader.contentComplete();
    },
    onAdChangePlayingStatus(){
      if(!adsManager){return;}
      if(this.isAdPaused){
        adsManager.pause();
      }else{
        adsManager.resume();
      }
    },
    onAdSkipped(){
      if(this.isAdSkipped){
        adsManager.skip();
      }
    }
  },
});
