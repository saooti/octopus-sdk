import { computed } from "vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useVastStore } from "../../../stores/VastStore";
import DurationHelper from "../../../helper/durationHelper";
export const usePlayerDisplayTime = ()=>{

  const playerStore = usePlayerStore();
  const vastStore = useVastStore();

  const displayPlayTime = computed(() => { 
    if(vastStore.isAdPlaying){
      return DurationHelper.formatDuration(Math.round(vastStore.currentTimeAd));
    }
    return playerStore.playedTime;
  });

  const displayTotalTime = computed(() => { 
    if(vastStore.isAdPlaying){
      return DurationHelper.formatDuration(Math.round(vastStore.currentDurationAd));
    }
    return playerStore.totalTime;
  });

  const transcriptText = computed(() => { 
    return playerStore.transcriptText;
  });

  return {
    displayPlayTime,
    displayTotalTime,
    transcriptText,
    radioUrl: playerStore.radioUrl,
    isAdPlaying: vastStore.isAdPlaying,
  }
}
