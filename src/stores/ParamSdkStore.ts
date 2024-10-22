const state: ParamStore = {
  //TODO init dans le main API store et AuthStore
  generalParameters: {
    forceOrganisationId: undefined,//"ecbd98d9-79bd-4312-ad5e-fc7c1c4a191c",
    podcastmaker: false,
    buttonPlus: true,
    isLiveTab: true,
    isCaptchaTest: true,
    podcastItem: 13.5,
  },
  podcastPage: {
    ShareButtons: true,
    mainRubrique: 0,
  },
  emissionsPage: {
    itemPlayer: false,
    rubriquage: undefined,
    mainRubrique: undefined,
    buttonMore: false,
    progressBar: false,
  },
  player: {
    isVideoPage:false,
  },
};
export interface ParamStore {
  generalParameters: {
    forceOrganisationId?: string;
    podcastmaker?: boolean;
    buttonPlus?: boolean;
    isLiveTab?: boolean;
    isCaptchaTest?: boolean;
    podcastItem?: number;
  };
  podcastPage:  {
    ShareButtons?: boolean;
    mainRubrique?: number;
  };
  emissionsPage: {
    itemPlayer?: boolean;
    rubriquage?: number;
    mainRubrique?: number;
    buttonMore?: boolean;
    progressBar?: boolean;
  },
  player: {
    isVideoPage?:boolean;
  };
}
const definedProps = (obj:unknown) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const initialize = function initialize(initObject: ParamStore): void {
  state.generalParameters = Object.assign(
    state.generalParameters,
    definedProps(initObject.generalParameters),
  );
  state.podcastPage = Object.assign(
    state.podcastPage,
    definedProps(initObject.podcastPage),
  );
  state.emissionsPage = Object.assign(
    state.emissionsPage,
    definedProps(initObject.emissionsPage),
  );
  state.player = Object.assign(state.player, definedProps(initObject.player));
};

export default { initialize, state };
export { initialize, state };
