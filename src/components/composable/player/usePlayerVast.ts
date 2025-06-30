import { usePlayerStore } from "../../../stores/PlayerStore";
import { useVastStore } from "../../../stores/VastStore";
import { loadScript } from "../../../helper/loadScript";
import {nextTick, Ref, ref, watch} from 'vue';
import dayjs from "dayjs";
let adsLoader: google.ima.AdsLoader;
let adsManager:google.ima.AdsManager;
let adDisplayContainer:google.ima.AdDisplayContainer;
let adsRequest: google.ima.AdsRequest;
export const usePlayerVast = ()=>{
  const imaLoaded = ref(false);
  const isContentFinished = ref(false);
  const audioContainer : Ref<HTMLAudioElement|null>= ref(null);
  const isAdRequested = ref(false);
  const statusPlayerWhenLoaded = ref("");
  const dateForSessionId: Ref<string|undefined> = ref(undefined);

  const playerStore = usePlayerStore();
  const vastStore = useVastStore();

  watch(() => vastStore.isAdPaused, () => {onAdChangePlayingStatus();});
  watch(() => vastStore.isAdSkipped, () => {onAdSkipped();});

  function prepareIMA(){
    if(!imaLoaded.value){
      imaLoaded.value = true;
      loadIMA();
    }else{
      initializeIMA();
    }
  }

  function loadIMA(){
    loadScript('//imasdk.googleapis.com/js/sdkloader/ima3.js', true, (isIMALoaded:boolean) => {
      if(isIMALoaded) {
        initializeIMA();
      }
    });
  }

  function initializeIMA(): void {
    console.log("Initialize IMA");
    initializeDisplayContainer();
    if(!adDisplayContainer || !adsLoader){
      return;
    }
  }

  function onRequestAd(vastUrl: string){
    isAdRequested.value = true;
    console.log("Request ad "+vastUrl);
    initializeAdsRequest(vastUrl);
    adsLoader.requestAds(adsRequest);
  }

  function initializeDisplayContainer():void{
    if(adDisplayContainer){return};
    audioContainer.value = (document.getElementById('audio-player') as HTMLAudioElement); 
    if(null===audioContainer.value){return;}
    adDisplayContainer = new google.ima.AdDisplayContainer(document.getElementById('ad-container'), audioContainer.value);
    adDisplayContainer.initialize();
    initializeAdsLoader();
  }

  function initializeAdsLoader():void{
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    adsManager = null;
    adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    );
    adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false
    );
  }

  function initializeAdsRequest(vastUrl: string):void{
    adsRequest = new google.ima.AdsRequest();
    adsRequest.setAdWillAutoPlay(true);
    adsRequest.adTagUrl = vastUrl;
  }

  function onAdsManagerLoaded(adsManagerLoadedEvent: google.ima.AdsManagerLoadedEvent) {
    const adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    adsManager = adsManagerLoadedEvent.getAdsManager(audioContainer.value, adsRenderingSettings);
    startAdManager();
  }

  function startAdManager(){
    console.log("Start manager");
    initAdManagerEvents();
    try {
      adsManager.init(0, 0, google.ima.ViewMode.NORMAL);
      adsManager.start();
    } catch (adError) {
      console.log(adError);
      playerStore.playerChangeStatus(false);
      destroyAdManager();
    }
  }

  function initAdManagerEvents(){
    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,onAdError);
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
    const events = [
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED, google.ima.AdEvent.Type.AD_PROGRESS,
      google.ima.AdEvent.Type.COMPLETE, google.ima.AdEvent.Type.LOADED, 
      google.ima.AdEvent.Type.PAUSED, google.ima.AdEvent.Type.STARTED,
    ];
    for (const index in events) {
      adsManager.addEventListener(events[index], onAdEvent);
    }
  }

  function onAdError(adErrorEvent: google.ima.AdErrorEvent) {
    console.log(adErrorEvent.getError());
    destroyAdManager();
  }

  function destroyAdManager(){
    if(!adsManager){return;}
    console.log("Destroy manager");
    adsManager?.destroy();
    adsManager = null;
    vastStore.restartVastData();
    isContentFinished.value =false;
    isAdRequested.value = false;
  }

  function onAdEvent(adEvent: google.ima.AdEvent) {
    const ad = adEvent.getAd();
    if(ad){
      vastStore.updateCurrentAd(ad);
    }
    switch (adEvent.type) {
      case google.ima.AdEvent.Type.LOADED:
        statusPlayerWhenLoaded.value = playerStore.playerStatus;
        if (!ad.isLinear()) {
          playerStore.playerChangeStatus(false);
          isAdRequested.value = false;
        }
        break;
      case google.ima.AdEvent.Type.STARTED:
        console.log("Launched status : "+statusPlayerWhenLoaded.value);
        if("PLAYING"!==statusPlayerWhenLoaded.value){
          vastStore.updateIsAdPaused(true);
          adsManager.pause();
        }
        break;
      case google.ima.AdEvent.Type.AD_PROGRESS:{
        isAdRequested.value = false;
        const adProgressData = adEvent.getAdData();
        vastStore.updateProgressionData(adProgressData.duration,adProgressData.currentTime);
        vastStore.updateSkippableData(
          vastStore.currentAd.getSkipTimeOffset()!== -1,
          adsManager.getAdSkippableState(),
          Math.ceil(vastStore.currentAd.getSkipTimeOffset() - adProgressData.currentTime));
        break;
      }
    }
  }

  function onContentPauseRequested() {
    vastStore.updateIsAdPlaying(true);
    playerStore.playerChangeStatus(true);
  }

  function onContentResumeRequested() {
    if (!isContentFinished.value) {
      playerStore.playerChangeStatus(false);
    }
    nextTick(() => {
      vastStore.updateIsAdPlaying(false);
      vastStore.updateResetSessionId(false);
    });
  }

  function contentEndedAdsLoader():void{
    if (vastStore.isAdPlaying) return;
    isContentFinished.value = true;
    adsLoader?.contentComplete();
  }

  function onAdChangePlayingStatus(){
    if(!adsManager){return;}
    if(vastStore.isAdPaused){
      adsManager.pause();
      dateForSessionId.value = dayjs().toISOString();
    }else{
      adsManager.resume();
      if(!vastStore.resetSessionId &&dayjs().diff(dayjs(dateForSessionId.value), 'm')>1){
        vastStore.updateResetSessionId(true);
      }
    }
  }

  function onAdSkipped(){
    if(vastStore.isAdSkipped){
      adsManager.skip();
    }
  }


	return {
    isAdRequested,
    prepareIMA,
    onRequestAd,
    destroyAdManager,
    contentEndedAdsLoader
	}
}
