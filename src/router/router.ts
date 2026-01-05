import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";
import classicApi from "@/api/classicApi";
import { AuthStore } from "../stores/AuthStore";
import fetchHelper from "@/helper/fetchHelper";
import { setupRouter } from "./utils";

import { ROUTE_PARAMS, RouteProps } from "../components/composable/route/types";

/*--------------------------------------------------------------------------
Composants publics
--------------------------------------------------------------------------*/

const Home = () => import("@/components/pages/HomePage.vue");
const MapPage = () => import("@/components/pages/MapPage.vue");
const PodcastsPage = () => import("@/components/pages/PodcastsPage.vue");
const EmissionPage = () => import("@/components/pages/EmissionPage.vue");
const EmissionsPage = () => import("@/components/pages/EmissionsPage.vue");
const ParticpantsPage = () => import("@/components/pages/ParticipantsPage.vue");
const PodcastPage = () => import("@/components/pages/PodcastPage.vue");
const ParticipantPage = () => import("@/components/pages/ParticipantPage.vue");
const SearchPage = () => import("@/components/pages/SearchPage.vue");
const CategoryPage = () => import("@/components/pages/CategoryPage.vue");
const RubriquePage = () => import("@/components/pages/RubriquePage.vue");
const TagPage = () => import("@/components/pages/TagPage.vue");
const LivesPage = () => import("@/components/pages/LivesPage.vue");
const PlaylistPage = () => import("@/components/pages/PlaylistPage.vue");
const PlaylistsPage = () => import("@/components/pages/PlaylistsPage.vue");
const error403Page = () => import("@/components/pages/Error403Page.vue");
const PageNotFound = () => import("@/components/pages/PageNotFound.vue");
const RadioPage = () => import("@/components/pages/RadioPage.vue");
const VideoPage = () => import("@/components/pages/VideoPage.vue");
const PageLogout = () => import("@/components/pages/PageLogout.vue");

function getSimpleRouteProps(route:RouteLocationNormalized): RouteProps {
  return {
    pr: route.query.pr ? parseInt(route.query.pr.toString(), 10) : undefined,
    ps: route.query.ps ? parseInt(route.query.ps.toString(), 10) : undefined,
    routeQuery: route.query.q as string ?? ""
  };
}

/**
 * Return route props used for filtering
 */
function getRouteProps(route: RouteLocationNormalized): RouteProps {
  return {
    ...getSimpleRouteProps(route),
    routeMonetisable: route.query.m as string ?? "",
    routeIab: route.query.i ? parseInt(route.query.i.toString(), 10) : undefined,
    routeSort: route.query.s as string ?? "",
    routeIncludeHidden: route.query.h as string ?? "",
    routeFrom: route.query.from as string|undefined,
    routeTo: route.query.to as string|undefined,
    routeOrga:route.query.o as string|undefined,
    routeRubriques :route.query.r as string ?? route.query.rubriquesId as string|undefined,
    routeBeneficiaries: route.query[ROUTE_PARAMS.Beneficiaries] as string[]|undefined,
    routeEmissionGroups: (route.query[ROUTE_PARAMS.EmissionGroups] as string[]|undefined)?.map(g => parseInt(g, 10))
  }
}

const routes: Array<RouteRecordRaw> = [
  /*--------------------------------------------------------------------------
  Liens publics
  --------------------------------------------------------------------------*/
  {
    path: "/",
    name: "",
    component: Home,
    meta:{
      title: "Home"
    }
  },
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
    path: "/main/pub/emission/:emissionId(\\d+):title([^?]*)?:productor?",
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
    path: "/main/pub/playlist/:playlistId(\\d+):title([^?]*)?:productor?",
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
  //Fake route to avoid errors
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
    path: "/main/pub/home:productorId?",
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
    path: "/main/pub/contact",
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
  { path: "/logout", component: PageLogout },
  { path: "/sso/logout", component: PageLogout },
  { path: "/:pathMatch(.*)*", component: PageNotFound },
];
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior(to, from) {
    if (to.name === from.name && to.meta.noScroll) {
      return false;
    } else {
      return { left: 0, top: 0 };
    }
  },
});

//Do in frontoffice but not podcastmakers
async function getMyOrgaActive(authStore: AuthStore): Promise<string>{
  const orgaActive = await classicApi.fetchData<string>({
    api: 3,
    path: "user/active"
  });
  //Si je suis authentifié mais pas dans mon organisation active, je réinitialise mon profil
  if(authStore.authOrgaId !== orgaActive){
    await authStore.fetchProfile();
    fetchHelper.createAuthenticatedFetchHeader(true);
  }
  return orgaActive;
}

setupRouter(router, getMyOrgaActive);

export default router;
