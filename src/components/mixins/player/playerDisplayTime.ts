
import { defineComponent } from "vue";
import DurationHelper from "../../../helper/duration";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useVastStore } from "@/stores/VastStore";
import { mapState } from "pinia";
export const playerDisplayTime = defineComponent({

  computed: {
    ...mapState(usePlayerStore, [
      "playedTime",
      "totalTime",
      "transcriptText",
      "radioUrl",
    ]),
    ...mapState(useVastStore, ["isAdPlaying", "currentAd","currentTimeAd", "currentDurationAd", "isAdPaused", "titleAdvertising"]),
    displayPlayTime():string{
      if(this.isAdPlaying){
        return DurationHelper.formatDuration(Math.round(this.currentTimeAd));
        
      }
      return this.playedTime;
    },
    displayTotalTime():string{
      if(this.isAdPlaying){
        return DurationHelper.formatDuration(Math.round(this.currentDurationAd));
        
      }
      return this.totalTime;
    },
    
  },
 
 
});
