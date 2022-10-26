import { getDefaultPlayerState } from './classStore/typePlayerStore';
import { Module, MutationTree } from 'vuex';
import { StoreState } from './classStore/typeAppStore';
import { Player } from './class/general/player';

const mutations = <MutationTree<Player>>{
  playPodcast(state, podcast) {
    if (!podcast) {
      state.status = 'STOPPED';
      state.podcast = undefined;
      state.media = undefined;
      state.live = undefined;
      state.elapsed = 0;
      return;
    }
    if (
      (state.podcast &&
        state.podcast.podcastId === podcast.podcastId) ||
      (state.media && state.media.mediaId === podcast.mediaId) ||
      (state.live &&
        state.live.conferenceId === podcast.conferenceId)
    ) {
      //Do nothing
      return;
    }
    state.status = 'LOADING';
    state.podcast = undefined;
    state.media = undefined;
    state.live = undefined;
    state.elapsed = 0;
    if (
      podcast.conferenceId &&
      (!podcast.podcastId || podcast.processingStatus !== 'READY')
    ) {
      state.live = podcast;
    } else if (podcast.podcastId) {
      state.podcast = podcast;
    } else if (podcast.mediaId) {
      state.media = podcast;
    }
  },

  pause(state, pause) {
    if (pause) {
      state.status = 'PAUSED';
    } else {
      state.status = 'PLAYING';
    }
  },

  elapsed(state, elapsed) {
    state.elapsed = elapsed;
  },

  totalTime(state, total) {
    state.total = total;
  },

  volume(state, volume) {
    state.volume = volume;
  },

  seekTime(state, seekTime) {
    state.seekTime = seekTime;
  },
  transcript(state, transcript) {
    state.transcript = transcript;
  },
};

const PlayerModule: Module<Player, StoreState> = {
  namespaced: true,
  state: getDefaultPlayerState(),
  mutations: mutations,
};

export default PlayerModule;
