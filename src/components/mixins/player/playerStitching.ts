import { defineComponent } from "vue";
import octopusApi from "@saooti/octopus-api";
import dayjs from "dayjs";
import { playerVast } from "./playerVast";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
import { useVastStore } from "@/stores/VastStore";
import { mapState, mapActions } from "pinia";
import { AdserverOtherEmission } from "@/stores/class/adserver/adserverOtherEmission";
import { AdserverTiming } from "@/stores/class/adserver/adserverTiming";
import { AdPosition } from "@/stores/class/adserver/adPosition";
import fetchParameters from "../fetchParameters";

export const playerStitching = defineComponent({
  mixins:[playerVast,fetchParameters],
  data() {
    return {
      radioInterval: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },
  computed: {
    ...mapState(useVastStore, ["adPositionsPodcasts", "adPositionIndex", "useVastPlayerPodcast"]),
    ...mapState(usePlayerStore, ["playerElapsedSeconds", "playerRadio", "playerPodcast"]),
    radioNextAdvertisingStartDate(){
      return this.playerRadio?.nextAdvertising?.startDate;
    }
  },
  watch:{
    playerCurrentChange(): void {
      if(this.playerCurrentChange && this.playerCurrentChange > 0 && !this.checkUsePlayerPodcastStitching()){return;}
      this.onPlayerChange();
    },
    //launch advertising for podcast
    playerElapsedSeconds():void{
      if(!this.checkUsePlayerPodcastStitching()){return;}
      if(!this.isAdRequested && this.checkAdNeedToBeLaunch()){
        this.onRequestAd(this.adPositionsPodcasts[this.playerCurrentChange??0][this.adPositionIndex].vastUrl);
        this.updateAdPositionIndex(this.adPositionIndex+1); 
      }
    },
    // launch advertising for radio
    radioNextAdvertisingStartDate: {
      immediate: true,
      handler() {
        if(!this.radioNextAdvertisingStartDate){
          return;
        }
        this.defineRadioInterval();
      },
    },
    
  },
  mounted(){
    this.updateuseVastPlayerPodcast("true"===this.$route.query.vast);
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    ...mapActions(useVastStore, ["updateAdPositionsPodcasts", "updateAdPositionIndex", "updateuseVastPlayerPodcast"]),
    checkUsePlayerPodcastStitching():boolean{
      return this.useVastPlayerPodcast;
    },
    defineRadioInterval(){
      this.clearRadioInterval();
      const timeRemaining = dayjs(this.radioNextAdvertisingStartDate).diff(dayjs(), "millisecond");
      console.log("TimeRemaining "+timeRemaining);
      if(timeRemaining < 0){
        return;
      }
      this.radioInterval = setTimeout(() => {
        this.radioIntervalExecute();
      }, timeRemaining);
    },
    async radioIntervalExecute(){
      //If pause when ad needs to be played then skipped (TO THINK)
      if("PAUSED"===this.playerStatus){return;}
      const vastUrl = await this.getVastUrl(this.playerRadio?.nextAdvertising?.tag ??"5e385e1b51c86");
      console.log("vastUrl "+vastUrl);
      this.onRequestAd(vastUrl);
    },
    clearRadioInterval() {
      clearInterval(this.radioInterval as unknown as number);
      this.radioInterval = undefined;
    },
    checkAdNeedToBeLaunch(){
      if(!this.playerCurrentChange || !this.adPositionsPodcasts[this.playerCurrentChange]?.[this.adPositionIndex]){return false;}
      return this.adPositionsPodcasts[this.playerCurrentChange][this.adPositionIndex]?.seconds <= this.playerElapsedSeconds;
    },
    async onPlayerChange(){
      this.destroyAdManager();
      if(null==this.playerCurrentChange){return;}
      this.prepareIMA();
      await this.fetchPodcastAdConfig();
    },
    async fetchPodcastAdConfig(){
      if(!this.playerCurrentChange || !this.playerPodcast ||(this.playerCurrentChange && this.adPositionsPodcasts[this.playerCurrentChange])){
        return;
      }
      let adserverConfig = await octopusApi.fetchDataPublic<AdserverOtherEmission>(0,`ad/test/podcast/${this.playerCurrentChange}`);
      if(!adserverConfig || "SOUNDCAST_VAST"!==adserverConfig.config?.server){
        this.updateAdPositionsPodcasts(this.playerCurrentChange, []);
        return;
      }
      const podcastDurationSeconds = Math.round((this.playerPodcast?.duration??0) / 1000);
      const allAdPositions =this.generateAllAdPositions(adserverConfig.config.doublets, podcastDurationSeconds);
      const selectedAdPositions = await this.selectCorrectAdPositions(allAdPositions, podcastDurationSeconds, adserverConfig.config.minIntervalDuration, adserverConfig.config.minTailDuration);
      this.updateAdPositionsPodcasts(this.playerCurrentChange, selectedAdPositions);
    },
    generateAllAdPositions(doublets: Array<AdserverTiming>, podcastDuration: number): Array<AdPosition>{
      let adPositions: Array<AdPosition> = [];
      if(doublets.some((element: AdserverTiming)=>{return "TAG_NO_AD"===element.tag})){
        return [];
      }
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
    async selectCorrectAdPositions(allAdPositions: Array<AdPosition>, podcastDuration: number, minIntervalDuration:number, minTailDuration:number): Promise<Array<AdPosition>>{
      let adPositions: Array<AdPosition> = [];
      let previousPosition = -1;
      for(let adPosition of allAdPositions){
        switch (adPosition.policy) {
          case "pre":
            adPositions.push(await this.defineVastUrl(adPosition));
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
            adPositions.push(await this.defineVastUrl(adPosition));
            previousPosition = position;
            break;
          case "post":
            if (previousPosition >= 0 && previousPosition > podcastDuration - minIntervalDuration) {
              //Too close to previous ad
              continue;
            }
            adPositions.push(await this.defineVastUrl(adPosition));
            break;
          default:break;
        }
      }
      return adPositions;
    },

    async defineVastUrl(adPosition: AdPosition): Promise<AdPosition>{
      adPosition.vastUrl = await this.getVastUrl(adPosition.impressId);
      return adPosition;
    },
    async getVastUrl(tag: string): Promise<string>{
      let baseUrl = "https://api.soundcast.io/v1/vast/"+tag;
      let keywords: Array<string> = [];
      if(this.playerPodcast && this.playerPodcast?.tags?.length){
        const attributes = await this.getOrgaAttributes(this.playerPodcast.organisation.id);
        if ("true"===attributes["AD_CONFIG_PODCAST_TAG"]) {
          keywords = this.playerPodcast.tags.map((e) => {
            return "tag:" + e;
          });
        }
      }
      const parameters = this.getUriSearchParams({
        adCount: 1,
        pageUrl:document.referrer,
        keywords:keywords
      });
      return baseUrl + '?' + parameters.toString();
    }
  },
});