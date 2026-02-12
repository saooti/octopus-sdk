<template>
  <div class="top-bar-grid header-content" :class="{ scrolled: titleIsDisplayed }">
    <router-link
      class="top-bar-logo d-flex align-items-center"
      :to="{
        name: 'home',
        query: getQueriesRouter('home'),
      }"
      :title="t('Home')"
    >
      <img
        v-if="!filterStore.filterOrgaId || '' === imgUrl"
        :src="logoUrl"
        aria-hidden="true"
        alt=""
        width="140"
        height="50"
        title="Logo"
        :class="generalStore.platformEducation ? 'education-logo' : 'octopus-logo'"
      >
      <img
        v-else
        :src="useProxyImageUrl(imgUrl, '', '80')"
        aria-hidden="true"
        alt=""
        class="client-logo"
        title="Logo"
        :class="generalStore.platformEducation ? 'education-logo' : ''"
      >
    </router-link>
    <h1 v-if="titleIsDisplayed" class="text-truncate m-0 align-self-center">
      {{ titleDisplay }}
    </h1>
    <div
      class="d-flex"
      :class="[
        inContentDisplayPage || isPhone
          ? 'flex-row-reverse align-items-center'
          : 'flex-column align-items-end',
      ]"
    >
      <template v-if="filterStore.filterOrgaId && '' !== imgUrl">
        <img
          v-if="authStore.isGarRole"
          :src="logoUrl"
          aria-hidden="true"
          alt=""
          width="100"
          height="29"
          class="ms-2"
          title="Logo"
          :class="generalStore.platformEducation ? 'education-logo' : 'octopus-logo'"
        >
        <a
          v-else
          href="https://www.saooti.com/"
          target="_blank"
          rel="noreferrer noopener"
          :title="t('New window', {text: 'Saooti'})"
        >
          <img
            :src="logoUrl"
            aria-hidden="true"
            alt=""
            
            title="Saooti"
            width="100"
            height="29"
            class="ms-2"
            :class="generalStore.platformEducation ? 'education-logo' : 'octopus-logo'"
          >
        </a>
      </template>
      <div role="navigation" class="d-flex align-items-center justify-content-end flex-grow-1">
        <nav :aria-label="t('Site menu')">
          <ul class="d-flex">
            <template v-for="link in routerLinkArray" :key="link.routeName">
              <li v-if="link.condition" class="li-style-none">
                <router-link
                  v-show="!isPhone"
                  :to="{
                    name: link.routeName,
                    query: getQueriesRouter(link.routeName),
                  }"
                  class="link-hover py-2 px-3"
                >
                  {{ link.title }}
                </router-link>
              </li>
            </template>
          </ul>
        </nav>
        <button
          v-show="!isPhone && !inContentDisplayPage"
          id="more-dropdown"
          :title="t('More')"
          class="d-flex-column flex-nowrap align-items-center btn-transparent py-2 px-3 text-white"
        >
          <span class="link-hover">
            {{ t("More") }}
          </span>
          <ChevronDownIcon />
        </button>
        <ClassicPopover
          target="more-dropdown"
          :only-click="true"
          :is-fixed="true"
          :left-pos="true"
          :is-top-layer="true"
        >
          <nav class="d-flex flex-column" :aria-label="t('Site menu')">
            <ul class="p-0 m-0">
              <template v-for="link in routerLinkInsideArray" :key="link.routeName">
                <li
                  v-if="link.condition"
                  class="li-style-none"
                >
                  <router-link
                    :to="{
                      name: link.routeName,
                      query: getQueriesRouter(link.routeName),
                    }"
                    class="p-1 octopus-dropdown-item"
                  >
                    {{ link.title }}
                  </router-link>
                </li>
              </template>
            </ul>
          </nav>
        </ClassicPopover>

        <MobileMenu
          :is-education="generalStore.platformEducation"
          :show="mobileMenuDisplay"
          :not-podcast-and-emission="inContentDisplayPage && !scrolled"
        />
        <HomeDropdown
          :is-education="generalStore.platformEducation"
          :mobile-menu-display="mobileMenuDisplay"
          v-bind="options?.homeDropdown"
        />
        <router-link
          v-show="!isPhone && !inContentDisplayPage"
          :title="t('Search')"
          :to="{
            name: 'podcasts',
          }"
          class="btn admin-button m-1 text-blue-octopus"
          role="search"
        >
          <MagnifyIcon :size="30" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import { useRubriquesFilterComputed } from "../composable/route/useRubriquesFilterComputed";
