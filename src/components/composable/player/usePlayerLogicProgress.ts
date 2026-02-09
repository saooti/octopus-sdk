import { usePlayerStore } from "../../../stores/PlayerStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { computed, onMounted, Ref, ref, watch} from 'vue';
import classicApi from "../../../api/classicApi";

export const usePlayerLogicProgress = ()=>{
  const listenTime= ref(0);
  const notListenTime= ref(0);
  const lastSend= ref(0);
  const downloadId: Ref<string | null>= ref(null);
  const urlLiveSent= ref(false);

  const playerStore = usePlayerStore();
  const authStore = useAuthStore();

  const intervalToSend = computed(() => { 
    if(lastSend.value < 180){
      return 10;
    }
    if(lastSend.value < 1800){
      return 30;
    }
    return 60;
  });

  watch(listenTime, async (newVal) => {
    if (
      (playerStore.playerRadio && !playerStore.playerPodcast && !playerStore.playerLive) ||
      !downloadId.value ||
      newVal - lastSend.value < intervalToSend.value
    ) {
      return;
    }
    lastSend.value = newVal;
    await sendListeningProgress(newVal);
  });

  watch(()=>playerStore.playerSeekTime, async () => {
    if (undefined===playerStore.playerSeekTime) {
      return;
    }
    if (playerStore.playerPodcast || playerStore.playerLive) {
      notListenTime.value = playerStore.playerSeekTime - listenTime.value;
    }
    if(playerStore.playerVideo){
      return;
    }
    const audioPlayer: HTMLAudioElement | null = document.querySelector("#audio-player");
    if (!audioPlayer) {
      return;
    }
    audioPlayer.currentTime = playerStore.playerSeekTime;
  });



  onMounted(() => {
      window.addEventListener("beforeunload", endListeningProgress);
  })

  async function initLiveDownloadId() {
    if (!playerStore.playerLive || downloadId.value) {
      return;
    }
    try {
      const mediaType = playerStore.playerVideo ? "VIDEO":"AUDIO";
      const downloadIdFetched = await classicApi.fetchData<string | null>({
        api:0,
        path: "podcast/download/live2/" + playerStore.playerLive.podcastId,
        parameters:{
          mediaType: mediaType,
          origin: "octopus",
          distributorId: authStore.authOrgaId,
        },
      });
      setDownloadId(downloadIdFetched);
    } catch(e) {
      downloadId.value = null;
      console.error("ERROR downloadId", e);
    }
  }

  /**
   * @param currentTime: Temps en seconds
   */
  function onTimeUpdateProgress(currentTime: number): void {
    if (!downloadId.value) {
      return;
    }
    if (
      playerStore.playerLive &&
      0 === listenTime.value &&
      0 !== currentTime
    ) {
      notListenTime.value = currentTime;
      listenTime.value = 1;
    } else {
      const newListenTime = currentTime - notListenTime.value;
      const diffTime = newListenTime - listenTime.value;
      if(diffTime > 0 && diffTime<1) {
        listenTime.value = newListenTime;
      }
    }
  }

  function setDownloadId(newValue: string | null): void {
    endListeningProgress();
    downloadId.value = newValue;
  }

  async function endListeningProgress(): Promise<void> {
    if (!downloadId.value) {
      return;
    }
    await sendListeningProgress(listenTime.value);
    downloadId.value = null;
    notListenTime.value = 0;
    lastSend.value = 0;
    listenTime.value = 0;
    urlLiveSent.value = false;
    playerStore.playerUpdatePlayerHlsUrl(undefined);
  }

  async function sendListeningProgress(listenTime:number){
    let paramUrlLive= "";
    if(!urlLiveSent.value && playerStore.playerHlsUrl){
      paramUrlLive="&url="+encodeURI(playerStore.playerHlsUrl);
      urlLiveSent.value = true;
    }

    // Send listening updates if listening lasted more than 30 seconds
    try {
      await classicApi.putData<string | null>({
        api: 0,
        path:"podcast/listen/" +downloadId.value +"?seconds=" +Math.round(listenTime)+paramUrlLive,
        isNotAuth:true
      });
    } catch(e) {
      //Do nothing
      console.error(e);
    }
  }

  return {
    listenTime,
    downloadId,
    initLiveDownloadId,
    setDownloadId,
    onTimeUpdateProgress,
    endListeningProgress
  }
}
