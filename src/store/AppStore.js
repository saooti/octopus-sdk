import Vue from 'vue';
import Vuex from 'vuex';

//Utilisation de VueX pour le store https://vuex.vuejs.org/fr/guide/
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
		player: {
      status: 'STOPPED', //STOPPED, LOADING, PLAYING, PAUSED
      podcast: undefined,
      volume: 1, //From 0 to 1
      elapsed: 0, //From 0 to 1
      total: 0,
      media : undefined
    },
    authentication:{
      isAuthenticated : true,
    },
    profile: {
      imageUrl:"https://s3.eu-west-3.amazonaws.com/saooti.lebook/da5d40f6-101c-4566-929f-70a7b202e505/0390fc31-1856-42fa-a440-55aa4cf498ab",
    },
    filter:{
      organisationId: undefined,
    },
    categories: [],
    categoriesOrga: [],
  },

  getters: {},
  mutations: {
		playerPlayPodcast(state, podcast) {
      if (!podcast) {
        state.player = {
          status: 'STOPPED', //STOPPED, LOADING, PLAYING, PAUSED
          podcast: undefined,
          media: undefined,
          elapsed: 0,
        };
      } else {
        if (
          state.player.podcast &&
          (state.player.podcast.podcastId === podcast.podcastId ||
           state.player.podcast.mediaId === podcast.mediaId)
        ) {
          //Do nothing
        } else {
          if(podcast.podcastId){
            state.player = {
              status: 'LOADING', //STOPPED, LOADING, PLAYING, PAUSED
              podcast: podcast,
              media: undefined,
              elapsed: 0,
            };
          }else{
            state.player = {
              status: 'LOADING', //STOPPED, LOADING, PLAYING, PAUSED
              podcast: undefined,
              media: podcast,
              elapsed: 0,
            };
          }
        }
      }
    },

    playerPause(state, pause) {
      if (pause) {
        state.player.status = 'PAUSED';
      } else {
        state.player.status = 'PLAYING';
      }
    },

    playerElapsed(state, elapsed) {
      state.player.elapsed = elapsed;
    },

    playerTotalTime(state, total) {
      state.player.total = total;
    },

    playerVolume(state, volume) {
      state.player.volume = volume;
    },

    filterOrga(state, orgaId) {
      state.filter.organisationId = orgaId;
    },

    categoriesSet(state, categories) {
      state.categories = categories;
    },

    categoriesOrgaSet(state, categories) {
      state.categoriesOrga = categories;
    },
  },
});
