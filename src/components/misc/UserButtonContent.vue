<template>
  <nav :aria-label="navLabel">
    <ul class="p-0 m-0">
      <template v-if="specificRoutes.length">
        <li v-for="routerBack in specificRoutes" :key="routerBack.path" class="li-style-none">
          <router-link
            v-if="!state.generalParameters.podcastmaker && routerBack.condition"
            :class="routerBack.class"
            :to="routerBack.path"
          >
            {{ routerBack.title }}
          </router-link>
        </li>
        <hr v-if="displayUserContent"/>
      </template>
      <template v-if="displayUserContent">
        <template v-if="!isAuthenticated">
          <li class="li-style-none">
            <a class="octopus-dropdown-item realLink" :href="pathLogin">
              {{ t("Login") }}
            </a>
          </li>
          <li class="li-style-none">
            <router-link
              v-if="!state.generalParameters.podcastmaker"
              class="octopus-dropdown-item"
              to="/main/pub/create"
            >
              {{ t("Create an account") }}
            </router-link>
          </li>
        </template>
        <template v-else>
          <template v-if="helpLinks.length">
            <li v-for="helpLink in helpLinks" :key="helpLink.title" class="li-style-none">
              <a
                :href="helpLink.href"
                class="octopus-dropdown-item realLink"
                rel="noreferrer noopener"
                target="_blank"
                :title="t('New window', {text: helpLink.title})"
              >
                {{ helpLink.title }}
                <OpenInNewIcon class="ms-1" :size="15"/>
              </a>
            </li>
          </template>
          <hr />
          <li class="li-style-none">
            <a class="octopus-dropdown-item c-hand" href="/logout">
              {{ t("Logout") }}
            </a>
          </li>
        </template>
        <li class="li-style-none">
          <router-link
            v-if="!authStore.isGarRole"
            class="octopus-dropdown-item"
            to="/main/pub/contact"
          >
            {{ t("Contact") }}
          </router-link>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import OpenInNewIcon from "vue-material-design-icons/OpenInNew.vue";
import { state } from "../../stores/ParamSdkStore";
import { useAuthStore } from "../../stores/AuthStore";
import { computed } from "vue";
import { useApiStore } from "../../stores/ApiStore";
import { useI18n } from "vue-i18n";
import { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric, useRoute } from "vue-router";

//Interface
interface RouteInfo{
  title: string;
  class: string;
  path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
  condition: boolean
}

//Props 
const props = defineProps({
  isEducation: { default: false, type: Boolean },
  navLabel: { default: "", type: String },
  specificRoutes: { default: false, type: Array as ()=> Array<RouteInfo> },
  displayUserContent: { default: true, type: Boolean },
})

//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const apiStore = useApiStore();
const route = useRoute();

//Computed
const isAuthenticated = computed(() => undefined !== authStore.authProfile?.userId);
const pathLogin = computed(() => "/sso/login?redirect_url="+encodeURI(apiStore.frontendUrl + route.fullPath));
const helpLinks = computed(() => {
  if (authStore.isGarRole || props.isEducation) {
    return [];
  }
  return [
    { title:t("Help"), href: "https://help.octopus.saooti.com/Aide/"},
    { title: t("TutoMag"), href: "https://help.octopus.saooti.com/" },
  ];
});

</script>
