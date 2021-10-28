import octopusApi from '@saooti/octopus-api';
import { Category } from './class/category';

const state:paramStore = {
  generalParameters: {
    organisationId:'ecbd98d9-79bd-4312-ad5e-fc7c1c4a191c',
    authenticated: true,
    isAdmin: true,
    isRoleLive: true,
    isCommments: true,
    isOrganisation: true,
    isPlaylist: false,
    isProduction: true,
    isContribution: true,
    ApiUri: 'https://api.staging.saooti.org/',
    podcastmaker: false,
    buttonPlus: true,
    allCategories: [],
    isLiveTab: false,
    isCaptchaTest: true,
  },
  podcastPage: {
    EditBox: false,
    SharePlayer: true,
    ShareButtons: true,
    ShareDistribution: true,
    MiniplayerUri: 'https://player.staging.saooti.org/',
    MiniplayerBetaUri: 'https://playerbeta.staging.saooti.org/',
    ouestFranceStyle: false,
    tagList: false,
    downloadButton: false,
    hlsUri: 'https://hls.staging.saooti.org/',
    mainRubrique: 0,
    resourceUrl: undefined
  },
  podcastsPage: {
    ProductorSearch: true,
    MonetizableFilter: true,
    podcastShadow: true,
    podcastBorderBottom: false,
    titlePage: undefined,
    emissionChooser: false,
  },
  emissionsPage: {
    smallItems: false,
    lightItems: false,
    titlePage: undefined,
    itemPlayer: false,
    rubriquage: undefined,
    mainRubrique: undefined,
    buttonMore: false,
    overflowScroll: false,
    titleInImage: false,
  },
  emissionPage: {
    ouestFranceStyle: false,
    rssButton: false,
  },
  intervenantPage: {
    lightStyle: false,
    rssButton: false,
    titlePage: undefined
  },
  intervenantsPage: {
    titlePage: undefined,
  },
  searchPage: {
    hideBar: false,
  },
  player: {
    image: true,
    emissionName: false,
    clock: false,
    barTop: false,
  },
  footer: {
    contactLink: undefined,
  },
  organisation: {
    imageUrl: '/img/emptypodcast.png',
    name: 'Saooti',
    userName: '',
  },
  octopusApi: {
    url: 'http://api.staging.saooti.org/',
    commentsUrl: 'http://comments.staging.saooti.org/',
    studioUrl: 'http://studio.staging.saooti.org/',
    playerUrl: 'https://playerbeta.staging.saooti.org/',
    organisationId: undefined,
  },
};
export interface GeneralParameters{
  organisationId?: string|undefined,
  authenticated?: boolean,
  isAdmin?: boolean,
  isRoleLive?: boolean,
  isCommments?: boolean,
  isOrganisation?: boolean,
  isPlaylist?: boolean,
  isProduction?: boolean,
  isContribution?: boolean,
  ApiUri?: string,
  podcastmaker?: boolean,
  buttonPlus?: boolean,
  allCategories?: Array<Category>,
  isLiveTab?: boolean,
  isCaptchaTest?: boolean,
}
export interface PodcastPage{
  EditBox?: boolean,
  SharePlayer?: boolean,
  ShareButtons?: boolean,
  ShareDistribution?: boolean,
  MiniplayerUri?: string,
  MiniplayerBetaUri?: string,
  ouestFranceStyle?: boolean,
  tagList?: boolean,
  downloadButton?: boolean,
  hlsUri?: string,
  mainRubrique?: number,
  resourceUrl?: string |undefined,
}
export interface PodcastsPage{
  ProductorSearch?: boolean,
    MonetizableFilter?: boolean,
    podcastShadow?: boolean,
    podcastBorderBottom?: boolean,
    titlePage?: string|undefined,
    emissionChooser?: boolean,
}
export interface EmissionsPage{
  smallItems?: boolean,
  lightItems?: boolean,
  titlePage?: string|undefined,
  itemPlayer?: boolean,
  rubriquage?: number|undefined,
  mainRubrique?: number|undefined,
  buttonMore?: boolean,
  overflowScroll?: boolean,
  titleInImage?: boolean,
}
export interface EmissionPage{
  ouestFranceStyle?: boolean,
  rssButton?: boolean,
}
export interface IntervenantPage{
  lightStyle?: boolean,
    rssButton?: boolean,
    titlePage?: string|undefined
}
export interface IntervenantsPage{
  titlePage?: string|undefined
}
export interface SearchPage{
  hideBar?: boolean
}
export interface Player{
  image?: boolean
    emissionName?: boolean
    clock?: boolean
    barTop?: boolean
}
export interface Footer{
  contactLink?: string|undefined
}
export interface Organisation{
  imageUrl?: string,
    name?: string,
    userName?: string,
}
export interface OctopusApi{
  url?: string,
  commentsUrl?: string,
  studioUrl?: string,
  playerUrl?: string,
  organisationId?: string | undefined,
}
export interface paramStore{
  generalParameters:GeneralParameters,
  podcastPage: PodcastPage,
  podcastsPage: PodcastsPage,
  emissionsPage:EmissionsPage,
  emissionPage: EmissionPage,
  intervenantPage:IntervenantPage,
  intervenantsPage:IntervenantsPage,
  searchPage:SearchPage,
  player: Player,
  footer: Footer,
  organisation:Organisation,
  octopusApi:OctopusApi,
}

const initialize = function initialize(initObject: paramStore): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (initObject.generalParameters) {
      state.generalParameters = {...state.generalParameters,...initObject.generalParameters };
    }
    if (initObject.podcastPage) {
      state.podcastPage = {...state.podcastPage,...initObject.podcastPage };
    }
    if (initObject.podcastsPage) {
      state.podcastsPage = {...state.podcastsPage,...initObject.podcastsPage };
    }
    if (initObject.emissionsPage) {
      state.emissionsPage = {...state.emissionsPage,...initObject.emissionsPage };
    }
    if (initObject.emissionPage) {
      state.emissionPage = {...state.emissionPage,...initObject.emissionPage };
    }
    if (initObject.intervenantPage) {
      state.intervenantPage = {...state.intervenantPage,...initObject.intervenantPage };
    }
    if (initObject.intervenantsPage) {
      state.intervenantsPage = {...state.intervenantsPage,...initObject.intervenantsPage };
    }
    if (initObject.searchPage) {
      state.searchPage = {...state.searchPage,...initObject.searchPage };
    }
    if (initObject.player) {
      state.player = {...state.player,...initObject.player };
    }
    if (initObject.organisation) {
      state.organisation = {...state.organisation,...initObject.organisation };
    }
    if (initObject.footer) {
      state.footer = {...state.footer,...initObject.footer };
    }
    if (initObject.octopusApi) {
      state.octopusApi = {...state.octopusApi,...initObject.octopusApi };
      try {
        octopusApi.initialize(state.octopusApi);
        resolve();
      } catch (error) {
        reject();
      }
    } else {
      resolve();
    }
  });
};

export default { initialize, state };
export { initialize, state };