
import { usePlayerLive } from "./usePlayerLive";
import { usePlayerStitching } from "./usePlayerStitching";
import { usePlayerTranscript } from "./usePlayerTranscript";
import { nextTick, Ref, ref, watch } from "vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { useGeneralStore } from "../../../stores/GeneralStore";
import { useVastStore } from "../../../stores/VastStore";
import fetchHelper from "../../../helper/fetchHelper";
import classicApi from "../../../api/classicApi";
import dayjs from "dayjs";
import { FetchParam } from "@/stores/class/general/fetchParam";

export const usePlayerLogic = (forceHide: Ref<boolean, boolean>) => {
  const hlsReady= ref(false);

  const { listenTime, onPlay, setDownloadId, onTimeUpdateProgress, playLive, endingLive, playRadio} = usePlayerLive(hlsReady);
  const { contentEndedAdsLoader } = usePlayerStitching();
  const { getTranscription, onTimeUpdateTranscript, onSeekedTranscript, checkDelaytWithStitching } = usePlayerTranscript();

  const playerError= ref(false);
  const listenError= ref(false);
  const percentLiveProgress= ref(0);
  const durationLivePosition= ref(0);
  const displayAlertBar= ref(false);
  const audioUrlToPlay= ref("");


  const playerStore = usePlayerStore();
  const generalStore = useGeneralStore();
  const vastStore = useVastStore();
  const authStore = useAuthStore();

  watch(()=>getAudioUrl(), async () => {
    playerError.value = false;
    if (
      playerStore.playerMedia ||
      !playerStore.playerPodcast ||
      playerStore.playerVideo ||
      !playerStore.playerPodcast.availability.visibility ||
      listenError.value
    ) {
      audioUrlToPlay.value = getAudioUrl();
      return;
    }
    const response = await classicApi.fetchData<{
      location: string;
      downloadId: number;
    }>({
      api:0,
      path:"podcast/download/register/"+playerStore.playerPodcast.podcastId + ".mp3",
      parameters:getAudioUrlParameters(),
      headers: {'X-Extra-UA':'Saooti Player'},
      isNotAuth:true
    });
    setDownloadId(response.downloadId.toString());
    audioUrlToPlay.value = response.location;
  });

  watch(()=>playerStore.playerPodcast, async () => {
    reInitPlayer();
    getTranscription();
  }, {deep:true});

  watch(()=>playerStore.playerLive, async (_, oldLive) => {
    if(playerStore.playerVideo){
      return;
    }
    nextTick(async () => {
      hlsReady.value = false;
      reInitPlayer(oldLive!==undefined);
      playLive();
    });
  }, {deep:true});

  watch(()=>playerStore.playerRadio, async (_, oldRadio) => {
    nextTick(async () => {
      hlsReady.value = false;
      reInitPlayer(oldRadio !== undefined);
      playRadio();
    });
  });

  watch(()=>playerStore.playerStatus, async () => {
    const audioPlayer: HTMLAudioElement | null =
      document.querySelector("#audio-player");
    if (!audioPlayer) return;
    if (playerStore.playerLive && !hlsReady.value) {
      /* audioPlayer.pause();
      percentLiveProgress.value = 0;
      durationLivePosition.value = 0; */
      return;
    }
    if ("PAUSED" === playerStore.playerStatus && playerStore.playerRadio) {
      playerStore.playerRadio.dateSessionId = dayjs().toISOString();
      hlsReady.value = false;
      reInitPlayer();
      endingLive();
    } else if ("PAUSED" === playerStore.playerStatus) {
      audioPlayer.pause();
    } else if ("PLAYING" === playerStore.playerStatus && playerStore.playerRadio) {
      handlePlayRadio();
    } else if ("PLAYING" === playerStore.playerStatus) {
      audioPlayer.play();
    }
  });

  function handlePlayRadio(){
    if(!playerStore.playerRadio){
      return;
    }
    if (playerStore.playerRadio.isInit) {
      if(vastStore.isAdPlaying && !vastStore.resetSessionId){
        playerStore.playerRadio.dateSessionId = dayjs().toISOString();
      }
      playRadio();
    } else {
      playerStore.playerRadio.isInit = true;
    }
  }

  function getAudioUrlParameters(): FetchParam {
    if (!playerStore.playerPodcast) return {};
    const parameters: FetchParam = {
      origin: "octopus",
      accepted: vastStore.useVastPlayerPodcast
    };
    if (authStore.authOrgaId) {
      parameters.distributorId = authStore.authOrgaId;
    }
    if (generalStore.consentTcf) {
      parameters.consent = generalStore.consentTcf;
    }
    if (
      "SECURED" === playerStore.playerPodcast.organisation.privacy &&
      authStore.authParam.accessToken
    ) {
      parameters.access_token =authStore.authParam.accessToken;
    }
    return parameters;
  }

  function getAudioUrl(): string {
    if (playerStore.playerMedia){
      return playerStore.playerMedia.audioUrl ?? "";
    }
    if (!playerStore.playerPodcast || playerStore.playerVideo) return "";
    if (
      !playerStore.playerPodcast.availability.visibility ||
      "PROCESSING" === playerStore.playerPodcast.processingStatus
    )
      return playerStore.playerPodcast.audioStorageUrl;
    if (listenError.value) return playerStore.playerPodcast.audioStorageUrl;
    return playerStore.playerPodcast.podcastId + ".mp3?"+fetchHelper.getUriSearchParams(getAudioUrlParameters());
  }

  function reInitPlayer(force=false): void {
    setDownloadId(null);
    listenError.value = false;
    if (force || playerStore.playerLive || playerStore.playerRadio) {
      endingLive();
    }
  }

  function stopPlayer(): void {
    playerStore.playerPlay();
  }

  function onError(): void {
    if (
      playerStore.playerPodcast &&
      "" !== audioUrlToPlay.value &&
      !listenError.value
    ) {
      listenError.value = true;
    } else if (
      (playerStore.playerPodcast && "" !== audioUrlToPlay.value) ||
      playerStore.playerMedia
    ) {
      playerError.value = true;
    }
  }

  function streamDurationForSafari(mediaTarget: HTMLMediaElement) {
    let streamDuration = mediaTarget.duration;
    if (Infinity === streamDuration) {
      const seekable = mediaTarget.seekable;
      if (seekable && seekable.length > 0) {
        try {
          streamDuration = seekable.end(seekable.length - 1);
        } catch (e) {
          console.error(e);
        }
      } else {
        streamDuration = mediaTarget.currentTime;
      }
    }
    return streamDuration;
  }

  function onTimeUpdatePodcast(streamDuration: number, currentTime: number) {
    displayAlertBar.value = false;
    percentLiveProgress.value = 0;
    playerStore.playerUpdateElapsed(currentTime / streamDuration, streamDuration);
    onTimeUpdateTranscript(currentTime);
  }

  function onTimeUpdateLive(streamDuration: number, currentTime: number) {
    if (!playerStore.playerLive) {
      return;
    }
    const scheduledDuration = playerStore.playerLive.duration / 1000;
    if (scheduledDuration > streamDuration) {
      displayAlertBar.value = false;
      percentLiveProgress.value = (streamDuration / scheduledDuration) * 100;
      playerStore.playerUpdateElapsed(
        currentTime / scheduledDuration,
        scheduledDuration,
      );
    } else {
      percentLiveProgress.value = 100;
      displayAlertBar.value = true;
      durationLivePosition.value = (scheduledDuration / streamDuration) * 100;
      playerStore.playerUpdateElapsed(currentTime / streamDuration, streamDuration);
    }
  }

  function onTimeUpdate(event: Event): void {
    if (playerStore.playerRadio) {
      return;
    }
    const mediaTarget = event.currentTarget as HTMLMediaElement;
    if (playerStore.playerPodcast || playerStore.playerLive) {
      onTimeUpdateProgress(mediaTarget.currentTime);
    }
    const streamDuration = streamDurationForSafari(mediaTarget);
    if (!streamDuration) return;
    if (!mediaTarget.currentTime) return;
    if (!playerStore.playerLive) {
      onTimeUpdatePodcast(streamDuration, mediaTarget.currentTime);
      return;
    }
    onTimeUpdateLive(streamDuration, mediaTarget.currentTime);
  }

  function onSeeked(event: Event): void {
    const mediaTarget = event.currentTarget as HTMLMediaElement;
    const currentTime = mediaTarget.currentTime;
    onSeekedTranscript(currentTime);
  }

  function onFinished(): void {
    setDownloadId(null);
    contentEndedAdsLoader();
    if (playerStore.playerLive) {
      endingLive();
    }
    forceHide.value = true;
  }


  return {
    audioUrlToPlay,
    listenTime,
    playerError,
    percentLiveProgress,
    durationLivePosition,
    displayAlertBar,
    hlsReady,
    checkDelaytWithStitching,
    stopPlayer,
    onError,
    onTimeUpdate,
    onSeeked,
    onFinished,
    onPlay
  }
}
