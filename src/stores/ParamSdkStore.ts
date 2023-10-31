import octopusApi from "@saooti/octopus-api";
import { Category } from "./class/general/category";

const state: ParamStore = {
  generalParameters: {
    organisationId: "ecbd98d9-79bd-4312-ad5e-fc7c1c4a191c",
    authenticated: true,
    isAdmin: true,
    isRoleLive: true,
    isCommments: true,
    isOrganisation: true,
    isPlaylist: true,
    isProduction: true,
    isContribution: true,
    ApiUri: "https://api.dev2.saooti.org/",
    podcastmaker: false,
    buttonPlus: true,
    allCategories: [],
    isLiveTab: true,
    isCaptchaTest: true,
    podcastItem: 13.5,
    isInlineAnimation: true,
  },
  podcastPage: {
    EditBox: true,
    SharePlayer: true,
    ShareButtons: true,
    ShareDistribution: true,
    MiniplayerUri: "https://playerbeta.dev2.saooti.org/",
    hlsUri: "https://hls.live.dev2.saooti.org/",
    mainRubrique: 0,
    resourceUrl: undefined,
    podcastItemShowEmission: false,
    clickPlayGoPage: false,
    listTypeClassic: false,
    podcastItemDescription: true,
  },
  podcastsPage: {
    MonetizableFilter: true,
    podcastBorderBottom: false,
    titlePage: undefined,
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
    progressBar: false,
  },
  emissionPage: {
    isDisplayPodcasts: true,
    overflowScroll: false,
  },
  intervenantPage: {
    lightStyle: false,
    titlePage: undefined,
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
  },
  footer: {
    contactLink: undefined,
  },
  organisation: {
    imageUrl: "/img/emptypodcast.webp",
    name: "Saooti",
    userName: "",
  },
  octopusApi: {
    url: "https://api.dev2.saooti.org/",
    commentsUrl: "https://comments.dev2.saooti.org/",
    imageUrl: "https://imageproxy.dev2.saooti.org/",
    studioUrl: "https://studio.dev2.saooti.org/",
    playerUrl: "https://playerbeta.dev2.saooti.org/",
    speechToTextUrl: "https://speech2text.dev2.saooti.org/",
    recoUrl: "https://reco.dev2.saooti.org/",
    organisationId: undefined,
    rubriqueIdFilter: undefined,
  },
};
export interface GeneralParameters {
  organisationId?: string;
  authenticated?: boolean;
  isAdmin?: boolean;
  isRoleLive?: boolean;
  isCommments?: boolean;
  isOrganisation?: boolean;
  isPlaylist?: boolean;
  isProduction?: boolean;
  isContribution?: boolean;
  ApiUri?: string;
  podcastmaker?: boolean;
  buttonPlus?: boolean;
  allCategories?: Array<Category>;
  isLiveTab?: boolean;
  isCaptchaTest?: boolean;
  podcastItem?: number;
  podcastmakerColor?: string;
  isInlineAnimation?: boolean;
}
export interface PodcastPage {
  EditBox?: boolean;
  SharePlayer?: boolean;
  ShareButtons?: boolean;
  ShareDistribution?: boolean;
  MiniplayerUri?: string;
  hlsUri?: string;
  mainRubrique?: number;
  resourceUrl?: string;
  podcastItemShowEmission?: boolean;
  clickPlayGoPage?: boolean;
  listTypeClassic?: boolean;
  podcastItemDescription?: boolean;
}
export interface PodcastsPage {
  MonetizableFilter?: boolean;
  podcastBorderBottom?: boolean;
  titlePage?: string;
}
export interface EmissionsPage {
  smallItems?: boolean;
  lightItems?: boolean;
  titlePage?: string;
  itemPlayer?: boolean;
  rubriquage?: number;
  mainRubrique?: number;
  buttonMore?: boolean;
  overflowScroll?: boolean;
  titleInImage?: boolean;
  progressBar?: boolean;
}
export interface EmissionPage {
  isDisplayPodcasts?: boolean;
  overflowScroll?: boolean;
}
export interface IntervenantPage {
  lightStyle?: boolean;
  titlePage?: string;
}
export interface IntervenantsPage {
  titlePage?: string;
}
export interface SearchPage {
  hideBar?: boolean;
}
export interface Player {
  image?: boolean;
  emissionName?: boolean;
}
export interface Footer {
  contactLink?: string;
}
export interface Organisation {
  imageUrl?: string;
  name?: string;
  userName?: string;
}
export interface OctopusApi {
  url?: string;
  commentsUrl?: string;
  imageUrl?: string;
  studioUrl?: string;
  playerUrl?: string;
  radioUrl?: string;
  speechToTextUrl?: string;
  recoUrl?: string;
  organisationId?: string;
  oAuthParam?: {
    accessToken: string;
    refreshToken: string;
    expiration: string;
  };
  rubriqueIdFilter?: Array<number>;
}
export interface ParamStore {
  generalParameters: GeneralParameters;
  podcastPage: PodcastPage;
  podcastsPage: PodcastsPage;
  emissionsPage: EmissionsPage;
  emissionPage: EmissionPage;
  intervenantPage: IntervenantPage;
  intervenantsPage: IntervenantsPage;
  searchPage: SearchPage;
  player: Player;
  footer: Footer;
  organisation: Organisation;
  octopusApi: OctopusApi;
}
const definedProps = (
  obj:
    | GeneralParameters
    | PodcastPage
    | PodcastsPage
    | EmissionsPage
    | EmissionPage
    | IntervenantPage
    | IntervenantsPage
    | SearchPage
    | Player
    | Footer
    | Organisation
    | OctopusApi,
) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
const initialize = function initialize(initObject: ParamStore): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    state.generalParameters = Object.assign(
      state.generalParameters,
      definedProps(initObject.generalParameters),
    );
    if (!state.generalParameters.authenticated) {
      state.generalParameters.organisationId = undefined;
    }
    state.podcastPage = Object.assign(
      state.podcastPage,
      definedProps(initObject.podcastPage),
    );
    state.podcastsPage = Object.assign(
      state.podcastsPage,
      definedProps(initObject.podcastsPage),
    );
    state.emissionsPage = Object.assign(
      state.emissionsPage,
      definedProps(initObject.emissionsPage),
    );
    state.emissionPage = Object.assign(
      state.emissionPage,
      definedProps(initObject.emissionPage),
    );
    state.intervenantPage = Object.assign(
      state.intervenantPage,
      definedProps(initObject.intervenantPage),
    );
    state.intervenantsPage = Object.assign(
      state.intervenantsPage,
      definedProps(initObject.intervenantsPage),
    );
    state.searchPage = Object.assign(
      state.searchPage,
      definedProps(initObject.searchPage),
    );
    state.player = Object.assign(state.player, definedProps(initObject.player));
    state.organisation = Object.assign(
      state.organisation,
      definedProps(initObject.organisation),
    );
    state.footer = Object.assign(state.footer, definedProps(initObject.footer));
    state.octopusApi = Object.assign(
      state.octopusApi,
      definedProps(initObject.octopusApi),
    );
    if (initObject.octopusApi) {
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
