import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";

/*--------------------------------------------------------------------------
Composants publics
--------------------------------------------------------------------------*/

const Home = () => import("@/components/pages/HomePage.vue");
const PodcastsPage = () => import("@/components/pages/PodcastsPage.vue");
const EmissionPage = () => import("@/components/pages/EmissionPage.vue");
const EmissionsPage = () => import("@/components/pages/EmissionsPage.vue");
const ParticpantsPage = () => import("@/components/pages/ParticipantsPage.vue");
const PodcastPage = () => import("@/components/pages/PodcastPage.vue");
const ParticipantPage = () => import("@/components/pages/ParticipantPage.vue");
const SearchPage = () => import("@/components/pages/SearchPage.vue");
const CategoryPage = () => import("@/components/pages/CategoryPage.vue");
const RubriquePage = () => import("@/components/pages/RubriquePage.vue");
const LivesPage = () => import("@/components/pages/LivesPage.vue");
const PlaylistPage = () => import("@/components/pages/PlaylistPage.vue");
const PlaylistsPage = () => import("@/components/pages/PlaylistsPage.vue");
const error403Page = () => import("@/components/pages/Error403Page.vue");
const PageNotFound = () => import("@/components/pages/PageNotFound.vue");
const RadioPage = () => import("@/components/pages/RadioPage.vue");

const routes: Array<RouteRecordRaw> = [
  /*--------------------------------------------------------------------------
  Liens publics
  --------------------------------------------------------------------------*/
  {
    path: "/",
    name: "",
    component: Home,
  },
  {
    path: "/",
    name: "backoffice",
    component: Home,
  },
  {
    path: "/",
    name: "createAccount",
    component: Home,
  },
  {
    path: "/main/pub/error",
    name: "error",
    component: error403Page,
  },
  {
    path: "/main/pub/home:productor?:iabId?:rubriquesId?",
    name: "home",
    component: Home,
    props: (route: RouteLocationNormalized) => ({
      productor: route.params.productor,
      iabId: route.params.iabId,
      rubriquesId: route.params.rubriquesId,
    }),
  },
  {
    path: "/main/pub/search/:query?/:productor?",
    name: "search",
    component: SearchPage,
    props: (route: RouteLocationNormalized) => ({
      productor: route.params.productor,
      queryRoute: route.params.query,
    }),
  },
  {
    path: "/main/pub/podcasts/:productor?:iabId?:rubriquesId?",
    name: "podcasts",
    component: PodcastsPage,
    props: (route: RouteLocationNormalized) => ({
      productor: route.params.productor,
      iabId: route.params.iabId,
      rubriquesId: route.params.rubriquesId,
    }),
  },
  {
    path: "/main/pub/emissions/:productor?:iabId?:rubriquesId?",
    name: "emissions",
    component: EmissionsPage,
    props: (route: RouteLocationNormalized) => ({
      productor: route.params.productor,
      iabId: route.params.iabId,
      rubriquesId: route.params.rubriquesId,
    }),
  },
  {
    path: "/main/pub/participants/:productor?",
    name: "participants",
    component: ParticpantsPage,
    props: (route: RouteLocationNormalized) => ({
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/emission/:emissionId/:productor?",
    name: "emission",
    component: EmissionPage,
    props: (route: RouteLocationNormalized) => ({
      firstRoute: route.query.first
        ? parseInt(route.query.first.toString(), 10)
        : 0,
      sizeRoute: route.query.size
        ? parseInt(route.query.size.toString(), 10)
        : 12,
      emissionId: parseInt(route.params.emissionId.toString(), 10),
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/podcast/:podcastId/:productor?",
    name: "podcast",
    component: PodcastPage,
    props: (route: RouteLocationNormalized) => ({
      podcastId: parseInt(route.params.podcastId.toString(), 10),
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/participant/:participantId/:productor?",
    name: "participant",
    component: ParticipantPage,
    props: (route: RouteLocationNormalized) => ({
      firstRoute: route.query.first
        ? parseInt(route.query.first.toString(), 10)
        : 0,
      sizeRoute: route.query.size
        ? parseInt(route.query.size.toString(), 10)
        : 12,
      participantId: parseInt(route.params.participantId.toString(), 10),
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/category/:iabId/:productor?",
    name: "category",
    component: CategoryPage,
    props: (route: RouteLocationNormalized) => ({
      firstRoute: route.query.first
        ? parseInt(route.query.first.toString(), 10)
        : 0,
      sizeRoute: route.query.size
        ? parseInt(route.query.size.toString(), 10)
        : 12,
      iabId: parseInt(route.params.iabId.toString(), 10),
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/rubrique/:rubriqueId/:productor?",
    name: "rubrique",
    component: RubriquePage,
    props: (route: RouteLocationNormalized) => ({
      firstRoute: route.query.first
        ? parseInt(route.query.first.toString(), 10)
        : 0,
      sizeRoute: route.query.size
        ? parseInt(route.query.size.toString(), 10)
        : 12,
      rubriqueId: parseInt(route.params.rubriqueId.toString(), 10),
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/lives/:productor?",
    name: "lives",
    component: LivesPage,
    props: (route: RouteLocationNormalized) => ({
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/radio/:canalId/:productor?",
    name: "radio",
    component: RadioPage,
    props: (route: RouteLocationNormalized) => ({
      canalId: parseInt(route.params.canalId.toString(), 10),
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/home",
    name: "productor",
    component: Home,
    props: () => ({
      productorId: 0,
    }),
  },
  {
    path: "/main/pub/home",
    name: "productors",
    component: Home,
    props: () => ({
      productorId: 0,
    }),
  },
  {
    path: "/main/pub/playlists/:productor?",
    name: "playlists",
    component: PlaylistsPage,
    props: (route: RouteLocationNormalized) => ({
      productor: route.params.productor,
    }),
  },
  {
    path: "/main/pub/playlist/:playlistId/:productor?",
    name: "playlist",
    component: PlaylistPage,
    props: (route: RouteLocationNormalized) => ({
      playlistId: parseInt(route.params.playlistId.toString(), 10),
      productor: route.params.productor,
    }),
  },
  //Fake route to avoid errors
  {
    path: "/main/pub/contact",
    component: Home,
  },
  {
    path: "/main/priv/share",
    name: "advancedShare",
    component: Home,
  },
  {
    path: "/main/pub/cgu",
    component: Home,
  },
  {
    path: "/main/pub/libraries",
    component: Home,
  },
  {
    path: "/main/priv/distribution/:distrib/:id",
    component: Home,
  },
  { path: "/:pathMatch(.*)*", component: PageNotFound },
];
export default createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior(): { left: number; top: number } {
    return { left: 0, top: 0 };
  },
});
