//Pages
export const getLives = () => import("./src/components/pages/LivesPage.vue");
export const getPodcast = () => import("./src/components/pages/PodcastPage.vue");
export const getPodcasts = () => import("./src/components/pages/PodcastsPage.vue");
export const getEmission = () => import("./src/components/pages/EmissionPage.vue");
export const getEmissions = () => import("./src/components/pages/EmissionsPage.vue");
export const getPlaylist = () => import("./src/components/pages/PlaylistPage.vue");
export const getPlaylists = () => import("./src/components/pages/PlaylistsPage.vue");
export const getParticipant = () => import("./src/components/pages/ParticipantPage.vue");
export const getParticipants = () => import("./src/components/pages/ParticipantsPage.vue");
export const getSearch = () => import("./src/components/pages/SearchPage.vue");
export const getHome = () => import("./src/components/pages/HomePage.vue");
export const getCategory = () => import("./src/components/pages/CategoryPage.vue");
export const getRubrique = () => import("./src/components/pages/RubriquePage.vue");
export const getTag = () => import("./src/components/pages/TagPage.vue");
export const getError403Page = () => import("./src/components/pages/Error403Page.vue");
export const getRadio = () => import("./src/components/pages/RadioPage.vue");
export const getVideo = () => import("./src/components/pages/VideoPage.vue");
export const getMapPage= () => import("./src/components/pages/MapPage.vue");
export const getPageNotFound= () => import("./src/components/pages/PageNotFound.vue");
export const getPageLogout= () => import("./src/components/pages/PageLogout.vue");

//Misc
export const getAccordion = () => import("./src/components/misc/ClassicAccordion.vue");
export const getNav = () => import("./src/components/misc/ClassicNav.vue");
export const getProgressBar = () => import("./src/components/misc/ProgressBar.vue");
export const getSpinner = () => import("./src/components/misc/ClassicSpinner.vue");
export const getFooter = () => import("./src/components/misc/FooterSection.vue");
export const getPlayer = () => import("./src/components/misc/player/PlayerComponent.vue");
export const getSnackbar = () => import("./src/components/misc/SnackBar.vue");
export const getTopBar = () => import("./src/components/misc/TopBar.vue");
export const getMobileMenu = () => import("./src/components/misc/MobileMenu.vue");
export const getHomeDropdown = () => import("./src/components/misc/HomeDropdown.vue");
export const getMessageModal = () => import("./src/components/misc/modal/MessageModal.vue");
export const getErrorMessage = () => import("./src/components/misc/ErrorMessage.vue");
export const getPopover = () => import("./src/components/misc/ClassicPopover.vue");
export const getClassicModal = () => import("./src/components/misc/modal/ClassicModal.vue");
export const getClassicLazy = () => import("./src/components/misc/ClassicLazy.vue");
export const getContractPreviewModal = () => import("./src/components/misc/modal/ContractPreviewModal.vue");
export const getClassicModalInBody = () => import("./src/components/misc/modal/ClassicModalInBody.vue");
export const getClassicHelpButton = () => import("./src/components/misc/ClassicHelpButton.vue");
export const getClassicAlert = () => import("./src/components/misc/ClassicAlert.vue");
export const getClassicBigChip = () => import("./src/components/misc/ClassicBigChip.vue");

import ClassicDataTable, { type ClassicDataTableHeader } from "./src/components/misc/ClassicDataTable.vue";
import ClassicNotifications from "./src/components/misc/ClassicNotifications.vue";

export {
    ClassicDataTable,
    type ClassicDataTableHeader,
    ClassicNotifications
}

// Buttons
import ActionButton from "./src/components/buttons/ActionButton.vue";
export { ActionButton };

//Display
export const getCategoryChooser = () => import("./src/components/display/categories/CategoryChooser.vue");
export const getCategoryList = () => import("./src/components/display/categories/CategoryList.vue");
export const getCategoryFilter = () => import("./src/components/display/categories/CategoryFilter.vue");
export const getEmissionList = () => import("./src/components/display/emission/EmissionList.vue");
export const getEmissionGroupChooser = () => import("./src/components/display/emission/EmissionGroupChooser.vue");
export const getOrganisationChooser = () => import("./src/components/display/organisation/OrganisationChooser.vue");
export const getPodcastFilterList = () => import("./src/components/display/podcasts/PodcastFilterList.vue");
export const getPodcastInlineList = () => import("./src/components/display/podcasts/PodcastInlineList.vue");
export const getPodcastList = () => import("./src/components/display/podcasts/PodcastList.vue");
export const getShareButtons = () => import("./src/components/display/sharing/ShareSocialsButtons.vue");
export const getShareAnonymous = () => import("./src/components/display/sharing/ShareAnonymous.vue");
export const getShareNewsletter = () => import("./src/components/display/sharing/ShareNewsletter.vue");
export const getQrCode = () => import("./src/components/display/sharing/QrCode.vue");



