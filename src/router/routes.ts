import { RouteLocationNormalized, RouteRecordSingleView, RouteRecordSingleViewWithChildren } from "vue-router";

import { getRouteProps, getSimpleRouteProps } from "./utils";

const Home = () => import("../components/pages/HomePage.vue");
const MapPage = () => import("../components/pages/MapPage.vue");
const PodcastsPage = () => import("../components/pages/PodcastsPage.vue");
const EmissionPage = () => import("../components/pages/EmissionPage.vue");
const EmissionsPage = () => import("../components/pages/EmissionsPage.vue");
const ParticpantsPage = () => import("../components/pages/ParticipantsPage.vue");
const PodcastPage = () => import("../components/pages/PodcastPage.vue");
const ParticipantPage = () => import("../components/pages/ParticipantPage.vue");
const SearchPage = () => import("../components/pages/SearchPage.vue");
const CategoryPage = () => import("../components/pages/CategoryPage.vue");
const RubriquePage = () => import("../components/pages/RubriquePage.vue");
const TagPage = () => import("../components/pages/TagPage.vue");
const LivesPage = () => import("../components/pages/LivesPage.vue");
const PlaylistPage = () => import("../components/pages/PlaylistPage.vue");
const PlaylistsPage = () => import("../components/pages/PlaylistsPage.vue");
const error403Page = () => import("../components/pages/Error403Page.vue");
const PageNotFound = () => import("../components/pages/PageNotFound.vue");
const RadioPage = () => import("../components/pages/RadioPage.vue");
const VideoPage = () => import("../components/pages/VideoPage.vue");
const PageLogout = () => import("../components/pages/PageLogout.vue");
const SmartLinkPage = () => import("../components/pages/SmartLinkPage.vue");

