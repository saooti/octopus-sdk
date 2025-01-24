import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";
import { useFilterStore } from "../stores/FilterStore";
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import classicApi from "@/api/classicApi";

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
const LivesPage = () => import("@/components/pages/LivesPage.vue");
const PlaylistPage = () => import("@/components/pages/PlaylistPage.vue");
const PlaylistsPage = () => import("@/components/pages/PlaylistsPage.vue");
const error403Page = () => import("@/components/pages/Error403Page.vue");
const PageNotFound = () => import("@/components/pages/PageNotFound.vue");
const RadioPage = () => import("@/components/pages/RadioPage.vue");
const VideoPage = () => import("@/components/pages/VideoPage.vue");
const PageLogout = () => import("@/components/pages/PageLogout.vue");

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
    props: (route: RouteLocationNormalized) => ({
      pr: route.query.pr ? parseInt(route.query.pr.toString(), 10) : undefined,
      ps: route.query.ps ? parseInt(route.query.ps.toString(), 10) : undefined,
      routeQuery: route.query.q ?? "",
      routeMonetisable: route.query.m ?? "",
      routeIab: route.query.i ? parseInt(route.query.i.toString(), 10) : undefined,
      routeSort: route.query.s ?? "",
      routeIncludeHidden: route.query.h ?? "",
      routeFrom: route.query.from,
      routeTo: route.query.to,
      routeNotValid:route.query.nv ?? "",
      routeOnlyVideo:route.query.v ?? "",
      routeOrga:route.query.o,
      routeRubriques :route.query.r,
    }),
    meta:{
      title: "Podcasts",
    }
  },
  {
    path: "/main/pub/emissions/",
    name: "emissions",
    component: EmissionsPage,
    props: (route: RouteLocationNormalized) => ({
      pr: route.query.pr ? parseInt(route.query.pr.toString(), 10) : undefined,
      ps: route.query.ps ? parseInt(route.query.ps.toString(), 10) : undefined,
      routeQuery: route.query.q ?? "",
      routeMonetisable: route.query.m ?? "",
      routeIab: route.query.i ? parseInt(route.query.i.toString(), 10) : undefined,
      routeSort: route.query.s ?? "",
      routeIncludeHidden: route.query.h ?? "",
      routeFrom: route.query.from,
      routeTo: route.query.to,
      routeOrga:route.query.o,
      routeRubriques :route.query.r,
    }),
    meta:{
      title: "Emissions",
    }
  },
  {
    path: "/main/pub/participants",
    name: "participants",
    component: ParticpantsPage,
    props: (route: RouteLocationNormalized) => ({
      pr: route.query.pr ? parseInt(route.query.pr.toString(), 10) : undefined,
      ps: route.query.ps ? parseInt(route.query.ps.toString(), 10) : undefined,
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
      emissionId: parseInt(route.params.emissionId.toString(), 10),
    }),
    meta:{
      title: ""
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
      participantId: parseInt(route.params.participantId.toString(), 10),
    }),
    meta:{
      title: ""
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
      pr: route.query.pr ? parseInt(route.query.pr.toString(), 10) : undefined,
      ps: route.query.ps ? parseInt(route.query.ps.toString(), 10) : undefined,
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
      playlistId: parseInt(route.params.playlistId.toString(), 10),
    }),
    meta:{
      title: ""
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
  { path: "/logout", component: PageLogout },
  { path: "/sso/logout", component: PageLogout },
  { path: "/:pathMatch(.*)*", component: PageNotFound },
];
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior(): { left: number; top: number } {
    return { left: 0, top: 0 };
  },
});
//Do in frontoffice but not podcastmakers
router.beforeEach(async (to, from) => {
  const filterStore = useFilterStore();
  if(to.path===from.path && to.query.productor !== from.query.productor){
    if(undefined===to.query.productor){
      filterStore.filterUpdateOrga({ orgaId: undefined });
    }else if(filterStore.filterOrgaId !== to.query.productor){
      const saveStore = useSaveFetchStore();
      const response = await saveStore.getOrgaData(to.query.productor);
      const data = await classicApi.fetchData<Array<Rubriquage>>({
        api: 0,
        path:"rubriquage/find/" + to.query.productor,
        parameters:{
          sort: "HOMEPAGEORDER",
          homePageOrder: true,
        },
        specialTreatement:true
      });
      const isLive = await saveStore.getOrgaLiveEnabled(to.query.productor);
      filterStore.filterUpdateOrga({ 
        orgaId: to.query.productor,
        imgUrl: response.imageUrl,
        name: response.name,
        rubriquageArray: data.filter((element: Rubriquage) => {
          return element.rubriques.length;
        }),
        isLive: isLive,
      });
    }
    return;
  }
  if (
    "/logout" !== to.path && 
    filterStore.filterOrgaId !== to.query.productor &&
    undefined !== filterStore.filterOrgaId
  ) {
    return {
      path: to.path,
      query: { ...to.query, ...{ productor: filterStore.filterOrgaId } },
      params: to.params,
      name: to.name,
    };
  }
  if("/logout" === to.path && "/logout" !== from.path){
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
  }
});
export default router;