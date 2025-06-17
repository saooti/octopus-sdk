<template>
  <div class="d-flex flex-column h-100 octopus-app">
    <template v-if="pageFullyLoad">
      <TopBar/>
      <main role="main">
        <CategoryFilter v-if="firstDisplayCategoryFilter" />
        <div v-else class="category-filter-no-filter" />
        <router-view />
        <PlayerComponent />
      </main>
      <ClassicLazy :min-height="123">
        <FooterOctopus />
      </ClassicLazy>
    </template>
  </div>
</template>
<script setup lang="ts">
import TopBar from "@/components/misc/TopBar.vue";
import PlayerComponent from "@/components/misc/player/PlayerComponent.vue";
import ClassicLazy from "@/components/misc/ClassicLazy.vue";
import {useInit} from "./components/composable/useInit";
import {useMetaTitle} from "./components/composable/useMetaTitle";
import {useOrganisationFilter} from "./components/composable/useOrganisationFilter";
import { useAuthStore } from "./stores/AuthStore";
import { defineAsyncComponent, getCurrentInstance, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
const FooterOctopus = defineAsyncComponent(
  () => import("@/components/misc/FooterSection.vue"),
);
const CategoryFilter = defineAsyncComponent(
  () => import("@/components/display/categories/CategoryFilter.vue"),
);

//Data 
const reload = ref(false);
const pageFullyLoad = ref(false);
const firstDisplayCategoryFilter = ref(false);

//Composables
const {locale} = useI18n();
const { updateMetaTitle } = useMetaTitle();
const {initSdk} = useInit();
const {selectOrganisation} = useOrganisationFilter();
const authStore = useAuthStore();
const route = useRoute();


//Watch
watch(route, async () => {
  updateMetaTitle();
  if (firstDisplayCategoryFilter.value) {
    return;
  }
  const namesRouteWithCategoryFilter = [
    "homePriv",
    "home",
    "podcasts",
    "emissions",
    "participants",
    "playlists",
  ];
  firstDisplayCategoryFilter.value = namesRouteWithCategoryFilter.includes(
    route.name?.toString() ?? "",
  );
}, {immediate: true});
watch(locale,() => {
  updateMetaTitle();
  const instance = getCurrentInstance();
  instance?.proxy?.$forceUpdate();
  reload.value = !reload.value;
});


onBeforeMount(()=>{
  initApp();
  setTimeout(() => {
    pageFullyLoad.value = true;
  }, 2000);
})


//Methods
async function initApp() {
  await initSdk();
  await handleOrganisationFilter();
}
async function handleOrganisationFilter() {
  let orgaId = "";
  if (
   route.query.productor &&
    "string" === typeof route.query.productor
  ) {
    orgaId = route.query.productor;
  } else if (authStore.authOrgaId) {
    orgaId = authStore.authOrgaId;
  }
  if ("" === orgaId) {
    return;
  }
  await selectOrganisation(orgaId);
}
</script>

<style lang="scss" src="@/style/octopus-library.scss"></style>
