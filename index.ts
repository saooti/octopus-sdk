//Pages
export const getLives = () => import("./src/components/pages/Lives.vue");
export const getPodcast = () => import("./src/components/pages/Podcast.vue");
export const getPodcasts = () => import("./src/components/pages/Podcasts.vue");
export const getEmission = () => import("./src/components/pages/Emission.vue");
export const getEmissions = () => import("./src/components/pages/Emissions.vue");
export const getPlaylist = () => import("./src/components/pages/Playlist.vue");
export const getPlaylists = () => import("./src/components/pages/Playlists.vue");
export const getParticipant = () => import("./src/components/pages/Participant.vue");
export const getParticipants = () => import("./src/components/pages/Participants.vue");
export const getSearch = () => import("./src/components/pages/Search.vue");
export const getHome = () => import("./src/components/pages/Home.vue");
export const getCategory = () => import("./src/components/pages/Category.vue");
export const getRubrique = () => import("./src/components/pages/Rubrique.vue");
export const getError403Page = () => import("./src/components/pages/Error403Page.vue");
export const getRadio = () => import("./src/components/pages/Radio.vue");

//Misc
export const getAccordion = () => import("./src/components/misc/Accordion.vue");
export const getNav = () => import("./src/components/misc/Nav.vue");
export const getProgressBar = () => import("./src/components/misc/ProgressBar.vue");
export const getSpinner = () => import("./src/components/misc/Spinner.vue");
export const getFooter = () => import("./src/components/misc/Footer.vue");
export const getLeftMenu = () => import("./src/components/misc/LeftMenu.vue");
export const getPlayer = () => import("./src/components/misc/player/Player.vue");
export const getSnackbar = () => import("./src/components/misc/Snackbar.vue");
export const getTopBar = () => import("./src/components/misc/TopBar.vue");
export const getHomeDropdown = () => import("./src/components/misc/HomeDropdown.vue");
export const getMessageModal = () => import("./src/components/misc/modal/MessageModal.vue");
export const getErrorMessage = () => import("./src/components/misc/ErrorMessage.vue");
export const getPopover = () => import("./src/components/misc/Popover.vue");
export const getClassicModal = () => import("./src/components/misc/modal/ClassicModal.vue");


//Display
export const getCategoryChooser = () => import("./src/components/display/categories/CategoryChooser.vue");
export const getCategoryList = () => import("./src/components/display/categories/CategoryList.vue");
export const getCategoryFilter = () => import("./src/components/display/categories/CategoryFilter.vue");
export const getEmissionList = () => import("./src/components/display/emission/EmissionList.vue");
export const getOrganisationChooser = () => import("./src/components/display/organisation/OrganisationChooser.vue");
export const getPodcastFilterList = () => import("./src/components/display/podcasts/PodcastFilterList.vue");
export const getPodcastInlineList = () => import("./src/components/display/podcasts/PodcastInlineList.vue");
export const getPodcastList = () => import("./src/components/display/podcasts/PodcastList.vue");
export const getShareButtons = () => import("./src/components/display/sharing/ShareButtons.vue");
export const getEmissionInlineList = () => import("./src/components/display/emission/EmissionInlineList.vue");
export const getRubriqueChooser = () => import("./src/components/display/rubriques/RubriqueChooser.vue");
export const getCommentList = () => import("./src/components/display/comments/CommentList.vue");
export const getCommentInput = () => import("./src/components/display/comments/CommentInput.vue");
export const getPodcastPlaylistInlineList = () => import("./src/components/display/playlist/PodcastPlaylistInlineList.vue");


//AdvancedSearch
export const getAdvancedSearch = () => import("./src/components/display/filter/AdvancedSearch.vue");
export const getRubriqueFilter = () => import("./src/components/display/filter/RubriqueFilter.vue");
export const getDateFilter = () => import("./src/components/display/filter/DateFilter.vue");
export const getSearchOrder = () => import("./src/components/display/filter/SearchOrder.vue");

//form
export const getClassicSearch = () => import("./src/components/form/ClassicSearch.vue");
export const getClassicCheckbox = () => import("./src/components/form/ClassicCheckbox.vue");
export const getClassicRadio = () => import("./src/components/form/ClassicRadio.vue");
export const getClassicLoading = () => import("./src/components/form/ClassicLoading.vue");
export const getClassicSelect = () => import("./src/components/form/ClassicSelect.vue");
export const getClassicDatePicker = () => import("./src/components/form/ClassicDatePicker.vue");
export const getPaginate = () => import("./src/components/display/list/Paginate.vue");
export const getPaginateParams = () => import("./src/components/display/list/PaginateParams.vue");
export const getListPaginate = () => import("./src/components/display/list/ListPaginate.vue");
export const getClassicMultiselect = () => import("./src/components/form/ClassicMultiselect.vue");
export const getClassicInputText = () => import("./src/components/form/ClassicInputText.vue");

//mixins

import selenium from "./src/components/mixins/selenium.ts";
import cookies from "./src/components/mixins/cookies.ts";
import displayMethods from "./src/components/mixins/displayMethods.ts";
import imageProxy from "./src/components/mixins/imageProxy.ts";
import orgaFilter from "./src/components/mixins/organisationFilter.ts";
import initSDK from "./src/components/mixins/init.ts";
import tagOfMixins from "./src/components/mixins/tagOfMixins.ts";

export {
    selenium,
    cookies,
    displayMethods,
    imageProxy,
    orgaFilter,
    initSDK,
    tagOfMixins
};