export const routes: Array<RouteRecordSingleView|RouteRecordSingleViewWithChildren> = [
  /*--------------------------------------------------------------------------
  Liens publics
  --------------------------------------------------------------------------*/
  {
    path: "/main/pub/error",
    name: "error",
    component: error403Page,
  },
  {
    path: "/main/pub/home",
    name: "home",
    component: Home,
    meta:{
      title: "Home",
    }
  },
  {
    path: "/main/pub/map",
    name: "map",
    component: MapPage,
    meta:{
      title: "Site map",
    }
  },
  {
    path: "/main/pub/search/:query?",
    name: "search",
    component: SearchPage,
    props: (route: RouteLocationNormalized) => ({
      queryRoute: route.params.query,
    }),
    meta:{
      title: "Search",
    }
  },
  {
    path: "/main/pub/podcasts/",
    name: "podcasts",
    component: PodcastsPage,
    props: getRouteProps,
    meta:{
      title: "Podcasts",
    }
  },
  {
    path: "/main/pub/emissions/",
    name: "emissions",
    component: EmissionsPage,
    props: getRouteProps,
    meta:{
      title: "Emissions",
    }
  },
  {
    path: "/main/pub/participants",
    name: "participants",
    component: ParticpantsPage,
    props: (route: RouteLocationNormalized) => ({
      ...getSimpleRouteProps(route),
      routeOrga:route.query.o,
    }),
    meta:{
      title: "Speakers",
    }
  },
  {
    path: "/main/pub/emission/:emissionId(\\d+):title([^?/]*)?:productor?",
    name: "emission",
    component: EmissionPage,
    props: (route: RouteLocationNormalized) => ({
      ...getSimpleRouteProps(route),
      emissionId: parseInt(route.params.emissionId.toString(), 10),
    }),
    meta:{
      title: "",
      noScroll:true
    }
  },
  {
    path: "/main/pub/podcast/:podcastId(\\d+):title([^?]*)?:productor?",
    name: "podcast",
    component: PodcastPage,
    props: (route: RouteLocationNormalized) => ({
      podcastId: parseInt(route.params.podcastId.toString(), 10)
    }),
    meta:{
      title: ""
    }
  },
  {
    path: "/main/pub/video/:podcastId(\\d+):title([^?]*)?:productor?",
    name: "video",
    component: VideoPage,
    props: (route: RouteLocationNormalized) => ({
      podcastId: parseInt(route.params.podcastId.toString(), 10),
    }),
    meta:{
      title: ""
    }
  },
  {
    path: "/main/pub/participant/:participantId(\\d+):title([^?]*)?:productor?",
    name: "participant",
    component: ParticipantPage,
    props: (route: RouteLocationNormalized) => ({
      ...getSimpleRouteProps(route),
      participantId: parseInt(route.params.participantId.toString(), 10),
    }),
    meta:{
      title: "",
      noScroll:true
    }
  },
  {
    path: "/main/pub/category/:iabId/:productor?",
    name: "category",
    component: CategoryPage,
    props: (route: RouteLocationNormalized) => ({
      iabId: parseInt(route.params.iabId.toString(), 10),
      productor: route.params.productor,
    }),
    meta:{
      title: "",
    }
  },
  {
    path: "/main/pub/rubrique/:rubriqueId(\\d+):title([^?]*)?:productor?",
    name: "rubrique",
    component: RubriquePage,
    props: (route: RouteLocationNormalized) => ({
      ...getSimpleRouteProps(route),
      rubriqueId: parseInt(route.params.rubriqueId.toString(), 10),
      routeOrga:route.query.o,
    }),
    meta:{
      title: "",
    }
  },
  {
    path: "/main/pub/tag/:tag([^?]*)?:productor?",
    name: "tag",
    component: TagPage,
    props: (route: RouteLocationNormalized) => ({
      ...getSimpleRouteProps(route),
      tag: route.params.tag,
      routeOrga:route.query.o,
    }),
    meta:{
      title: "",
    }
  },
  {
    path: "/main/pub/lives/:productor?",
    name: "lives",
    component: LivesPage,
    props: (route: RouteLocationNormalized) => ({
      productor: route.params.productor,
    }),
    meta:{
      title: "Radio & Live",
    }
  },
  {
    path: "/main/pub/radio/:canalId(\\d+):title([^?]*)?:productor?",
    name: "radio",
    component: RadioPage,
    props: (route: RouteLocationNormalized) => ({
      canalId: parseInt(route.params.canalId.toString(), 10),
    }),
    meta:{
      title: ""
    }
  },
  {
    path: "/main/pub/playlists/",
    name: "playlists",
    component: PlaylistsPage,
    props: (route: RouteLocationNormalized) => ({
      ...getSimpleRouteProps(route),
      routeOrga:route.query.o,
    }),
    meta:{
      title: "Playlists"
    }
  },
  {
    path: "/main/pub/playlist/:playlistId(\\d+):title([^?/]*)?:productor?",
    name: "playlist",
    component: PlaylistPage,
    props: (route: RouteLocationNormalized) => ({
      ...getSimpleRouteProps(route),
      playlistId: parseInt(route.params.playlistId.toString(), 10),
    }),
    meta:{
      title: "",
      noScroll:true
    }
  },
  {
    path: "/smartlink/e/:emissionId(\\d+):title([^?/]*)?:productor?",
    name: "emission-smartlink",
    component: SmartLinkPage,
    props: (route: RouteLocationNormalized) => ({
      emissionId: parseInt(route.params.emissionId.toString(), 10),
    }),
    meta:{
      title: "",
      noScroll:true,
      layout: () => import('../layouts/SimpleLayout.vue')
    }
  },
  {
    path: "/smartlink/p/:playlistId(\\d+):title([^?/]*)?:productor?",
    name: "playlist-smartlink",
    component: SmartLinkPage,
    props: (route: RouteLocationNormalized) => ({
      playlistId: parseInt(route.params.playlistId.toString(), 10),
    }),
    meta:{
      title: "",
      noScroll:true,
      layout: () => import('../layouts/SimpleLayout.vue')
    }
  },
  { path: "/logout", component: PageLogout },
  { path: "/sso/logout", component: PageLogout },
  { path: "/:pathMatch(.*)*", component: PageNotFound },
];
