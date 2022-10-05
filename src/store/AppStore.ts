import { createStore } from 'vuex'
import { AppStoreData } from './typeAppStore';

export default createStore({
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
    playerSeekTime(state, seekTime) {
      state.player.seekTime = seekTime;
    },

    filterOrga(state, filter) {
      state.filter.organisationId = filter.orgaId;
      if (filter.imgUrl || !filter.orgaId) {
        state.filter.imgUrl = filter.imgUrl;
      }
      if (filter.name || !filter.orgaId) {
        state.filter.name = filter.name;
      }
      if(filter.rubriquageArray){
        state.filter.rubriquageArray = filter.rubriquageArray;
      }
      state.filter.live= filter.isLive;
      state.filter.iab = undefined;
    },
    filterIab(state, iab) {
      state.filter.iab = iab;
    },
    filterRubrique(state, rubriqueFilter) {
      state.filter.rubriqueFilter = rubriqueFilter;
    },
    filterRubriqueDisplay(state, rubriques) {
      state.filter.rubriqueDisplay = rubriques;
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
