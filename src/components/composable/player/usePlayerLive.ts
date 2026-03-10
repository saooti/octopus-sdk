import stringHelper from "../../../helper/stringHelper";
import { usePlayerLogicProgress } from "./usePlayerLogicProgress";
import { computed, Ref, ref } from "vue";
import { usePlayerStore, PlayerStatus } from "../../../stores/PlayerStore";
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
  const playPromise: Ref<Promise<void>|undefined>= ref(undefined);
  const errorHls= ref(false);


  const playerStore = usePlayerStore();
  const apiStore = useApiStore();
  const authStore = useAuthStore();

  const needToAddToken = computed(() => { 
    return authStore.authParam.accessToken && ("SECURED" === playerStore.playerLive?.organisation?.privacy || playerStore.playerRadio?.secured);
  });

  function onPlay(): void {
    playerStore.playerChangeStatus(PlayerStatus.PAUSED ===playerStore.playerStatus);
  }

  function playRadio() {
    if (!playerStore.playerRadio) {
      return;
    }
    handleSessionIdRadio();
    playerStore.playerUpdatePlayerHlsUrl(playerStore.playerRadio.url+"?origin=octopus&sessionId="+playerStore.playerRadio.sessionId);
    playHls();
  }

  function handleSessionIdRadio(){
    if(!playerStore.playerRadio) {
      return;
    }
    if(playerStore.playerRadio.sessionId && dayjs().diff(dayjs(playerStore.playerRadio.dateSessionId), 'm')<maxMinutesSessionId){
      return;
    }
    playerStore.playerRadio.sessionId = stringHelper.uuidv4();
  }

  function playLive() {
    if (!playerStore.playerHlsIdentifier) {
      return;
    }
    playerStore.playerUpdatePlayerHlsUrl(`${apiStore.hlsUrl}live/${playerStore.playerHlsIdentifier}/index.m3u8`);
    playHls();
  }

  async function playHls(): Promise<void> {
    try {
      if(null===audioElement.value){
        audioElement.value = document.getElementById("audio-player") as HTMLAudioElement;
      }
      if (null === audioElement.value || !playerStore.playerHlsUrl) {
        setTimeout(playHls, 1000);
        return;
      }
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
      const isChrome = ua.indexOf("chrome") > -1;
      if (
        audioElement.value.canPlayType("application/vnd.apple.mpegurl") &&
        !isChrome &&
        !isAndroid
      ) {
        let url = playerStore.playerHlsUrl;
        if(needToAddToken.value) {
          if (url.includes('?')) {
            url += "&access_token="+authStore.authParam.accessToken;
          } else {
            url += "?access_token="+authStore.authParam.accessToken;
          }
        }
        audioElement.value.src = url;
        await initLiveDownloadId();
        hlsReady.value = true;
        await audioElement.value.play();
        onPlay();
      } else {
        await initHls();
      }
    } catch(e) {
      console.error(e);
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
      autoStartLoad: true,
      liveDurationInfinity:true,
      backBufferLength:10,
      maxBufferLength:60,

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
      setTimeout(() => {
        playPromise.value = (audioElement.value as HTMLAudioElement).play();
        playPromise.value.then(() =>{
          playPromise.value = undefined;
          onPlay();
        }).catch((e)=>{
          console.error(e);
          onHlsError();
          playPromise.value = undefined;
        });
      }, 500);
    });
    hls.value.on(Hls.Events.ERROR, async (name: string, data:any) => {
      // Stalling, we don't have enough data
      if (data.details === 'bufferStalledError') {
        // Some logs to be able to follow what's happening
        console.warn('playback is stalling…');
        playerStore.playerStatus = PlayerStatus.LOADING;
        // Destroy current instance
        hls.value.destroy();
        // Wait a bit before restarting playback
        setTimeout(initHls, 500);
        return;
      }
      console.error('An error occured: ' + name + ' / ' + data.details);
      console.error(data);
      if (data.fatal && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        console.warn('Trying to recover...');
        hls.value.recoverMediaError();
      }
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
