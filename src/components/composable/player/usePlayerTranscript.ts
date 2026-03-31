import { usePlayerStore } from "../../../stores/PlayerStore";
import { useVastStore } from "../../../stores/VastStore";
import classicApi from "../../../api/classicApi";
import { AdserverOtherEmission } from "@/stores/class/adserver/adserverOtherEmission";
import { useTranslation } from "../useTranslation";
import { transcriptionApi } from "../../../api/transcriptionApi";
import { ref } from "vue";

/** Contains the language of the transcript being generated */
const generatingTranscriptLanguage = ref<string|null>(null);

export const usePlayerTranscript = ()=>{

  const playerStore = usePlayerStore();
  const vastStore = useVastStore();
  const { getMostRelevantLanguage } = useTranslation();

  async function checkDelaytWithStitching(){
    playerStore.playerUpdateDelayStitching(0);
    if(vastStore.useVastPlayerPodcast){
      return;
    }

    const audioPlayer = document.querySelector("#audio-player") as HTMLAudioElement;
    if (!playerStore.playerTranscript || !audioPlayer || !playerStore.playerPodcast ||
      audioPlayer.duration <= playerStore.playerPodcast.duration / 1000 + 5) {
      return;
    }

    const adserverConfig = await classicApi.fetchData<AdserverOtherEmission>({
      api:0,
      path:`ad/test/podcast/${playerStore.playerPodcast.podcastId}`,
      isNotAuth:true
    });

    // In case of midroll ads, we can't properly display transcription, so
    // we disable it.
    const hasOtherThanPreOrPost = adserverConfig.config.doublets
      .filter(doublet => !(["pre", "post"].includes(doublet.timing.insertion)))
      .length > 0;
    if (hasOtherThanPreOrPost) {
      console.warn("This episode's ad settings doesn't allow for transcription");
      playerStore.playerUpdateChaptering();
      playerStore.playerUpdateTranscript();
      return;
    }

    // In case of preroll ads, delay start of transcription
    const hasPre = adserverConfig.config.doublets
      .filter(doublet => doublet.timing.insertion === "pre")
      .length > 0;
    if(hasPre) {
      // Since we have the expected time (from playerStore) and effective time
      // (from audioPlayer, which include ads), we just delay by the delta
      playerStore.playerUpdateDelayStitching( audioPlayer.duration - (playerStore.playerPodcast.duration / 1000));
    }
  }

  async function getTranscription(): Promise<void> {
    generatingTranscriptLanguage.value = null;
    if (!playerStore.playerPodcast) {
      playerStore.playerUpdateTranscript();
      return;
    }

    // Retrieve best language for transcription
    const podcastId = playerStore.playerPodcast.podcastId;
    const translationData = await transcriptionApi.getTranslations(podcastId);
    const { ready, available } = await getMostRelevantLanguage(translationData);

    // Retrieve transcription
    const result = await transcriptionApi.getTranslation(podcastId, ready);

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

    if (available !== undefined && ready !== available) {
      generatingTranscriptLanguage.value = available;

      // If there's a better language available, trigger its generation
      const result = await transcriptionApi.getTranslation(podcastId, available, true);

      const arrayTranscript = parseSrt(result);
      const actualText =
        arrayTranscript?.[0]?.startTime === 0 ? arrayTranscript[0].text : "";
      if(!arrayTranscript){
        return;
      }
      playerStore.playerUpdateTranscript({
        actual: playerStore.playerTranscript?.actual,
        actualText: actualText,
        value: arrayTranscript
      });
      generatingTranscriptLanguage.value = null;
    }
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
    onSeekedTranscript,
    generatingTranscriptLanguage
  }
}
