import { defineStore } from "pinia";
interface ApiState {
  apiUrl: string;
  billingUrl: string;
  commentUrl: string;
  frontendUrl: string;
  hlsUrl: string;
  imageUrl: string;
  importerUrl: string;
  keycloakUrl: string;
  mediaUrl: string;
  miniplayerUrl: string;
  processorUrl: string;
  radioUrl: string;
  recoUrl: string;
  rtmpUrl: string;
  speechToTextUrl: string;
  textToSpeechUrl: string;
  studioUrl: string;
  videoMakerUrl: string;
  storageUrl: string;
}
export const useApiStore = defineStore("ApiStore", {
  state: (): ApiState => ({
    apiUrl: "",
    billingUrl: "",
    commentUrl: "",
    frontendUrl: "",
    hlsUrl: "",
    imageUrl: "",
    importerUrl: "",
    keycloakUrl: "",
    mediaUrl: "",
    miniplayerUrl: "",
    processorUrl: "",
    radioUrl: "",
    recoUrl: "",
    rtmpUrl: "",
    speechToTextUrl: "",
    textToSpeechUrl: "",
    studioUrl: "",
    videoMakerUrl: "",
    storageUrl: "",
  }),
  actions: {
    initApis(initParam: ApiState) {
      this.apiUrl = initParam.apiUrl;
      this.billingUrl = initParam.billingUrl;
      this.commentUrl = initParam.commentUrl;
      this.frontendUrl = initParam.frontendUrl;
      this.hlsUrl = initParam.hlsUrl;
      this.imageUrl = initParam.imageUrl;
      this.importerUrl = initParam.importerUrl;
      this.keycloakUrl = initParam.keycloakUrl;
      this.mediaUrl = initParam.mediaUrl;
      this.miniplayerUrl = initParam.miniplayerUrl;
      this.processorUrl = initParam.processorUrl;
      this.radioUrl = initParam.radioUrl;
      this.recoUrl = initParam.recoUrl;
      this.rtmpUrl = initParam.rtmpUrl;
      this.speechToTextUrl = initParam.speechToTextUrl;
      this.textToSpeechUrl = initParam.textToSpeechUrl;
      this.studioUrl = initParam.studioUrl;
      this.videoMakerUrl = initParam.videoMakerUrl;
      this.storageUrl = initParam.storageUrl;
    },
  },
});
