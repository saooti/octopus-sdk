import octopusApi from '@saooti/octopus-api';

var state = {
  generalParameters: {},
  filter: {
    organisationId: undefined,
  },
  podcastPage: {},
  podcastsPage: {},
  emissionsPage: {},
  emissionPage: {},
  intervenantPage: {},
  searchPage: {},
  player: {},
  footer: {},
  organisation: {},
  octopusApi: {},
  oAuthParam: {},
};

var initialize = function initialize(initObject) {
  return new Promise((resolve, reject) => {
    if (initObject.generalParameters) {
      let param = initObject.generalParameters;
      state.generalParameters.organisationId =
        'undefined' !== typeof param.organisationId
          ? param.organisationId
          : null;
      state.generalParameters.authenticated =
        'undefined' !== typeof param.authenticated ? param.authenticated : true;
      state.generalParameters.isAdmin =
        'undefined' !== typeof param.isAdmin ? param.isAdmin : false;
      state.generalParameters.isRoleLive =
        'undefined' !== typeof param.isRoleLive ? param.isRoleLive : true;
      state.generalParameters.isCommments =
        'undefined' !== typeof param.isCommments ? param.isCommments : true;
      state.generalParameters.isOrganisation =
        'undefined' !== typeof param.isOrganisation
          ? param.isOrganisation
          : true;
      state.generalParameters.isPlaylist =
        'undefined' !== typeof param.isPlaylist ? param.isPlaylist : false;
      state.generalParameters.isProduction =
        'undefined' !== typeof param.isProduction ? param.isProduction : true;
      state.generalParameters.isContribution =
        'undefined' !== typeof param.isContribution
          ? param.isContribution
          : true;
      state.generalParameters.ApiUri =
        'undefined' !== typeof param.ApiUri
          ? param.ApiUri
          : 'https://api.dev2.saooti.org/';
      state.generalParameters.isIE11 =
        'undefined' !== typeof param.isIE11 ? param.isIE11 : false;
      state.generalParameters.podcastmaker =
        'undefined' !== typeof param.podcastmaker ? param.podcastmaker : false;
      state.generalParameters.buttonPlus =
        'undefined' !== typeof param.buttonPlus ? param.buttonPlus : true;
      state.generalParameters.allCategories =
        'undefined' !== typeof param.allCategories ? param.allCategories : [];
      state.generalParameters.isLiveTab =
        'undefined' !== typeof param.isLiveTab ? param.isLiveTab : true;
      state.generalParameters.isCaptchaTest =
        'undefined' !== typeof param.isCaptchaTest ? param.isCaptchaTest : true;
    }
    if (initObject.podcastPage) {
      let param = initObject.podcastPage;
      state.podcastPage.EditBox =
        'undefined' !== typeof param.EditBox ? param.EditBox : false;
      state.podcastPage.SharePlayer =
        'undefined' !== typeof param.SharePlayer ? param.SharePlayer : true;
      state.podcastPage.ShareButtons =
        'undefined' !== typeof param.ShareButtons ? param.ShareButtons : true;
      state.podcastPage.ShareDistribution =
        'undefined' !== typeof param.ShareDistribution
          ? param.ShareDistribution
          : true;
      state.podcastPage.MiniplayerUri =
        'undefined' !== typeof param.MiniplayerUri
          ? param.MiniplayerUri
          : 'https://player.dev2.saooti.org/';
      state.podcastPage.ouestFranceStyle =
        'undefined' !== typeof param.ouestFranceStyle
          ? param.ouestFranceStyle
          : false;
      state.podcastPage.tagList =
        'undefined' !== typeof param.tagList ? param.tagList : false;
      state.podcastPage.downloadButton =
        'undefined' !== typeof param.downloadButton
          ? param.downloadButton
          : false;
      state.podcastPage.hlsUri =
        'undefined' !== typeof param.hlsUri
          ? param.hlsUri
          : 'https://hls.dev2.saooti.org/';
    }
    if (initObject.podcastsPage) {
      let param = initObject.podcastsPage;
      state.podcastsPage.ProductorSearch =
        'undefined' !== typeof param.ProductorSearch
          ? param.ProductorSearch
          : true;
      state.podcastsPage.MonetizableFilter =
        'undefined' !== typeof param.MonetizableFilter
          ? param.MonetizableFilter
          : true;
      state.podcastsPage.podcastShadow =
        'undefined' !== typeof param.podcastShadow ? param.podcastShadow : true;
      state.podcastsPage.podcastBorderBottom =
        'undefined' !== typeof param.podcastBorderBottom
          ? param.podcastBorderBottom
          : false;
      state.podcastsPage.titlePage =
        'undefined' !== typeof param.titlePage ? param.titlePage : undefined;
      state.podcastsPage.emissionChooser =
        'undefined' !== typeof param.emissionChooser
          ? param.emissionChooser
          : false;
    }
    if (initObject.emissionsPage) {
      let param = initObject.emissionsPage;
      state.emissionsPage.smallItems =
        'undefined' !== typeof param.smallItems ? param.smallItems : false;
      state.emissionsPage.lightItems =
        'undefined' !== typeof param.lightItems ? param.lightItems : false;
      state.emissionsPage.titlePage =
        'undefined' !== typeof param.titlePage ? param.titlePage : undefined;
      state.emissionsPage.itemPlayer =
        'undefined' !== typeof param.itemPlayer ? param.itemPlayer : false;
      state.emissionsPage.rubriquage =
        'undefined' !== typeof param.rubriquage ? param.rubriquage : undefined;
      state.emissionsPage.mainRubrique =
        'undefined' !== typeof param.mainRubrique
          ? param.mainRubrique
          : undefined;
      state.emissionsPage.buttonMore =
        'undefined' !== typeof param.buttonMore ? param.buttonMore : false;
      state.emissionsPage.overflowScroll =
        'undefined' !== typeof param.overflowScroll
          ? param.overflowScroll
          : false;
    }
    if (initObject.emissionPage) {
      let param = initObject.emissionPage;
      state.emissionPage.ouestFranceStyle =
        'undefined' !== typeof param.ouestFranceStyle
          ? param.ouestFranceStyle
          : false;
      state.emissionPage.rssButton =
        'undefined' !== typeof param.rssButton ? param.rssButton : false;
    }
    if (initObject.intervenantPage) {
      let param = initObject.intervenantPage;
      state.intervenantPage.lightStyle =
        'undefined' !== typeof param.lightStyle ? param.lightStyle : false;
      state.intervenantPage.rssButton =
        'undefined' !== typeof param.rssButton ? param.rssButton : false;
    }
    if (initObject.searchPage) {
      let param = initObject.searchPage;
      state.searchPage.hideBar =
        'undefined' !== typeof param.hideBar ? param.hideBar : false;
    }
    if (initObject.player) {
      let param = initObject.player;
      state.player.image =
        'undefined' !== typeof param.image ? param.image : true;
      state.player.emissionName =
        'undefined' !== typeof param.emissionName ? param.emissionName : false;
      state.player.clock =
        'undefined' !== typeof param.clock ? param.clock : false;
      state.player.barTop =
        'undefined' !== typeof param.barTop ? param.barTop : false;
    }
    if (initObject.organisation) {
      let param = initObject.organisation;
      state.organisation.imageUrl =
        'undefined' !== typeof param.imageUrl
          ? param.imageUrl
          : '/img/emptypodcast.png';
      state.organisation.name =
        'undefined' !== typeof param.name ? param.name : 'Saooti';
      state.organisation.userName =
        'undefined' !== typeof param.userName ? param.userName : '';
    }
    if (initObject.footer) {
      let param = initObject.footer;
      state.footer.contactLink =
        'undefined' !== typeof param.contactLink
          ? param.contactLink
          : undefined;
    }
    if (initObject.octopusApi) {
      let param = initObject.octopusApi;
      state.octopusApi.url =
        'undefined' !== typeof param.url
          ? param.url
          : 'http://api.dev2.saooti.org/';
      state.octopusApi.oAuthParam =
        'undefined' !== typeof param.oAuthParam ? param.oAuthParam : undefined;
      state.octopusApi.commentsUrl =
        'undefined' !== typeof param.commentsUrl
          ? param.commentsUrl
          : 'http://comments.dev2.saooti.org/';
      if (state.generalParameters.podcastmaker) {
        state.octopusApi.organisationId =
          'undefined' !== typeof param.organisationId
            ? param.organisationId
            : undefined;
      }
      let error = octopusApi.initialize(state.octopusApi);
      if (error) {
        reject();
      } else if (0 === state.generalParameters.allCategories.length) {
        octopusApi.fetchCategories({ lang: 'fr' }).then(data => {
          state.generalParameters.allCategories = data;
          resolve();
        });
      } else {
        resolve();
      }
    } else {
      reject();
    }
  });
};

export { initialize, state };
