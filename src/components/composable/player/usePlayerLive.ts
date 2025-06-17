import stringHelper from "../../../helper/stringHelper";
import { usePlayerLogicProgress } from "./usePlayerLogicProgress";
import { computed, Ref, ref } from "vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useApiStore } from "../../../stores/ApiStore";
import dayjs from "dayjs";
import { useAuthStore } from "../../../stores/AuthStore";
/* eslint-disable*/
let Hls:any = null;
/* eslint-enable*/
const maxMinutesSessionId = 1;
export const usePlayerLive = (hlsReady: Ref<boolean>)=>{

  const { listenTime, initLiveDownloadId, setDownloadId, onTimeUpdateProgress } = usePlayerLogicProgress();

  const audioElement: Ref<HTMLAudioElement | null>= ref(null);
  const hls: Ref<any>= ref(null);
  const hlsRetryTimeout: Ref<ReturnType<typeof setTimeout> | undefined>= ref(undefined);
  const playPromise: Ref<any>= ref(undefined);
  const errorHls= ref(false);


  const playerStore = usePlayerStore();
  const apiStore = useApiStore();
  const authStore = useAuthStore();

  const needToAddToken = computed(() => { 
    return authStore.authParam.accessToken && ("SECURED" === playerStore.playerLive?.organisation?.privacy || playerStore.playerRadio?.secured);
  });

  


  function onPlay(): void {
    playerStore.playerChangeStatus("PAUSED"===playerStore.playerStatus);
  }

  function playRadio() {
    if (!playerStore.playerRadio) return;
    handleSessionIdRadio();
    playerStore.playerUpdatePlayerHlsUrl(playerStore.playerRadio.url+"?origin=octopus&sessionId="+playerStore.playerRadio.sessionId);
    playHls();
  }

  function handleSessionIdRadio(){
    if(!playerStore.playerRadio) return;
    if(playerStore.playerRadio.sessionId && dayjs().diff(dayjs(playerStore.playerRadio.dateSessionId), 'm')<maxMinutesSessionId){
      return;
    }
    playerStore.playerRadio.sessionId = stringHelper.uuidv4();
  }

  function playLive() {
    if (!playerStore.playerLive) return;
    playerStore.playerUpdatePlayerHlsUrl(`${apiStore.hlsUrl}live/dev.${playerStore.playerLive.conferenceId}/index.m3u8`);
    playHls();
  }

  async function playHls(): Promise<void> {
    try {
      if(null===audioElement.value){
        audioElement.value = document.getElementById(
          "audio-player",
        ) as HTMLAudioElement;
      }
      if (null === audioElement.value || !playerStore.playerHlsUrl) {
        setTimeout(() => {
          playHls();
        }, 1000);
        return;
      }
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
      if (
        audioElement.value.canPlayType("application/vnd.apple.mpegurl") &&
        !isAndroid
      ) {
        if(needToAddToken.value) {
          audioElement.value.src = playerStore.playerHlsUrl+"?access_token="+authStore.authParam.accessToken;
        }else{
          audioElement.value.src = playerStore.playerHlsUrl;
        }
        await initLiveDownloadId();
        hlsReady.value = true;
        await audioElement.value.play();
        onPlay();
      } else {
        await initHls();
      }
    } catch {
      onHlsError();
    }
  }

  function onHlsError(){
    if("STOPPED"!==playerStore.playerStatus && undefined===hlsRetryTimeout.value){
      hlsRetryTimeout.value = setTimeout(() => {
        errorHls.value = false;
        playHls();
        hlsRetryTimeout.value = undefined;
      }, 5000);
    }
  }

  async function initHls() {
    if (null === Hls) {
      await import("hls.js").then((hlsLibrary) => {
        Hls = hlsLibrary.default;
      });
    }
    if (!Hls.isSupported()) {
      throw new Error("Hls is not supported ! ");
    }
    hls.value = new Hls({
      xhrSetup: (xhr: XMLHttpRequest) => {
        if (needToAddToken.value) {
          xhr.setRequestHeader("Authorization", "Bearer " +authStore.authParam.accessToken);
        }
      }
    });
    hls.value.on(Hls.Events.MANIFEST_PARSED, async () => {
      await initLiveDownloadId();
      hlsReady.value = true;
      if(true===errorHls.value){
        return;
      }
      playPromise.value = (audioElement.value as HTMLAudioElement).play();
      playPromise.value.then(() =>{
        playPromise.value = undefined;
        onPlay();
      }).catch(()=>{
        onHlsError();
        playPromise.value = undefined;
      })
    });
    hls.value.on(Hls.Events.ERROR, async (e, data:any) => {
      errorHls.value = true;
      if(undefined===playPromise.value && data.fatal){
        onHlsError();
      }
    });
    hls.value.loadSource(playerStore.playerHlsUrl);
    hls.value.attachMedia(audioElement.value as HTMLAudioElement);
  }

  async function endingLive(): Promise<void> {
    clearTimeout(hlsRetryTimeout.value);
    hlsRetryTimeout.value = undefined;
    if(null===audioElement.value){
      return;
    }
    audioElement.value = null;
    const audio: HTMLElement | null = document.getElementById("audio-player");
    if (audio && hls.value) {
      hls.value.destroy();
      hls.value = null;
    }else{
      (audio as HTMLAudioElement).pause();
    }
    (audio as HTMLAudioElement).src = "";
  }

	return {
    listenTime,
    setDownloadId,
    onTimeUpdateProgress,
    playLive,
    endingLive,
    playRadio,
    onPlay
	}
}
