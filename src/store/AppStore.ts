import { createStore } from 'vuex'
import {AppStoreData} from './typeAppStore';


export default createStore({
  state: AppStoreData(),

  getters: {
    isRoleAdmin: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('ADMIN')
      );
    },
    isRoleAnimator: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('ANIMATION')
      );
    },
    isRoleUsers: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('USERS')
      );
    },
    isRoleOrganisation: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('ORGANISATION')
      );
    },
    isRoleProduction: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('PRODUCTION')
      );
    },
    isRolePublication: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('PODCAST_VALIDATION')
      );
    },
    isRoleContribution: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('PODCAST_CRUD')
      );
    },
    isRolePlaylists: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('PLAYLISTS')
      );
    },
    isRoleComments: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('COMMENTS_MODERATION')
      );
    },
    isRoleEditor: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('EDITION')
      );
    },
    isRoleAnalytics: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('ANALYTICS')
      );
    },
    isRoleAdvertising: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('ADVERTISING')
      );
    },
    isRoleLive: state => {
      return (
        state.authentication.isAuthenticated &&
        state.authentication.role.includes('LIVE')
      );
    },
  },
  mutations: {
    navigator(state, navigator) {
      state.navigator = navigator;
    },
    storage(state, storage) {
      state.storage = storage;
    },
    miniplayer(state, miniplayer) {
      state.miniplayer = miniplayer;
    },
    api(state, api) {
      state.api = api;
    },
    RssApi(state, RssApi) {
      state.RssApi = RssApi;
    },
    MediaApi(state, MediaApi) {
      state.MediaApi = MediaApi;
    },
    commentApi(state, commentApi) {
      state.CommentApi = commentApi;
    },
    studioApi(state, studioApi) {
      state.studioApi = studioApi;
    },
    processor(state, processor) {
      state.processor = processor;
    },
    rtmp(state, rtmp) {
      state.rtmp = rtmp;
    },
    keycloakApi(state, keycloakApi) {
      state.keycloakApi = keycloakApi;
    },
    frontend(state, frontend) {
      state.frontend = frontend;
    },
    hlsApi(state, hlsApi) {
      state.hlsApi = hlsApi;
    },
    authentication(state, authentication) {
      state.authentication = authentication;
    },
    oAuthParam(state, oAuthParam) {
      state.oAuthParam = oAuthParam;
    },
    media(state, media) {
      state.media = media;
    },
    profile(state, profile) {
      state.profile = profile;
      state.authentication.name = profile.firstname + ' ' + profile.lastname;
    },
    organisation(state, organisation) {
      state.organisation = organisation;
    },

    uiDisplayLeftMenu(state, displayLeftMenuState) {
      state.ui.displayLeftMenu = displayLeftMenuState;
    },

    playerPlayPodcast(state , podcast) {
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
        (!podcast.podcastId || podcast.processingStatus !== 'READY')
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

    categoriesSet(state, categories) {
      state.categories = categories;
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

    filterMedia(state, filter) {
      if (filter.type) {
        state.filter.typeMedia = filter.type;
      }
      if (filter.order) {
        state.filter.sortOrder = filter.order;
      }
      if (filter.field) {
        state.filter.sortField = filter.field;
      }
    },

    categoriesOrgaSet(state, categories) {
      state.categoriesOrga = categories;
    },

  },
});
