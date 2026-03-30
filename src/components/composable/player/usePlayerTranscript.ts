import { usePlayerStore } from "../../../stores/PlayerStore";
import { useVastStore } from "../../../stores/VastStore";
import classicApi from "../../../api/classicApi";
import { AdserverOtherEmission } from "@/stores/class/adserver/adserverOtherEmission";
import { useTranslation } from "../useTranslation";

export const usePlayerTranscript = ()=>{

  const playerStore = usePlayerStore();
  const vastStore = useVastStore();
  const { getMostRelevantTranslation } = useTranslation();

  async function checkDelaytWithStitching(){
    playerStore.playerUpdateDelayStitching(0);
    if(vastStore.useVastPlayerPodcast){return;}
    const audioPlayer = document.querySelector("#audio-player") as HTMLAudioElement;
    if (!playerStore.playerTranscript || !audioPlayer || !playerStore.playerPodcast ||
      audioPlayer.duration <= playerStore.playerPodcast.duration / 1000 + 5) 
    {
      return;
    }
    const adserverConfig = await classicApi.fetchData<AdserverOtherEmission>({
      api:0,
      path:`ad/test/podcast/${playerStore.playerPodcast.podcastId}`,
      isNotAuth:true
    });
    const doubletsLength = adserverConfig.config.doublets.length;
    if(1=== doubletsLength &&  "pre" === adserverConfig.config.doublets[0].timing.insertion){
      playerStore.playerUpdateDelayStitching( audioPlayer.duration - (playerStore.playerPodcast.duration / 1000));
    }else if(0===doubletsLength || 1=== doubletsLength &&  "post" === adserverConfig.config.doublets[0].timing.insertion){
      return;
    }else{
      playerStore.playerUpdateChaptering();
      playerStore.playerUpdateTranscript();
    }
  }

  async function getTranscription(): Promise<void> {
    if (!playerStore.playerPodcast) {
      playerStore.playerUpdateTranscript();
      return;
    }

    const result = await getMostRelevantTranslation(playerStore.playerPodcast.podcastId);

    const arrayTranscript = parseSrt(result);
    const actualText =
      arrayTranscript?.[0]?.startTime === 0 ? arrayTranscript[0].text : "";
    if(!arrayTranscript){
      return;
    }
    playerStore.playerUpdateTranscript({
      actual: 0,
      actualText: actualText,
      value: arrayTranscript
    });
  }

  function parseSrt(transcript: string) {
    const result = [];
    if (typeof transcript != "string") {
      return;
    }
    if (transcript == null) {
      return;
    }
    const pattern =
    /(\d+)\n([\d:,]+)\s+-{2}>\s+([\d:,]+)\n([\s\S]*?(?=\n{2}|$))/gm;
    transcript = transcript.replace(/\r\n|\r|\n|\t/g, "\n");
    let matches;
    while ((matches = pattern.exec(transcript)) != null) {
      result.push({
        startTime: srtTimeToSeconds(matches[2]),
        endTime: srtTimeToSeconds(matches[3]),
        text: matches[4],
      });
    }
    return result;
  }

  function srtTimeToSeconds(time: string): number {
    const a = time.split(":");
    return +a[0] * 60 * 60 + +a[1] * 60 + +parseFloat(a[2]);
  }

  function onTimeUpdateTranscript(currentTime: number) {
    if(!playerStore.playerTranscript?.value.length){
      return;
    }
    const startTime = (playerStore.playerTranscript.value[playerStore.playerTranscript.actual]?.startTime ?? 0) + playerStore.playerDelayStitching;
    if (startTime <= currentTime) {
      playerStore.playerTranscript.actualText = playerStore.playerTranscript.value[playerStore.playerTranscript?.actual]?.text ??"";
    }
    if (
      (playerStore.playerTranscript.value[playerStore.playerTranscript.actual]?.endTime ??Infinity) + playerStore.playerDelayStitching< currentTime
    ) {
      playerStore.playerTranscript.actual += 1;
      playerStore.playerTranscript.actualText =
        playerStore.playerTranscript?.value[playerStore.playerTranscript.actual]?.text ??
        "";
    }
  }
  
  function onSeekedTranscript(currentTime: number) {
    if (playerStore.playerTranscript) {
      let newActual = 0;
      while (currentTime >(playerStore.playerTranscript.value[newActual]?.endTime ?? Infinity) + playerStore.playerDelayStitching) {
        newActual += 1;
      }
      playerStore.playerTranscript.actual = newActual;
    }
  }


	return {
    checkDelaytWithStitching,
    getTranscription,
    onTimeUpdateTranscript,
    onSeekedTranscript
	}
}
