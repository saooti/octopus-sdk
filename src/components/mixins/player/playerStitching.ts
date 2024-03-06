import { defineComponent } from "vue";
import octopusApi from "@saooti/octopus-api";
import { playerVast } from "./playerVast";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useVastStore } from "@/stores/VastStore";
import { mapState, mapActions } from "pinia";
import { AdserverOtherEmission } from "@/stores/class/adserver/adserverOtherEmission";
import { AdserverTiming } from "@/stores/class/adserver/adserverTiming";
import { AdPosition } from "@/stores/class/adserver/adPosition";
import { AdserverConfig } from "@/stores/class/adserver/adserverConfig";

export const playerStitching = defineComponent({
  mixins:[playerVast],
  computed: {
    ...mapState(usePlayerStore, ["playerPodcast", "playerStatus","playerCurrentChange","playerVideo"]),
    ...mapState(useVastStore, ["isAdPlaying", "currentAd", "isAdPaused", "isAdSkipped", "vastUrl", "adConfigPodcasts"]),
  },
  watch:{
    playerCurrentChange(): void {
     this.onPlayerChange();
    },
  },
  methods: {
    ...mapActions(useVastStore, ["updateIsAdPlaying", "updateSkippableData", "updateCurrentAd", "updateProgressionData", "restartVastData", "updateAdConfigPodcasts"]),
    ...mapActions(usePlayerStore, ["playerChangeStatus"]),
    async onPlayerChange(){
      this.destroyAdManager();
      //if (("STOPPED" ===this.playerStatus) || !this.vastUrl || this.playerVideo) {return;}
      if(null==this.playerCurrentChange){return;}
      await this.fetchPodcastAdConfig();
      //TODO generateVastUrl
      this.requestAds();
    },
    async fetchPodcastAdConfig(){
      if(!this.playerCurrentChange || (this.playerCurrentChange && this.adConfigPodcasts[this.playerCurrentChange])){
        return;
      }
      let adserverConfig = await octopusApi.fetchDataPublic<AdserverOtherEmission>(0,`ad/test/podcast/${this.playerCurrentChange}`);
      this.updateAdConfigPodcasts(this.playerCurrentChange, adserverConfig);
      this.handleAdConfig();
    },
    handleAdConfig(){
      if(!this.playerCurrentChange || !this.adConfigPodcasts[this.playerCurrentChange] || "SOUNDCAST_VAST"!==this.adConfigPodcasts[this.playerCurrentChange].config.server){ 
        return;
      }
      this.generateAdPositions(this.adConfigPodcasts[this.playerCurrentChange]);
    },
    generateAdPositions(config: AdserverOtherEmission){
      const podcastDurationSeconds = Math.round((this.playerPodcast?.duration??0) / 1000);
      const allAdPositions =this.generateAllAdPositions(config.config.doublets, podcastDurationSeconds);
      console.log(allAdPositions);
      const selectedAdPositions = this.selectCorrectAdPositions(allAdPositions, podcastDurationSeconds, config.config.minIntervalDuration, config.config.minTailDuration);
      console.log(selectedAdPositions);
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
      /* const baseUrl = "https://api.soundcast.io/v1/vast/"+adPosition.impressId;
      const parameters = {
        adCount: 1,
        ip:,
        ua:,
        pageUrl:
      } */

      //Add apiKey (voir ou on stocke) et si on doit faire un service externe du coup (appel au service de l'api qui existe déjà )
      /* .adCount(1)
                    .consent(request.getConsent()).deviceId(request.getListenerId())
                    .ip(request.getIp())
                    .pageUrl(request.getReferrer())
                    .tagId(adPosition.getImpressId())
                    .ua(request.getUserAgent()) */


      //TODO consent
      //TODO API resuqest builder https://gitlab.saooti.net/ouest-france/catalogue/-/blob/dev/api/src/main/java/com/saooti/ouestfrance/api/service/ad/stitching/saooti/RequestBuilder.java?ref_type=heads

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