import { state } from "../../stores/ParamSdkStore";
import HomeDropdown, { type HomeDropdownProps } from "./HomeDropdown.vue";
import {useImageProxy} from "../composable/useImageProxy";
import { useFilterStore } from "../../stores/FilterStore";
import { useAuthStore } from "../../stores/AuthStore";
import ClassicPopover from "../misc/ClassicPopover.vue";
import {  defineAsyncComponent, computed } from "vue";
import { useGeneralStore } from "../../stores/GeneralStore";
import { useI18n } from "vue-i18n";
const MobileMenu = defineAsyncComponent(() => import("./MobileMenu.vue"));

export interface TopBarMainContentOptions {
  homeDropdown?: HomeDropdownProps;
}

export interface TopBarMainContentProps {
  isPhone?: boolean;
  titleDisplay?: string;
  scrolled?: boolean;
};

//Props 
const props = defineProps<TopBarMainContentProps & {
  /** Props for subcomponents */
  options?: TopBarMainContentOptions;
}>();


//Composables
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();
const { rubriqueQueryParam } = useRubriquesFilterComputed();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const filterStore = useFilterStore();

//Computed
const mobileMenuDisplay = computed(() => props.isPhone || inContentDisplayPage.value);
const titleIsDisplayed = computed(() => inContentDisplayPage.value && props.scrolled && !props.isPhone);
const inContentDisplayPage = computed(() => 0 !== props.titleDisplay.length);
const routerLinkArray = computed(() =>{
  return [
    {
      title: t("Radio & Live"),
      routeName: "lives",
      condition:
        !inContentDisplayPage.value &&
        (state.generalParameters.isLiveTab as boolean) &&
        ((filterStore.filterOrgaId && filterStore.filterLive) || !filterStore.filterOrgaId),
    },
    {
      title: t("Podcasts"),
      routeName: "podcasts",
      condition:
        !inContentDisplayPage.value ||
        (inContentDisplayPage.value && !props.scrolled),
    },
    {
      title: t("Emissions"),
      routeName: "emissions",
      condition:
        !inContentDisplayPage.value ||
        (inContentDisplayPage.value && !props.scrolled),
    },
  ];
});
const routerLinkInsideArray = computed(() =>{
  return [
    {
      title: t("Speakers"),
      routeName: "participants",
      condition: true,
    },
    {
      title: t("Playlists"),
      routeName: "playlists",
      condition: true,
    },
    {
      title: t("Productors"),
      routeName: "productors",
      condition:
        !state.generalParameters.podcastmaker && (!filterStore.filterOrgaId || generalStore.platformEducation),
    },
  ];
});
const logoUrl = computed(() =>{
  if (generalStore.platformEducation) {
    return "/img/logo_education_white.svg";
  }
  return props.isPhone
    ? "/img/logo_octopus_bubble.svg"
    : "/img/logo_saooti_play_white.svg";
});
const imgUrl = computed(() =>{
  if (!filterStore.filterImgUrl?.includes("emptypodcast")){
    return `${filterStore.filterImgUrl}`;
  }
  return "";
});
 
//Methods
function getQueriesRouter(routeName: string) {
  if ("podcasts" !== routeName && "emissions" !== routeName  && "home" !== routeName) {
    return { productor: filterStore.filterOrgaId };
  }
  return {
    productor: filterStore.filterOrgaId,
    iabId: filterStore.filterIab?.id,
    rubriquesId: rubriqueQueryParam.value,
  };
}
</script>

<style lang="scss">


.octopus-app {
  .top-bar-grid {
    display: grid;
    grid-template-columns: 1fr 5fr;
    padding: 0.5rem 1rem 0 1rem;

    &.scrolled {
      grid-template-columns: 1fr 2fr 1fr;
    }

    @media (width <= 450px) {
      padding: 0 0.5rem;
    }

    .link-hover {
      color: white;
      font-weight: bold;
      font-size: 0.93rem;
      text-decoration: underline;
      text-decoration-color: transparent;
      transition: text-decoration-color 250ms;
      text-underline-offset: 8px;

      &.link-hover:hover,
      &.link-hover.router-link-exact-active.router-link-active {
        color: white;
        text-decoration-color: white;
      }
    }

    .client-logo {
      border-radius: var(--octopus-border-radius);
    }

    .top-bar-logo img {
      max-width: 140px !important;
      max-height: 4rem;
      height: 4rem;

      &.education-logo {
        height: auto;
      }

      @media (width <= 650px) {
        max-height: 2rem;
      }
    }

    .octopus-logo {
      @media (width <= 960px) {
        max-width: 30px !important;
      }
    }
  }
}
</style>
