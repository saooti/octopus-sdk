import { createRouter, createWebHistory } from 'vue-router'

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

const routes: any = [
  /*--------------------------------------------------------------------------
  Liens publics
  --------------------------------------------------------------------------*/
    {
      path: '/',
      name: '',
      component: Home,
    },
    {
      path: '/main/pub/home:productor?:iabId?:rubriquesId?',
      name: 'home',
      component: Home,
      props: (route: any) => ({
        productor: route.params.productor,
        iabId: route.params.iabId,
        rubriquesId: route.params.rubriquesId,
      }),
    },
    {
      path: '/main/pub/search/:query?/:productor?',
      name: 'search',
      component: SearchPage,
      props: (route: any) => ({
        productor: route.params.productor,
        queryRoute: route.params.query,
      }),
    },
    {
      path: '/main/pub/podcasts/:productor?:iabId?:rubriquesId?',
      name: 'podcasts',
      component: PodcastsPage,
      props: (route: any) => ({
        productor: route.params.productor,
        iabId: route.params.iabId,
        rubriquesId: route.params.rubriquesId,
      }),
    },
    {
      path: '/main/pub/emissions/:productor?:iabId?:rubriquesId?',
      name: 'emissions',
      component: EmissionsPage,
      props: (route: any) => ({
        productor: route.params.productor,
        iabId: route.params.iabId,
        rubriquesId: route.params.rubriquesId,
      }),
    },
    {
      path: '/main/pub/participants/:productor?',
      name: 'participants',
      component: ParticpantsPage,
      props: (route: any) => ({
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/emission/:emissionId/:productor?',
      name: 'emission',
      component: EmissionPage,
      props: (route: any) => ({
        firstRoute: parseInt(route.query.first, 10) || 0,
        sizeRoute: parseInt(route.query.size, 10) || 12,
        emissionId: parseInt(route.params.emissionId, 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/podcast/:podcastId/:productor?',
      name: 'podcast',
      component: PodcastPage,
      props: (route: any) => ({
        podcastId: parseInt(route.params.podcastId, 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/participant/:participantId/:productor?',
      name: 'participant',
      component: ParticipantPage,
      props: (route: any) => ({
        firstRoute: parseInt(route.query.first, 10) || 0,
        sizeRoute: parseInt(route.query.size, 10) || 12,
        participantId: parseInt(route.params.participantId, 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/category/:iabId/:productor?',
      name: 'category',
      component: CategoryPage,
      props: (route: any) => ({
        firstRoute: parseInt(route.query.first, 10) || 0,
        sizeRoute: parseInt(route.query.size, 10) || 12,
        iabId: parseInt(route.params.iabId, 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/rubrique/:rubriqueId/:productor?',
      name: 'rubrique',
      component: RubriquePage,
      props: (route: any) => ({
        firstRoute: parseInt(route.query.first, 10) || 0,
        sizeRoute: parseInt(route.query.size, 10) || 12,
        rubriqueId: parseInt(route.params.rubriqueId, 10),
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/lives/:productor?',
      name: 'lives',
      component: LivesPage,
      props: (route: any) => ({
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
      props: (route: any) => ({
        productor: route.params.productor,
      }),
    },
    {
      path: '/main/pub/playlist/:playlistId/:productor?',
      name: 'playlist',
      component: PlaylistPage,
      props: (route: any) => ({
        playlistId: parseInt(route.params.playlistId, 10),
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
];
export default createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
  scrollBehavior(): {left: number; top: number} {
    return { left: 0, top: 0 };
  },
})
