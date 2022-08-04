import { createRouter, createWebHistory, RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

/*--------------------------------------------------------------------------
Composants publics
--------------------------------------------------------------------------*/

const Home = () => import('@/components/pages/Home.vue');
const PodcastsPage = () => import('@/components/pages/Podcasts.vue');
const EmissionPage = () => import('@/components/pages/Emission.vue');
const EmissionsPage = () => import('@/components/pages/Emissions.vue');
const ParticpantsPage = () => import('@/components/pages/Participants.vue');
const PodcastPage = () => import('@/components/pages/Podcast.vue');
const ParticipantPage = () => import('@/components/pages/Participant.vue');
const SearchPage = () => import('@/components/pages/Search.vue');
const CategoryPage = () => import('@/components/pages/Category.vue');
const RubriquePage = () => import('@/components/pages/Rubrique.vue');
const LivesPage = () => import('@/components/pages/Lives.vue');
const PlaylistPage = () => import('@/components/pages/Playlist.vue');
const PlaylistsPage = () => import('@/components/pages/Playlists.vue');
const error403Page = () => import('@/components/pages/Error403Page.vue');
const PageNotFound = () => import('@/components/pages/PageNotFound.vue');

const routes: Array<RouteRecordRaw> = [
  /*--------------------------------------------------------------------------
  Liens publics
  --------------------------------------------------------------------------*/
    {
      path: '/',
      name: '',
      component: Home,
    },
    {
      path: '/main/pub/error',
      name: 'error',
      component: error403Page,
    },
    {
      path: '/main/pub/home:productor?:iabId?:rubriquesId?',
      name: 'home',
      component: Home,
      props: (route: RouteLocationNormalized) => ({
        productor: route.params.productor,
        iabId: route.params.iabId,
        rubriquesId: route.params.rubriquesId,
      }),
    },
    {
      path: '/main/pub/search/:query?/:productor?',
      name: 'search',
      component: SearchPage,
      props: (route: RouteLocationNormalized) => ({
        productor: route.params.productor,
        queryRoute: route.params.query,
      }),
    },
    {
      path: '/main/pub/podcasts/:productor?:iabId?:rubriquesId?',
      name: 'podcasts',
      component: PodcastsPage,
      props: (route: RouteLocationNormalized) => ({
        productor: route.params.productor,
        iabId: route.params.iabId,
        rubriquesId: route.params.rubriquesId,
      }),
    },
    {
      path: '/main/pub/emissions/:productor?:iabId?:rubriquesId?',
      name: 'emissions',
      component: EmissionsPage,
      props: (route: RouteLocationNormalized) => ({
        productor: route.params.productor,
        iabId: route.params.iabId,
        rubriquesId: route.params.rubriquesId,
      }),
    },
    {
      path: '/main/pub/participants/:productor?',
      name: 'participants',
      component: ParticpantsPage,
      props: (route: RouteLocationNormalized) => ({
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/emission/:emissionId/:productor?',
      name: 'emission',
      component: EmissionPage,
      props: (route: RouteLocationNormalized) => ({
        firstRoute: route.query.first ? parseInt(route.query.first.toString(), 10) : 0,
        sizeRoute: route.query.size ? parseInt(route.query.size.toString(), 10) :12,
        emissionId: parseInt(route.params.emissionId.toString(), 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/podcast/:podcastId/:productor?',
      name: 'podcast',
      component: PodcastPage,
      props: (route: RouteLocationNormalized) => ({
        podcastId: parseInt(route.params.podcastId.toString(), 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/participant/:participantId/:productor?',
      name: 'participant',
      component: ParticipantPage,
      props: (route: RouteLocationNormalized) => ({
        firstRoute: route.query.first ? parseInt(route.query.first.toString(), 10) : 0,
        sizeRoute: route.query.size ? parseInt(route.query.size.toString(), 10) :12,
        participantId: parseInt(route.params.participantId.toString(), 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/category/:iabId/:productor?',
      name: 'category',
      component: CategoryPage,
      props: (route: RouteLocationNormalized) => ({
        firstRoute: route.query.first ? parseInt(route.query.first.toString(), 10) : 0,
        sizeRoute: route.query.size ? parseInt(route.query.size.toString(), 10) :12,
        iabId: parseInt(route.params.iabId.toString(), 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/rubrique/:rubriqueId/:productor?',
      name: 'rubrique',
      component: RubriquePage,
      props: (route: RouteLocationNormalized) => ({
        firstRoute: route.query.first ? parseInt(route.query.first.toString(), 10) : 0,
        sizeRoute: route.query.size ? parseInt(route.query.size.toString(), 10) :12,
        rubriqueId: parseInt(route.params.rubriqueId.toString(), 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/lives/:productor?',
      name: 'lives',
      component: LivesPage,
      props: (route: RouteLocationNormalized) => ({
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/home',
      name: 'productor',
      component: Home,
      props: () => ({
        productorId: 0,
      }),
    },
    {
      path: '/main/pub/home',
      name: 'productors',
      component: Home,
      props: () => ({
        productorId: 0,
      }),
    },
    {
      path: '/main/pub/playlists/:productor?',
      name: 'playlists',
      component: PlaylistsPage,
      props: (route: RouteLocationNormalized) => ({
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/playlist/:playlistId/:productor?',
      name: 'playlist',
      component: PlaylistPage,
      props: (route: RouteLocationNormalized) => ({
        playlistId: parseInt(route.params.playlistId.toString(), 10),
        productor: route.params.productor,
      }),
    },
    //Fake route to avoid errors
    {
      path: '/main/pub/contact',
      component: Home,
    },
    {
      path: '/main/pub/cgu',
      component: Home,
    },
    {
      path: '/main/pub/libraries',
      component: Home,
    },
    {
      path: '/main/priv/distribution/:distrib/:id',
      component: Home,
    },
    { path: '/:pathMatch(.*)*', component: PageNotFound }
    
];
export default createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior(): {left: number; top: number} {
    return { left: 0, top: 0 };
  },
})