export const getEmissionInlineList = () => import("./src/components/display/emission/EmissionInlineList.vue");
export const getRubriqueChooser = () => import("./src/components/display/rubriques/RubriqueChooser.vue");
export const getCommentList = () => import("./src/components/display/comments/CommentList.vue");
export const getCommentInput = () => import("./src/components/display/comments/CommentInput.vue");
export const getCommentSection = () => import("./src/components/display/comments/CommentSection.vue");
export const getPodcastPlaylistInlineList = () => import("./src/components/display/playlist/PodcastPlaylistInlineList.vue");
export const getLiveList = () => import("./src/components/display/live/LiveList.vue");
export const getEmissionPresentationList = () => import("./src/components/display/emission/EmissionPresentationList.vue");
export const getPodcastPlayButton = () => import("./src/components/display/podcasts/PodcastPlayButton.vue");
export const getParticipantInlineList = () => import("./src/components/display/participant/ParticipantInlineList.vue");
export const getPodcastPresentationList = () => import("./src/components/display/podcasts/PodcastPresentationList.vue");

//Radio
export const getRadioCurrently = () => import("./src/components/display/live/RadioCurrently.vue");
export const getRadioPlanning = () => import("./src/components/display/live/RadioPlanning.vue");


//AdvancedSearch
export const getAdvancedSearch = () => import("./src/components/display/filter/AdvancedSearch.vue");
export const getRubriqueFilter = () => import("./src/components/display/filter/RubriqueFilter.vue");
export const getDateFilter = () => import("./src/components/display/filter/DateFilter.vue");
export const getSearchOrder = () => import("./src/components/display/filter/SearchOrder.vue");

//form
export const getClassicSearch = () => import("./src/components/form/ClassicSearch.vue");
export const getClassicCheckbox = () => import("./src/components/form/ClassicCheckbox.vue");
export const getClassicRadio = () => import("./src/components/form/ClassicRadio.vue");
export const getClassicRadioLabel = () => import("./src/components/form/ClassicRadioLabel.vue");
export const getClassicLoading = () => import("./src/components/form/ClassicLoading.vue");
export const getClassicSelect = () => import("./src/components/form/ClassicSelect.vue");
export const getClassicDatePicker = () => import("./src/components/form/ClassicDatePicker.vue");
export const getPaginate = () => import("./src/components/display/list/PaginateSection.vue");
export const getPaginateParams = () => import("./src/components/display/list/PaginateParams.vue");
export const getListPaginate = () => import("./src/components/display/list/ListPaginate.vue");
export const getClassicMultiselect = () => import("./src/components/form/ClassicMultiselect.vue");
export const getClassicInputText = () => import("./src/components/form/ClassicInputText.vue");
export const getClassicEmojiPicker = () => import("./src/components/form/ClassicEmojiPicker.vue");
export const getClassicContentEditable = () => import("./src/components/form/ClassicContentEditable.vue");
export const getSwiperList = () => import("./src/components/display/list/SwiperList.vue");
export const getClassicCopyButton = () => import("./src/components/form/ClassicCopyButton.vue");
export const getClassicTagInput = () => import("./src/components/form/ClassicTagInput.vue");
export const getClassicWysiwyg = () => import("./src/components/form/ClassicWysiwyg.vue");

//Composable
import {useResizePhone} from "./src/components/composable/useResizePhone";
import {useTagOf} from "./src/components/composable/useTagOf.ts";
import {useSelenium} from "./src/components/composable/useSelenium.ts";
import {useImageProxy} from "./src/components/composable/useImageProxy.ts";
import {useMetaTitle} from "./src/components/composable/useMetaTitle.ts";
import {useMetaTitleWatch} from "./src/components/composable/useMetaTitleWatch.ts";
import {useOrganisationFilter} from "./src/components/composable/useOrganisationFilter.ts";
import {useInit} from "./src/components/composable/useInit.ts";
import {useErrorHandler} from "./src/components/composable/useErrorHandler.ts";
import { useSimplePageParam } from "./src/components/composable/route/useSimplePageParam";
import { useNotifications } from "./src/components/composable/useNotifications.ts";

