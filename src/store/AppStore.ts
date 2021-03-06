import Vue from 'vue';
import Vuex from 'vuex';
import { AppStoreData } from './typeAppStore';

//Utilisation de VueX pour le store https://vuex.vuejs.org/fr/guide/
Vue.use(Vuex);

export default new Vuex.Store({
  state: AppStoreData(),

  getters: {},
  mutations: {
    playerPlayPodcast(state, podcast) {
      if (!podcast) {
        state.player = {
          status: 'STOPPED', //STOPPED, LOADING, PLAYING, PAUSED
          podcast: undefined,
          media: undefined,
          live: undefined,
          elapsed: 0,
        };
        return;
      }
      if (podcast.isStop) {
        state.player.stop = true;
      }
      if (
        (state.player.podcast &&
          state.player.podcast.podcastId === podcast.podcastId) ||
        (state.player.media &&
          state.player.media.mediaId === podcast.mediaId) ||
        (state.player.live &&
          state.player.live.conferenceId === podcast.conferenceId)
      ) {
        //Do nothing
        return;
      }
      if (
        podcast.conferenceId &&
        (!podcast.podcastId || 'READY' !== podcast.processingStatus)
      ) {
        state.player = {
          status: 'LOADING', //STOPPED, LOADING, PLAYING, PAUSED
          podcast: undefined,
          media: undefined,
          live: podcast,
          elapsed: 0,
        };
      } else if (podcast.podcastId) {
        state.player = {
          status: 'LOADING', //STOPPED, LOADING, PLAYING, PAUSED
          podcast: podcast,
          media: undefined,
          live: undefined,
          elapsed: 0,
        };
      } else if (podcast.mediaId) {
        state.player = {
          status: 'LOADING', //STOPPED, LOADING, PLAYING, PAUSED
          podcast: undefined,
          media: podcast,
          live: undefined,
          elapsed: 0,
        };
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

    filterOrga(state, filter) {
      state.filter.organisationId = filter.orgaId;
      if (filter.imgUrl || !filter.orgaId) {
        state.filter.imgUrl = filter.imgUrl;
      }
    },

    filterOrgaLive(state, isLive) {
      state.filter.live = isLive;
    },

    categoriesSet(state, categories) {
      state.categories = categories;
    },

    categoriesOrgaSet(state, categories) {
      state.categoriesOrga = categories;
    },
    setCommentIdentity(state, identity) {
      state.comments.knownIdentity = identity;
    },
    setCommentLoaded(state, data) {
      state.comments.actualPodcastId = data.podcastId;
      state.comments.loadedComments = data.comments;
      state.comments.totalCount = data.count;
    },
  },
});
