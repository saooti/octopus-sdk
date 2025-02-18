import { usePlayerStore } from "../../../stores/PlayerStore";
import { useVastStore } from "../../../stores/VastStore";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { usePlayerVast } from "./usePlayerVast";
import fetchHelper from "../../../helper/fetchHelper";

import {computed, onMounted, Ref, ref, watch} from 'vue';
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import classicApi from "@/api/classicApi";
import { AdserverOtherEmission } from "@/stores/class/adserver/adserverOtherEmission";
import { AdPosition } from "@/stores/class/adserver/adPosition";
import { AdserverTiming } from "@/stores/class/adserver/adserverTiming";

export const usePlayerStitching = ()=>{

  const { isAdRequested, prepareIMA, onRequestAd,destroyAdManager, contentEndedAdsLoader } = usePlayerVast();

  const radioInterval : Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);

  const route = useRoute()
  const playerStore = usePlayerStore();
  const vastStore = useVastStore();
  const saveFetchStore= useSaveFetchStore();

  const radioNextAdvertisingStartDate = computed(() => { 
    return playerStore.playerRadio?.nextAdvertising?.startDate;
  });


  watch(() => playerStore.playerCurrentChange, () => {
    if(playerStore.playerCurrentChange && playerStore.playerCurrentChange > 0 && !checkUsePlayerPodcastStitching()){return;}
    onPlayerChange();
  });

  //launch advertising for podcast
  watch(() => playerStore.playerElapsedSeconds, () => {
    if(!checkUsePlayerPodcastStitching()){return;}
    if(!isAdRequested.value && checkAdNeedToBeLaunch()){
      onRequestAd(vastStore.adPositionsPodcasts[playerStore.playerCurrentChange??0][vastStore.adPositionIndex].vastUrl);
      vastStore.updateAdPositionIndex(vastStore.adPositionIndex+1); 
    }
  });

  // launch advertising for radio
  watch(radioNextAdvertisingStartDate, () => {
    if(!radioNextAdvertisingStartDate.value){
      return;
    }
    defineRadioInterval();
  }, { immediate: true });


  onMounted(() => {
    vastStore.updateuseVastPlayerPodcast("true"===route.query.vast);
  })

  function checkUsePlayerPodcastStitching():boolean{
    return vastStore.useVastPlayerPodcast;
  }

  function defineRadioInterval(){
    clearRadioInterval();
    const timeRemaining = dayjs(radioNextAdvertisingStartDate.value).diff(dayjs(), "millisecond");
    console.log("TimeRemaining "+timeRemaining);
    if(timeRemaining < 0){
      return;
    }
    radioInterval.value = setTimeout(() => {
      radioIntervalExecute();
    }, timeRemaining);
  }

  async function radioIntervalExecute(){
    //If pause when ad needs to be played then skipped (TO THINK)
    if("PAUSED"===playerStore.playerStatus){return;}
    const vastUrl = await getVastUrl(playerStore.playerRadio?.nextAdvertising?.tag ??"5e385e1b51c86", playerStore.playerRadio?.nextAdvertising?.adCount ?? 1);
    console.log("vastUrl "+vastUrl);
    onRequestAd(vastUrl);
  }

  function clearRadioInterval() {
    clearInterval(radioInterval.value as unknown as number);
    radioInterval.value = undefined;
  }

  function checkAdNeedToBeLaunch(){
    if(!playerStore.playerCurrentChange || !vastStore.adPositionsPodcasts[playerStore.playerCurrentChange]?.[vastStore.adPositionIndex]){return false;}
    return vastStore.adPositionsPodcasts[playerStore.playerCurrentChange][vastStore.adPositionIndex]?.seconds <= playerStore.playerElapsedSeconds;
  }

  async function onPlayerChange(){
    destroyAdManager();
    if(null==playerStore.playerCurrentChange){return;}
    prepareIMA();
    await fetchPodcastAdConfig();
  }

  async function fetchPodcastAdConfig(){
    if(!playerStore.playerCurrentChange || !playerStore.playerPodcast ||(playerStore.playerCurrentChange && vastStore.adPositionsPodcasts[playerStore.playerCurrentChange])){
      return;
    }
    const adserverConfig = await classicApi.fetchData<AdserverOtherEmission>({
      api:0,
      path: `ad/test/podcast/${playerStore.playerCurrentChange}`,
      isNotAuth:true
    });
    if(!adserverConfig || "SOUNDCAST_VAST"!==adserverConfig.config?.server){
      vastStore.updateAdPositionsPodcasts(playerStore.playerCurrentChange, []);
      return;
    }
    const podcastDurationSeconds = Math.round((playerStore.playerPodcast?.duration??0) / 1000);
    const allAdPositions =generateAllAdPositions(adserverConfig.config.doublets, podcastDurationSeconds);
    const selectedAdPositions = await selectCorrectAdPositions(allAdPositions, podcastDurationSeconds, adserverConfig.config.minIntervalDuration, adserverConfig.config.minTailDuration);
    vastStore.updateAdPositionsPodcasts(playerStore.playerCurrentChange, selectedAdPositions);
  }

  function generateAllAdPositions(doublets: Array<AdserverTiming>, podcastDuration: number): Array<AdPosition>{
    const adPositions: Array<AdPosition> = [];
    if(doublets.some((element: AdserverTiming)=>{return "TAG_NO_AD"===element.tag})){
      return [];
    }
    for (const doublet of doublets) {
      if(!doublet.tag){continue;}
      let seconds = 0;
      if("post"===doublet.timing.insertion){
        seconds = podcastDuration;
      }else if("mid"===doublet.timing.insertion){
        const mesure = doublet.timing.mesure ?? 0;
        switch (doublet.timing.unit){
          case "MILLISECOND": seconds = mesure * 1000; break;
          case "MINUTE": seconds = Math.round(mesure / 60); break;
          case "PERCENT": seconds = Math.round((mesure * podcastDuration) / 100); break;
          default: seconds = mesure; break;
        }
      }
      adPositions.push({
        impressId: doublet.tag,
        policy: doublet.timing.insertion,
        seconds: seconds,
        vastUrl: ""
      });
    }
    return adPositions.sort((a: AdPosition, b: AdPosition) => {
      if (a.seconds > b.seconds) {
        return 1;
      }
      return b.seconds > a.seconds ? -1 : 0;
    });
  }

  async function selectCorrectAdPositions(allAdPositions: Array<AdPosition>, podcastDuration: number, minIntervalDuration:number, minTailDuration:number): Promise<Array<AdPosition>>{
    const adPositions: Array<AdPosition> = [];
    let previousPosition = -1;
    for(const adPosition of allAdPositions){
      switch (adPosition.policy) {
        case "pre":
          adPositions.push(await defineVastUrl(adPosition));
          previousPosition = 0;
          break;
        case "mid":
          if (adPosition.seconds > podcastDuration - minTailDuration) {
            //Too close to end
            continue;
          }
          if (previousPosition >= 0 && adPosition.seconds < previousPosition + minIntervalDuration) {
            //Too close to previous ad
            continue;
          }
          adPositions.push(await defineVastUrl(adPosition));
          previousPosition = adPosition.seconds;
          break;
        case "post":
          if (previousPosition >= 0 && previousPosition > podcastDuration - minIntervalDuration) {
            //Too close to previous ad
            continue;
          }
          adPositions.push(await defineVastUrl(adPosition));
          break;
        default:break;
      }
    }
    return adPositions;
  }

  async function defineVastUrl(adPosition: AdPosition): Promise<AdPosition>{
    adPosition.vastUrl = await getVastUrl(adPosition.impressId, 1);
    return adPosition;
  }

  async function getVastUrl(tag: string, adCount: number): Promise<string>{
    const baseUrl = "https://api.soundcast.io/v1/vast/"+tag;
    let keywords: Array<string> = [];
    if(playerStore.playerPodcast?.tags?.length){
      const attributes = await saveFetchStore.getOrgaAttributes(playerStore.playerPodcast.organisation.id);
      if ("true"===attributes["AD_CONFIG_PODCAST_TAG"]) {
        keywords = playerStore.playerPodcast.tags.map((e) => {
          return "tag:" + e;
        });
      }
    }
    const parameters = fetchHelper.getUriSearchParams({
      adCount: adCount ?? 1,
      pageUrl:document.referrer,
      keywords:keywords
    });
    return baseUrl + '?' + parameters.toString();
  }

	return {
    contentEndedAdsLoader
	}
}
