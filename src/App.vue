<template>
  <div class="d-flex flex-column h-100 octopus-app">
    <component v-if="pageFullyLoad" :is="route.meta.layoutComponent">
      <router-view />
    </component>
  </div>
</template>

<script setup lang="ts">
import {useInit} from "./components/composable/useInit";
import {useMetaTitle} from "./components/composable/useMetaTitle";
import {useOrganisationFilter} from "./components/composable/useOrganisationFilter";
import { useAuthStore } from "./stores/AuthStore";
import { getCurrentInstance, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

//Data 
const reload = ref(false);
const pageFullyLoad = ref(false);

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
}, { immediate: true });

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
