import { ApiState, getDefaultApiState } from './classStore/typeApiStore';
import { Module, MutationTree } from 'vuex';
import { StoreState } from './classStore/typeAppStore';
const mutations = <MutationTree<ApiState>>{
  init(state, apiUrls: ApiState) {
    state.apiUrl= apiUrls.apiUrl;
    state.commentUrl= apiUrls.commentUrl;
    state.frontendUrl= apiUrls.frontendUrl;
    state.ftpUrl= apiUrls.ftpUrl;
    state.hlsUrl= apiUrls.hlsUrl;
    state.imageUrl= apiUrls.imageUrl;
    state.keycloakUrl= apiUrls.keycloakUrl;
    state.mediaUrl= apiUrls.mediaUrl;
    state.miniplayerUrl= apiUrls.miniplayerUrl;
    state.processorUrl= apiUrls.processorUrl;
    state.recoUrl= apiUrls.recoUrl;
    state.radioUrl= apiUrls.radioUrl;
    state.rssUrl= apiUrls.rssUrl;
    state.rtmpUrl= apiUrls.rtmpUrl;
    state.speechToTextUrl= apiUrls.speechToTextUrl;
    state.studioUrl= apiUrls.studioUrl;
    state.videoMakerUrl= apiUrls.videoMakerUrl;
    state.storageUrl= apiUrls.storageUrl;
  },
};

const ApiModule: Module<ApiState, StoreState> = {
  namespaced: true,
  state: getDefaultApiState(),
  mutations: mutations,
};

export default ApiModule;
