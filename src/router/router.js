import { createRouter, createWebHistory } from 'vue-router';

/*--------------------------------------------------------------------------
Composants publics
--------------------------------------------------------------------------*/
import Home from '@/components/pages/Home.vue';
import PodcastsPage from '@/components/pages/Podcasts.vue';
import EmissionPage from '@/components/pages/Emission.vue';
import EmissionsPage from '@/components/pages/Emissions.vue';
import ParticpantsPage from '@/components/pages/Participants.vue';
import PodcastPage from '@/components/pages/Podcast.vue';
import ParticipantPage from '@/components/pages/Participant.vue';
import SearchPage from '@/components/pages/Search.vue';
import CategoryPage from '@/components/pages/Category.vue';
import RubriquePage from '@/components/pages/Rubrique.vue';
import LivesPage from '@/components/pages/Lives.vue';
import PlaylistPage from '@/components/pages/Playlist.vue';
import PlaylistsPage from '@/components/pages/Playlists.vue';


const routes = [
  /*--------------------------------------------------------------------------
  Liens publics
  --------------------------------------------------------------------------*/
  {
    path: '/main/pub/home:productor?',
    name: 'home',
    component: Home,
    props: route => ({
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/search/:query?/:productor?',
    name: 'search',
    component: SearchPage,
    props: route => ({
      productor: route.params.productor,
      query: route.params.query,
    }),
  },
  {
    path: '/main/pub/podcasts/:productor?',
    name: 'podcasts',
    component: PodcastsPage,
    props: route => ({
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/emissions/:productor?',
    name: 'emissions',
    component: EmissionsPage,
    props: route => ({
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/participants/:productor?',
    name: 'participants',
    component: ParticpantsPage,
    props: route => ({
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/emission/:emissionId/:productor?',
    name: 'emission',
    component: EmissionPage,
    props: route => ({
      first: parseInt(route.query.first, 10) || 0,
      size: parseInt(route.query.size, 10) || 12,
      emissionId: parseInt(route.params.emissionId, 10),
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/podcast/:podcastId/:productor?',
    name: 'podcast',
    component: PodcastPage,
    props: route => ({
      podcastId: parseInt(route.params.podcastId, 10),
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/participant/:participantId/:productor?',
    name: 'participant',
    component: ParticipantPage,
    props: route => ({
      first: parseInt(route.query.first, 10) || 0,
      size: parseInt(route.query.size, 10) || 12,
      participantId: parseInt(route.params.participantId, 10),
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/category/:iabId/:productor?',
    name: 'category',
    component: CategoryPage,
    props: route => ({
      first: parseInt(route.query.first, 10) || 0,
      size: parseInt(route.query.size, 10) || 12,
      iabId: parseInt(route.params.iabId, 10),
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/rubrique/:rubriqueId/:productor?',
    name: 'rubrique',
    component: RubriquePage,
    props: route => ({
      first: parseInt(route.query.first, 10) || 0,
      size: parseInt(route.query.size, 10) || 12,
      rubriqueId: parseInt(route.params.rubriqueId, 10),
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/lives/:productor?',
    name: 'lives',
    component: LivesPage,
    props: route => ({
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
    props: route => ({
      productor: route.params.productor,
    }),
  },
  {
    path: '/main/pub/playlist/:playlistId/:productor?',
    name: 'playlist',
    component: PlaylistPage,
    props: route => ({
      playlistId: parseInt(route.params.playlistId, 10),
      productor: route.params.productor,
    }),
  },
];
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router;
