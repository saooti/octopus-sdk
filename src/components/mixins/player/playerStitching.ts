import { defineComponent } from "vue";
import octopusApi from "@saooti/octopus-api";
import { playerVast } from "./playerVast";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useVastStore } from "@/stores/VastStore";
import { mapState, mapActions } from "pinia";
import { AdserverOtherEmission } from "@/stores/class/adserver/adserverOtherEmission";
import { AdserverTiming } from "@/stores/class/adserver/adserverTiming";
import { AdPosition } from "@/stores/class/adserver/adPosition";
import fetchParameters from "../fetchParameters";

export const playerStitching = defineComponent({
  mixins:[playerVast,fetchParameters],
  computed: {
    ...mapState(useVastStore, ["adPositionsPodcasts", "adPositionIndex"]),
    ...mapState(usePlayerStore, ["playerElapsedSeconds"]),
  },
  watch:{
    playerCurrentChange(): void {
     this.onPlayerChange();
    },
    playerElapsedSeconds():void{
      if(!this.isAdRequested && this.checkAdNeedToBeLaunch()){
        this.onRequestAd(this.adPositionsPodcasts[this.playerCurrentChange??0][this.adPositionIndex].vastUrl);
        this.updateAdPositionIndex(this.adPositionIndex+1); 
      }
    }
  },
  methods: {
    ...mapActions(useVastStore, ["updateAdPositionsPodcasts", "updateAdPositionIndex"]),
    checkAdNeedToBeLaunch(){
      if(!this.playerCurrentChange || !this.adPositionsPodcasts[this.playerCurrentChange]?.[this.adPositionIndex]){return false;}
      console.log(this.adPositionsPodcasts[this.playerCurrentChange][this.adPositionIndex]?.seconds);
      console.log(this.playerElapsedSeconds);
      return this.adPositionsPodcasts[this.playerCurrentChange][this.adPositionIndex]?.seconds <= this.playerElapsedSeconds;
    },
    async onPlayerChange(){
      this.destroyAdManager();
      if(null==this.playerCurrentChange){return;}
      this.prepareIMA();
      await this.fetchPodcastAdConfig();
    },
    async fetchPodcastAdConfig(){
      if(!this.playerCurrentChange || (this.playerCurrentChange && this.adPositionsPodcasts[this.playerCurrentChange])){
        return;
      }
      let adserverConfig = await octopusApi.fetchDataPublic<AdserverOtherEmission>(0,`ad/test/podcast/${this.playerCurrentChange}`);
      const podcastDurationSeconds = Math.round((this.playerPodcast?.duration??0) / 1000);
      const allAdPositions =this.generateAllAdPositions(adserverConfig.config.doublets, podcastDurationSeconds);
      const selectedAdPositions = this.selectCorrectAdPositions(allAdPositions, podcastDurationSeconds, adserverConfig.config.minIntervalDuration, adserverConfig.config.minTailDuration);
      console.log(selectedAdPositions);
      this.updateAdPositionsPodcasts(this.playerCurrentChange, selectedAdPositions);
    },
    generateAllAdPositions(doublets: Array<AdserverTiming>, podcastDuration: number): Array<AdPosition>{
      let adPositions: Array<AdPosition> = [];
      for (let doublet of doublets) {
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
    },
    selectCorrectAdPositions(allAdPositions: Array<AdPosition>, podcastDuration: number, minIntervalDuration:number, minTailDuration:number): Array<AdPosition>{
      let adPositions: Array<AdPosition> = [];
      let previousPosition = -1;
      for(let adPosition of allAdPositions){
        switch (adPosition.policy) {
          case "pre":
            adPositions.push(this.defineVastUrl(adPosition));
            previousPosition = 0;
            break;
          case "mid":
            let position = adPosition.seconds;
            if (position > podcastDuration - minTailDuration) {
              //Too close to end
              continue;
            }
            if (previousPosition >= 0 && position < previousPosition + minIntervalDuration) {
              //Too close to previous ad
              continue;
            }
            adPositions.push(this.defineVastUrl(adPosition));
            previousPosition = position;
            break;
          case "post":
            if (previousPosition >= 0 && previousPosition > podcastDuration - minIntervalDuration) {
              //Too close to previous ad
              continue;
            }
            adPositions.push(this.defineVastUrl(adPosition));
            break;
          default:break;
        }
      }
      return adPositions;
    },

    defineVastUrl(adPosition: AdPosition): AdPosition{
      let baseUrl = "https://api.soundcast.io/v1/vast/"+adPosition.impressId;
      const parameters = this.getUriSearchParams({
        adCount: 1,
        //ip:,
        ua:navigator.userAgent,
        pageUrl:document.referrer
      });
      baseUrl += '?' + parameters.toString();
      adPosition.vastUrl = baseUrl;
      
      //TODO get ip
      //Add apiKey (voir ou on stocke) et si on doit faire un service externe du coup (appel au service de l'api qui existe déjà )
      //TODO API request builder https://gitlab.saooti.net/ouest-france/catalogue/-/blob/dev/api/src/main/java/com/saooti/ouestfrance/api/service/ad/stitching/saooti/RequestBuilder.java?ref_type=heads
      /* var3 = var3
      .queryParamIfPresent("ip", optional(vast.getIp()))
      .queryParamIfPresent("ua", optional(vast.getUa()))
      .queryParamIfPresent("consent", optional(vast.getConsent()))
      .queryParamIfPresent("pageUrl", optional(vast.getPageUrl()))
      .queryParamIfPresent("cookieId", optional(vast.getCookieId()))
      .queryParamIfPresent("deviceId", optional(vast.getDeviceId()))
      .queryParamIfPresent("keywords", keywords(vast.getKeywords()))
      .queryParamIfPresent("adCount", Optional.ofNullable(vast.getAdCount()))
      .queryParamIfPresent("lng", optional(vast.getLng()))
      .queryParamIfPresent("bannedCategories", bannedCategories(vast.getBannedCategories()));
      HttpHeaders var4 = new HttpHeaders();
      var4.add("X-API-KEY", this.config.getApiKey());
      HttpEntity var5 = new HttpEntity((Object)null, var4);*/
      return adPosition;
    }
  },
});
