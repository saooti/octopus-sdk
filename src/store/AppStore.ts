import { createStore } from 'vuex'
import { AppStoreData } from './classStore/typeAppStore';
import PlayerStore from '@/store/PlayerStore';
export default createStore({
  state: AppStoreData(),
  modules: {
    player: PlayerStore
  },
  mutations: {
    categoriesSet(state, categories) {
      state.categories = categories;
    },
    categoriesOrgaSet(state, categories) {
      state.categoriesOrga = categories;
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
      state.filter.live = filter.isLive;
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
    initFilter(state, data) {
      state.filter = {
        ...state.filter,
        ...data,
      };
    },
    liveUpdate(state, isBeforeLive) {
      state.liveUpdate.isBeforeLive = isBeforeLive;
    },
    setCommentIdentity(state, identity) {
      state.comments.knownIdentity = identity;
    },
    setCommentLoaded(state, data) {
      state.comments.actualPodcastId = data.podcastId;
      state.comments.loadedComments = data.comments;
    },
    isEducation(state, isEducation) {
      state.general.education = isEducation;
      state.general.logoUrl = '/img/logo_education.webp';
      state.general.metaTitle = 'RadioEducation.org';
    },
  },
});
