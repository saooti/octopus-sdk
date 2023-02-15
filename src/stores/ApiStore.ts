import { defineStore } from 'pinia';
interface ApiState {
	apiUrl: string,
	commentUrl: string,
	frontendUrl: string,
	ftpUrl: string,
	hlsUrl: string,
	imageUrl: string,
	keycloakUrl: string,
	mediaUrl: string,
	miniplayerUrl:string,
	processorUrl: string,
	radioUrl: string,
	recoUrl:string,
	rssUrl: string,
	rtmpUrl: string,
	speechToTextUrl: string,
	studioUrl: string,
	videoMakerUrl: string,
	storageUrl: string,
}
export const useAuthStore = defineStore('ApiStore', {
  state: (): ApiState => ({
    apiUrl: "",
    commentUrl: "",
    frontendUrl: "",
    ftpUrl: "",
    hlsUrl: "",
    imageUrl: "",
    keycloakUrl: "",
    mediaUrl: "",
    miniplayerUrl: "",
    processorUrl: "",
    radioUrl: "",
    recoUrl: "",
    rssUrl: "",
    rtmpUrl: "",
    speechToTextUrl: "",
    studioUrl: "",
    videoMakerUrl: "",
    storageUrl: "",
  }),
  actions: {
    initApis(initParam: ApiState) {
      this.apiUrl = initParam.apiUrl;
			this.commentUrl = initParam.commentUrl;
			this.frontendUrl = initParam.frontendUrl;
			this.ftpUrl = initParam.ftpUrl;
			this.hlsUrl = initParam.hlsUrl;
			this.imageUrl = initParam.imageUrl;
			this.keycloakUrl = initParam.keycloakUrl;
			this.mediaUrl = initParam.mediaUrl;
			this.miniplayerUrl = initParam.miniplayerUrl;
			this.processorUrl = initParam.processorUrl;
			this.radioUrl = initParam.radioUrl;
			this.recoUrl = initParam.recoUrl;
			this.rssUrl = initParam.rssUrl;
			this.rtmpUrl = initParam.rtmpUrl;
			this.speechToTextUrl = initParam.speechToTextUrl;
			this.studioUrl = initParam.studioUrl;
			this.videoMakerUrl = initParam.videoMakerUrl;
			this.storageUrl = initParam.storageUrl;
    },
  }
})