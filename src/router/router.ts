import {
  createRouter,
  createWebHistory,
} from "vue-router";
import classicApi from "../api/classicApi";
import { AuthStore } from "../stores/AuthStore";
import fetchHelper from "../helper/fetchHelper";
import { setupRouter  } from "./utils";
import { routes } from "./routes";

const Home = () => import("../components/pages/HomePage.vue");

//Fake route to avoid errors
const fakeRoutes = [
  {
    path: "/",
    name: "",
    component: Home,
    meta:{
      title: "Home"
    }
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
];

const router = createRouter({
  history: createWebHistory(),
  routes: {
    ...routes,
    ...fakeRoutes
  },
  scrollBehavior(to, from) {
    if (to.name === from.name && to.meta.noScroll) {
      return false;
    } else {
      return { left: 0, top: 0 };
    }
  },
});

//Do in frontoffice but not podcastmakers
async function getMyOrgaActive(authStore: AuthStore): Promise<void>{
  const orgaActive = await classicApi.fetchData<string>({
    api: 3,
    path: "user/active"
  });
  //Si je suis authentifié mais pas dans mon organisation active, je réinitialise mon profil
  if(authStore.authOrgaId !== orgaActive){
    await authStore.fetchProfile();
    fetchHelper.createAuthenticatedFetchHeader(true);
  }
}

setupRouter(router, getMyOrgaActive, () => import('../layouts/FullLayout.vue'));

export default router;
