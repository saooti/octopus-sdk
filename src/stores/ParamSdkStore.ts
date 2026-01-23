const state: ParamStore = {
  generalParameters: {
    forceOrganisationId: undefined,//"ecbd98d9-79bd-4312-ad5e-fc7c1c4a191c",
    forceRubriqueId: undefined,
    podcastmaker: false,
    buttonPlus: true,
    isLiveTab: true,
    isCaptchaTest: true,
    podcastItem: 13.5,
  },
  podcastPage: {
    ShareButtons: true,
    mainRubrique: 0,
    downloadButton: false
  },
  emissionsPage: {
    itemPlayer: false,
    rubriquage: undefined,
    mainRubrique: undefined,
    buttonMore: false,
    progressBar: false,
  },
  emissionPage: {},
  player: {
    isVideoPage:false,
  },
};

export interface ParamStore {
  generalParameters: {
    /** Automatically filter results by this organisation */
    forceOrganisationId?: string;
    /** Automatically filter results by these rubriques */
    forceRubriqueId?: number|number[];
    /** Automatically exclude these rubriquage from results */
    forceNoRubriquageId?: number|number[];
    /** Enable for podcastmakers */
    podcastmaker?: boolean;
    /** Show time with the dates on podcasts */
    showTimeWithDates?: boolean;
    buttonPlus?: boolean;
    isLiveTab?: boolean;
    isCaptchaTest?: boolean;
    podcastItem?: number;
  };
  podcastPage:  {
    ShareButtons?: boolean;
    mainRubrique?: number;
    downloadButton?:boolean;
    /** If true, hide tags on podcast page */
    hideTags?: boolean;
    /** The maximum number of tags that can be displayed */
    maxTags?: number;
  };
  emissionPage: {
    ShareButtons?: boolean;
    /** If true, hide tags on emission page */
    hideTags?: boolean;
    /** The maximum number of tags that can be displayed */
    maxTags?: number;
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
    /**
     * Indicates that the play is at the top of the page.
     * This adapts player settings for properly display.
     * Currently *does not* position the player.
     */
    topPlacement?: boolean;
    /** Start with the large version by default */
    startLarge?: boolean;
    /** Show a warning regarding AI generation of transcripts */
    showAITranscriptWarning?: boolean;
    /** If true, the player will not close when finishing playing */
    stayOpenOnFinish?: boolean;
  };
}

function definedProps<T>(obj: Partial<T>|undefined): Partial<T> {
  if (obj === undefined) {
    return {};
  } else {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
  }
}

const initialize = function initialize(initObject: Partial<ParamStore>): void {
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
  state.emissionPage = Object.assign(
    state.emissionPage,
    definedProps(initObject.emissionPage),
  );
  state.player = Object.assign(state.player, definedProps(initObject.player));
};

export default { initialize, state };
export { initialize, state };
