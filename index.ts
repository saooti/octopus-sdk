//Pages
import Lives from "./src/components/pages/Lives.vue";
import Podcast from "./src/components/pages/Podcast.vue";
import Podcasts from "./src/components/pages/Podcasts.vue";
import Emission from "./src/components/pages/Emission.vue";
import Emissions from "./src/components/pages/Emissions.vue";
import Playlist from "./src/components/pages/Playlist.vue";
import Playlists from "./src/components/pages/Playlists.vue";
import Participant from "./src/components/pages/Participant.vue";
import Participants from "./src/components/pages/Participants.vue";
import Search from "./src/components/pages/Search.vue";
import Home from "./src/components/pages/Home.vue";
import Category from "./src/components/pages/Category.vue";
import Rubrique from "./src/components/pages/Rubrique.vue";
//Misc
import Footer from "./src/components/misc/Footer.vue";
import LeftMenu from "./src/components/misc/LeftMenu.vue";
import Player from "./src/components/misc/Player.vue";
import Snackbar from "./src/components/misc/Snackbar.vue";
import TopBar from "./src/components/misc/TopBar.vue";
import HomeDropdown from "./src/components/misc/HomeDropdown.vue";
import MessageModal from "./src/components/misc/modal/MessageModal.vue";
import ErrorMessage from "./src/components/misc/ErrorMessage.vue";
import Popover from "./src/components/misc/Popover.vue";
//Display
import CategoryChooser from "./src/components/display/categories/CategoryChooser.vue";
import CategoryList from "./src/components/display/categories/CategoryList.vue";
import CategoryFilter from "./src/components/display/categories/CategoryFilter.vue";
/*import EditBox from "./src/components/display/edit/EditBox.vue"; */
import EmissionChooser from "./src/components/display/emission/EmissionChooser.vue";
/* import EmissionItem from "./src/components/display/emission/EmissionItem.vue"; */
/*import EmissionList from "./src/components/display/emission/EmissionList.vue";
import MonetizableFilter from "./src/components/display/filter/MonetizableFilter.vue";
import ProductorSearch from "./src/components/display/filter/ProductorSearch.vue";*/
import OrganisationChooser from "./src/components/display/organisation/OrganisationChooser.vue";
/*import ParticipantItem from "./src/components/display/participant/ParticipantItem.vue";
import ParticipantList from "./src/components/display/participant/ParticipantList.vue";
import AnimatorsItem from "./src/components/display/podcasts/AnimatorsItem.vue";*/
import PodcastFilterList from "./src/components/display/podcasts/PodcastFilterList.vue";
/*import PodcastImage from "./src/components/display/podcasts/PodcastImage.vue";*/
import PodcastInlineList from "./src/components/display/podcasts/PodcastInlineList.vue";
/*import PodcastItem from "./src/components/display/podcasts/PodcastItem.vue";*/
import PodcastList from "./src/components/display/podcasts/PodcastList.vue";
import ShareButtons from "./src/components/display/sharing/ShareButtons.vue";
/*import ShareDistribution from "./src/components/display/sharing/ShareDistribution.vue";
import SharePlayer from "./src/components/display/sharing/SharePlayer.vue"; */
import EmissionInlineList from "./src/components/display/emission/EmissionInlineList.vue";
import RubriqueChooser from "./src/components/display/rubriques/RubriqueChooser.vue";
import CommentList from "./src/components/display/comments/CommentList.vue";
import CommentInput from "./src/components/display/comments/CommentInput.vue";

//form
import ClassicSearch from "./src/components/form/ClassicSearch.vue";
import ClassicCheckbox from "./src/components/form/ClassicCheckbox.vue";
import ClassicRadio from "./src/components/form/ClassicRadio.vue";
import ClassicLoading from "./src/components/form/ClassicLoading.vue";

//mixins
import {selenium} from "./src/components/mixins/functions";
import {cookies} from "./src/components/mixins/functions";
import {displayMethods} from "./src/components/mixins/functions";
import {orgaFilter} from "./src/components/mixins/organisationFilter";
import {initSDK} from "./src/components/mixins/init";
import {tagOfMixins} from "./src/components/mixins/tagOfMixins";

const components = {
    Lives,
    Podcast,
    Podcasts,
    Emission,
    Emissions,
    Playlist,
    Playlists,
    Participant,
    Participants,
    Search,
    Home,
    Category,
    Footer,
    LeftMenu,
    Player,
    TopBar,
    CategoryChooser,
    CategoryList,
    PodcastInlineList,
    EmissionChooser,
    /* EmissionItem, */
    OrganisationChooser,
    PodcastFilterList,
    ShareButtons,
    PodcastList,
    EmissionInlineList,
    RubriqueChooser,
    Snackbar,
    selenium,
    cookies,
    MessageModal,
    CommentList,
    CommentInput,
    HomeDropdown,
    ErrorMessage,
    displayMethods,
    Rubrique,
    CategoryFilter,
    orgaFilter,
    initSDK,
    Popover,
    tagOfMixins,
    ClassicSearch,
    ClassicCheckbox,
    ClassicRadio,
    ClassicLoading
}

export default components;

export {
    Lives,
    Podcast,
    Podcasts,
    Emission,
    Emissions,
    Playlist,
    Playlists,
    Participant,
    Participants,
    Search,
    Home,
    Category,
    Footer,
    LeftMenu,
    Player,
    TopBar,
    CategoryChooser,
    CategoryList,
    PodcastInlineList,
    EmissionChooser,
    /* EmissionItem, */
    OrganisationChooser,
    PodcastFilterList,
    ShareButtons,
    PodcastList,
    EmissionInlineList,
    RubriqueChooser,
    Snackbar,
    selenium,
    cookies,
    MessageModal,
    CommentList,
    CommentInput,
    HomeDropdown,
    ErrorMessage,
    displayMethods,
    Rubrique,
    CategoryFilter,
    orgaFilter,
    initSDK,
    Popover,
    tagOfMixins,
    ClassicSearch,
    ClassicCheckbox,
    ClassicRadio,
    ClassicLoading
};