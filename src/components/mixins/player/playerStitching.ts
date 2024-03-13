import { defineComponent } from "vue";
import octopusApi from "@saooti/octopus-api";
import dayjs from "dayjs";
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
  data() {
    return {
      radioInterval: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },
  computed: {
    ...mapState(useVastStore, ["adPositionsPodcasts", "adPositionIndex", "useVastPlayer"]),
    ...mapState(usePlayerStore, ["playerElapsedSeconds", "playerRadio"]),
    radioNextAdvertisingStartDate(){
      return this.playerRadio?.nextAdvertisingStartDate;
    }
  },
  watch:{
    playerCurrentChange(): void {
      if(!this.checkUsePlayerStitching()){return;}
     this.onPlayerChange();
    },
    //launch advertising for podcast
    playerElapsedSeconds():void{
      if(!this.checkUsePlayerStitching()){return;}
      if(!this.isAdRequested && this.checkAdNeedToBeLaunch()){
        this.onRequestAd(this.adPositionsPodcasts[this.playerCurrentChange??0][this.adPositionIndex].vastUrl);
        this.updateAdPositionIndex(this.adPositionIndex+1); 
      }
    },
    // launch advertising for radio
    radioNextAdvertisingStartDate: {
      immediate: true,
      handler() {
        if(!this.checkUsePlayerStitching()){return;}
        if(!this.radioNextAdvertisingStartDate){
          return;
        }
        this.defineRadioInterval();
      },
    },
    
  },
  mounted(){
    this.updateUseVastPlayer("true"===this.$route.query.vast);
  },
  methods: {
    ...mapActions(useVastStore, ["updateAdPositionsPodcasts", "updateAdPositionIndex", "updateUseVastPlayer"]),
    checkUsePlayerStitching():boolean{
      return this.useVastPlayer;
    },
    defineRadioInterval(){
      //TODO remove tag en dur
      this.clearRadioInterval();
      const timeRemaining = dayjs(this.radioNextAdvertisingStartDate).diff(dayjs(), "millisecond");
      console.log("TimeRemaining "+timeRemaining);
      if(timeRemaining < 0){
        return;
      }
      this.radioInterval = setTimeout(() => {
        this.onRequestAd(this.getVastUrl("5e385e1b51c86"));
      }, timeRemaining);
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
      const selectedAdPositions = this.selectCorrectAdPositions(allAdPositions, podcastDurationSeconds, adserverConfig.config.minIntervalDuration, adserverConfig.config.minTailDuration);
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
      adPosition.vastUrl = this.getVastUrl(adPosition.impressId);
      //const apiHeader = { "Authorization": "e37205128cf4492fa23cd46e9806fe3d"}; //TODO need to hide ? 
      return adPosition;
    },
    getVastUrl(tag: string): string{
      let baseUrl = "https://api.soundcast.io/v1/vast/"+tag;
      const parameters = this.getUriSearchParams({
        adCount: 1,
        ua:navigator.userAgent,
        pageUrl:document.referrer
      });
      return baseUrl + '?' + parameters.toString();
    }
  },
});