import { usePlayerStore } from "../../../stores/PlayerStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { computed, onMounted, Ref, ref, watch} from 'vue';
import classicApi from "../../../api/classicApi";

export const usePlayerLogicProgress = ()=>{
  const listenTime= ref(0);
  const notListenTime= ref(0);
  const lastSend= ref(0);
  const downloadId: Ref<string | null>= ref(null);

  const playerStore = usePlayerStore();
  const authStore = useAuthStore();

  const intervalToSend = computed(() => { 
    if(lastSend.value<180){
      return 10;
    }
    if(lastSend.value<1800){
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
    await classicApi.putData({
      api: 0,
      path:"podcast/listen/" + downloadId.value + "?seconds=" + Math.round(newVal),
      isNotAuth:true
    });
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
    if (!audioPlayer) return;
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
      const downloadId = await classicApi.putData<string | null>({
        api: 0,
        path:"podcast/prepare/live/" + playerStore.playerLive.podcastId+"?mediaType="+mediaType,
        isNotAuth:true
      });
      await classicApi.fetchData<string | null>({
        api:0,
        path: "podcast/download/live/" + playerStore.playerLive.podcastId + ".m3u8",
        parameters:{
          downloadId: downloadId ?? undefined,
          origin: "octopus",
          distributorId: authStore.authOrgaId,
        },
        isNotAuth:true
      });
      setDownloadId(downloadId);
    } catch {
      downloadId.value = null;
      console.log("ERROR downloadId");
    }
  }

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
      if(diffTime > 0 && diffTime<1){
        listenTime.value = newListenTime;
      }
    }
  }

  function setDownloadId(newValue: string | null): void {
    endListeningProgress();
    downloadId.value = newValue;
  }

  async function endListeningProgress(): Promise<void> {
    if (!downloadId.value) return;
    try {
      await classicApi.putData<string | null>({
        api: 0,
        path:"podcast/listen/" +
        downloadId.value +
          "?seconds=" +
          Math.round(listenTime.value),
        isNotAuth:true
      });
    } catch {
      //Do nothing
    }
    downloadId.value = null;
    notListenTime.value = 0;
    lastSend.value = 0;
    listenTime.value = 0;
  }


	return {
    listenTime,
    downloadId,
    initLiveDownloadId,
    setDownloadId,
    onTimeUpdateProgress
	}
}