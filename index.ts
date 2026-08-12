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
export const getClassicTabs = () => import("./src/components/misc/ClassicTabs.vue");

import ClassicDataTable, { type ClassicDataTableHeader } from "./src/components/misc/ClassicDataTable.vue";
import ClassicNotifications from "./src/components/misc/ClassicNotifications.vue";
export { type Tab } from "./src/components/misc/ClassicTabs.vue";

export {
    ClassicDataTable,
    type ClassicDataTableHeader,
    ClassicNotifications
}

// Buttons
export * from "./src/components/buttons/";

// Form
import ClassicButtonGroup from "./src/components/form/ClassicButtonGroup.vue";
import OctopusMultiselect from "./src/components/form/OctopusMultiselect.vue";
import OctopusSelect from "./src/components/form/OctopusSelect.vue";
export { ClassicButtonGroup, OctopusMultiselect, OctopusSelect };
export type { ButtonGroupOption } from "./src/components/form/ClassicButtonGroup.vue";

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
export const getPlaylistPodcastList = () => import("./src/components/display/playlist/PodcastList.vue");
export const getShareButtons = () => import("./src/components/display/sharing/ShareSocialsButtons.vue");
export const getShareAnonymous = () => import("./src/components/display/sharing/ShareAnonymous.vue");
export const getShareNewsletter = () => import("./src/components/display/sharing/ShareNewsletter.vue");
export const getQrCode = () => import("./src/components/display/sharing/QrCode.vue");
export const SubscribeButtons = defineAsyncComponent(() => import("./src/components/display/sharing/SubscribeButtons.vue"));
export const PodcastSeasonInfo = defineAsyncComponent(() => import("./src/components/display/podcasts/PodcastSeasonInfo.vue"));
export const RightsIndicator = defineAsyncComponent(() => import("./src/components/display/RightsIndicator.vue"));


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
import { useRights, ActionRight } from "./src/components/composable/useRights";
import {useResizePhone} from "./src/components/composable/useResizePhone";
import {useTagOf} from "./src/components/composable/useTagOf";
import {useSelenium} from "./src/components/composable/useSelenium";
import {useImageProxy} from "./src/components/composable/useImageProxy";
import {useMetaTitle} from "./src/components/composable/useMetaTitle";
import {useMetaTitleWatch} from "./src/components/composable/useMetaTitleWatch";
import {useOrganisationFilter} from "./src/components/composable/useOrganisationFilter";
import {useInit} from "./src/components/composable/useInit";
import {useErrorHandler} from "./src/components/composable/useErrorHandler";
import { useSimplePageParam } from "./src/components/composable/route/useSimplePageParam";
export { CHECK_TOKEN_KEY, LOAD_LOCALE_MESSAGES_KEY } from "./src/components/composable/keys";
export { useSharePlatforms, PREDEFINED_PLATFORMS, SharePlatformName, type SharePlatform } from "./src/components/composable/share/useSharePlatforms";
export { useSharePath } from "./src/components/composable/share/useSharePath";
export { useOrgaComputed } from "./src/components/composable/useOrgaComputed";
export { useSeoTitleUrl } from "./src/components/composable/route/useSeoTitleUrl";
export { useSeasonsManagement } from "./src/components/composable/useSeasonsManagement";
export { useTranslation } from "./src/components/composable/useTranslation";
export { useDayjs } from "./src/components/composable/useDayjs";
export { useSticky } from "./src/components/composable/useSticky";

//helper
import domHelper from "./src/helper/domHelper";
import durationHelper from "./src/helper/durationHelper";
import stringHelper from "./src/helper/stringHelper";
import fetchHelper from "./src/helper/fetchHelper";
import cookiesHelper from "./src/helper/cookiesHelper";
import downloadHelper from "./src/helper/downloadHelper";
import displayHelper from "./src/helper/displayHelper";
import debounce from "./src/helper/debounceHelper";
import { deepEqual } from "./src/helper/equals";
export { colorFromString } from './src/helper/colorFromString';
export * from './src/helper/rubriquesHelper';

//stores
import {useVastStore} from "./src/stores/VastStore";
import {useSaveFetchStore} from "./src/stores/SaveFetchStore";
import {usePlayerStore} from "./src/stores/PlayerStore";
import {useGeneralStore} from "./src/stores/GeneralStore";
import {useFilterStore} from "./src/stores/FilterStore";
import {useCommentStore} from "./src/stores/CommentStore";
import {useApiStore} from "./src/stores/ApiStore";
import {useAuthStore} from "./src/stores/AuthStore";
export * from "./src/stores/NotificationStore";
import {getApiUrl, ModuleApi} from "./src/api/apiConnection";
import classicApi from "./src/api/classicApi";

// API
export * from "./src/api";

// Types
export { type Emission, SeasonMode, emptyEmissionData } from "./src/stores/class/general/emission";
export { type Organisation, type OrganisationAttributes, emptyOrganisationData, emptyOrgaData } from "./src/stores/class/general/organisation";
export { type Podcast, type SimplifiedPodcast, type PodcastAvailability, PodcastType, podcastToSimplified } from "./src/stores/class/general/podcast";
export { type Playlist, type PlaylistRule } from "./src/stores/class/general/playlist";
export { type Annotations } from "./src/stores/class/general";
export {
    CreateTranslation,
    type TranslationConfiguration,
    defaultTranslationConfig,
    defaultModifyPodcastConfig,
    defaultTtsParams,
    type ModifyPodcastConfig,
    ModifyPodcastEnum,
    type TranscriptParams,
    type TtsParams,
    type ProviderTts,
    type Voice
} from "./src/stores/class/transcript/transcriptParams";
export { type Rubrique } from "./src/stores/class/rubrique/rubrique";
export { type Rubriquage, RubriquageMode, RUBRIQUAGE_HOMEORDER_RESET } from "./src/stores/class/rubrique/rubriquage";
export { type Cartouchier } from "./src/stores/class/cartouchier/cartouchier";
export { type Cartouche, emptyCartouche } from "./src/stores/class/cartouchier/cartouche";
export { type PlaylistMedia } from "./src/stores/class/radio/playlistMedia";
export * from "./src/stores/class/radio/canal";

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

// Podcastmaker
export const PodcastmakerHeader = defineAsyncComponent(() => import("./src/components/display/podcastmaker/PodcastmakerHeader.vue"));

// Layouts
export const getSimpleLayout = () => import("./src/layouts/SimpleLayout.vue");

// Routing
export { setupRouter, getSimpleRouteProps, getRouteProps, overwriteRoutes } from './src/router/utils';
export { routes as sdkRoutes } from './src/router/routes';

// Types
import { type SelectOption } from "./src/components/form/ClassicSelect.vue";

import { ROUTE_PARAMS } from "./src/components/composable/route/types";
import { defineAsyncComponent } from "vue";

export {
    useRights,
    ActionRight,
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
    SelectOption,
    ROUTE_PARAMS
};
