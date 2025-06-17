<template>
  <div>
    <button
      v-show="show"
      id="mobile-menu-dropdown"
      class="btn-transparent text-white c-hand m-2 h2"
      :title="t('open left Menu')"
      @click="handleMenuClick"
    >
      <MenuIcon :size="34" />
    </button>
    <ClassicPopover
      v-if="firstLoaded"
      target="mobile-menu-dropdown"
      popover-class="popover-z-index"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
      :is-top-layer="true"
    >
      <template v-for="link in routerLinkArray" :key="link.routeName">
        <router-link
          v-if="link.condition"
          :class="
            'home' === link.routeName
              ? 'octopus-dropdown-item show-phone-flex'
              : 'octopus-dropdown-item'
          "
          :to="{
            name: link.routeName,
            query: getQueriesRouter(link.routeName),
          }"
        >
          {{ link.title }}
        </router-link>
      </template>
      <a
        v-if="!isAuthenticatedWithOrga"
        class="octopus-dropdown-item realLink"
        :href="pathLogin"
      >
        {{ t("Login") }}
      </a>
      <a v-else class="octopus-dropdown-item c-hand" href="/logout">
        {{ t("Logout") }}
      </a>
      <router-link
        v-if="!authStore.isGarRole"
        class="octopus-dropdown-item"
        to="/main/pub/contact"
      >
        {{ t("Contact") }}
      </router-link>
    </ClassicPopover>
  </div>
</template>

<script setup lang="ts">
import MenuIcon from "vue-material-design-icons/Menu.vue";
import { useRubriquesFilterComputed } from "../composable/route/useRubriquesFilterComputed";
import { state } from "../../stores/ParamSdkStore";
import { defineAsyncComponent, ref, computed } from "vue";
import { useFilterStore } from "../../stores/FilterStore";
import { useAuthStore } from "../../stores/AuthStore";
import { useApiStore } from "../../stores/ApiStore";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
const ClassicPopover = defineAsyncComponent(
  () => import("../misc/ClassicPopover.vue"),
);


//Props 
const props = defineProps({
  isEducation: { default: false, type: Boolean },
  show: { default: false, type: Boolean },
  notPodcastAndEmission: { default: false, type: Boolean },
  scrolled: { default: false, type: Boolean },
})

//Data 
const firstLoaded = ref(false);

//Composables
const { t } = useI18n();
const { rubriqueQueryParam } = useRubriquesFilterComputed();
const authStore = useAuthStore();
const apiStore = useApiStore();
const filterStore = useFilterStore();
const route = useRoute();


//Computed
const isAuthenticatedWithOrga = computed(() => undefined !== authStore.authOrgaId);
const pathLogin = computed(() => "/sso/login?redirect_url="+encodeURI(apiStore.frontendUrl + route.fullPath));
const routerLinkArray = computed(() =>{
  return [
    {
      title: t("My space"),
      routeName: "backoffice",
      condition: isAuthenticatedWithOrga.value,
    },
    { title: t("Home"), routeName: "home", condition: true },
    {
      title: t("Radio & Live"),
      routeName: "lives",
      condition:
        state.generalParameters.isLiveTab &&
        ((filterStore.filterOrgaId && filterStore.filterLive) || !filterStore.filterOrgaId),
    },
    {
      title: t("Podcasts"),
      routeName: "podcasts",
      condition: !props.notPodcastAndEmission,
    },
    {
      title: t("Emissions"),
      routeName: "emissions",
      condition: !props.notPodcastAndEmission,
    },
    {
      title: t("Productors"),
      routeName: "productors",
      condition:
        !state.generalParameters.podcastmaker && (!filterStore.filterOrgaId || props.isEducation),
    },
    {
      title: t("Playlists"),
      routeName: "playlists",
      condition: true,
    },
    {
      title: t("Speakers"),
      routeName: "participants",
      condition: true,
    },
    {
      title: t("Create an account"),
      routeName: "createAccount",
      condition: !isAuthenticatedWithOrga.value,
    },
  ];
});


//Methods
function handleMenuClick() {
  if (firstLoaded.value) {
    return;
  }
  firstLoaded.value = true;
  setTimeout(() => {
    document.getElementById("mobile-menu-dropdown")?.click();
  }, 200);
}
function getQueriesRouter(routeName: string) {
  if (
    "podcasts" !== routeName &&
    "emissions" !== routeName &&
    "home" !== routeName
  ) {
    return { productor: filterStore.filterOrgaId };
  }
  return {
    productor: filterStore.filterOrgaId,
    iabId: filterStore.filterIab?.id,
    rubriquesId: rubriqueQueryParam.value,
  };
}
</script>