//helper
import domHelper from "./src/helper/domHelper.ts";
import durationHelper from "./src/helper/durationHelper.ts";
import stringHelper from "./src/helper/stringHelper.ts";
import fetchHelper from "./src/helper/fetchHelper.ts";
import cookiesHelper from "./src/helper/cookiesHelper.ts";
import downloadHelper from "./src/helper/downloadHelper.ts";
import displayHelper from "./src/helper/displayHelper.ts";
import debounce from "./src/helper/debounceHelper.ts";
import { deepEqual } from "./src/helper/equals.ts";

//stores
import {useVastStore} from "./src/stores/VastStore.ts";
import {useSaveFetchStore} from "./src/stores/SaveFetchStore.ts";
import {usePlayerStore} from "./src/stores/PlayerStore.ts";
import {useGeneralStore} from "./src/stores/GeneralStore.ts";
import {useFilterStore} from "./src/stores/FilterStore.ts";
import {useCommentStore} from "./src/stores/CommentStore.ts";
import {useApiStore} from "./src/stores/ApiStore.ts";
import {useAuthStore} from "./src/stores/AuthStore.ts";
import {getApiUrl, ModuleApi} from "./src/api/apiConnection.ts";
import classicApi from "./src/api/classicApi.ts";

// API
export { emissionApi } from "./src/api/emissionApi.ts";
export * from "./src/api/groupsApi.ts";
export { organisationApi } from "./src/api/organisationApi.ts";
export { playlistApi } from "./src/api/playlistApi.ts";
export { podcastApi, PodcastSort, type PodcastSearchOptions } from "./src/api/podcastApi.ts";

// Types
export { type Emission, emptyEmissionData } from "./src/stores/class/general/emission.ts";
export { type Annotations } from "./src/stores/class/general";

//Icons
export const getAmazonMusicIcon = () => import("./src/components/icons/AmazonMusicIcon.vue");
export const getApplePodcastIcon = () => import("./src/components/icons/ApplePodcastIcon.vue");
export const getDeezerIcon = () => import("./src/components/icons/DeezerIcon.vue");
export const getEditFtpIcon = () => import("./src/components/icons/EditFtpIcon.vue");
export const getIHeartIcon = () => import("./src/components/icons/IHeartIcon.vue");
export const getPlayerFmIcon = () => import("./src/components/icons/PlayerFmIcon.vue");
export const getPlayVideoIcon = () => import("./src/components/icons/PlayVideoIcon.vue");
export const getPocketCastIcon = () => import("./src/components/icons/PocketCastIcon.vue");
export const getPodcastAddictIcon = () => import("./src/components/icons/PodcastAddictIcon.vue");
export const getRadiolineIcon = () => import("./src/components/icons/RadiolineIcon.vue");
export const getTuninIcon = () => import("./src/components/icons/TuninIcon.vue");
export const getXIcon = () => import("./src/components/icons/XIcon.vue");

// Layouts
export const getSimpleLayout = () => import("./src/layouts/SimpleLayout.vue");

// Routing
import { setupRouter, getSimpleRouteProps, getRouteProps } from './src/router/utils';
import { routes as sdkRoutes } from './src/router/routes';

// Types
import { type SelectOption } from "./src/components/form/ClassicSelect.vue";

import { ROUTE_PARAMS } from "./src/components/composable/route/types";

export {
    useResizePhone,
    useTagOf,
    useSelenium,
    useImageProxy,
    useMetaTitle,
    useMetaTitleWatch,
    useOrganisationFilter,
    useInit,
    useErrorHandler,
    useSimplePageParam,
    useNotifications,
    debounce,
    useVastStore,
    useSaveFetchStore,
    usePlayerStore,
    useGeneralStore,
    useFilterStore,
    useCommentStore,
    domHelper,
    durationHelper,
    stringHelper,
    fetchHelper,
    useApiStore,
    useAuthStore,
    getApiUrl,
    ModuleApi,
    classicApi,
    cookiesHelper,
    deepEqual,
    downloadHelper,
    displayHelper,
    setupRouter,
    getSimpleRouteProps,
    getRouteProps,
    sdkRoutes,
    SelectOption,
    ROUTE_PARAMS
};
