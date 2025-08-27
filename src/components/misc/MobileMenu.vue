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
      <UserButtonContent 
        :isEducation="isEducation" 
        :navLabel="t('User menu')" 
        :specificRoutes="routerLinkArray"
        :displayUserContent="displayUserContent"/>
    </ClassicPopover>
  </div>
</template>

<script setup lang="ts">
import MenuIcon from "vue-material-design-icons/Menu.vue";
import { useRubriquesFilterComputed } from "../composable/route/useRubriquesFilterComputed";
import { state } from "../../stores/ParamSdkStore";
import { defineAsyncComponent, ref, computed } from "vue";
import { useFilterStore } from "../../stores/FilterStore";
import { useI18n } from "vue-i18n";
import { useResizePhone } from "../composable/useResizePhone";
import { useAuthStore } from "../../stores/AuthStore";
const ClassicPopover = defineAsyncComponent(
  () => import("../misc/ClassicPopover.vue"),
);
const UserButtonContent = defineAsyncComponent(
  () => import("./UserButtonContent.vue"),
);

//Props 
const props = defineProps({
  isEducation: { default: false, type: Boolean },
  show: { default: false, type: Boolean },
  notPodcastAndEmission: { default: false, type: Boolean },
  inContentDisplayPage: { default: false, type: Boolean },
})

//Data 
const firstLoaded = ref(false);

//Composables
const { t } = useI18n();
const { rubriqueQueryParam } = useRubriquesFilterComputed();
const filterStore = useFilterStore();
const authStore = useAuthStore();
const { windowWidth } = useResizePhone();


//Computed
const isAuthenticatedWithOrga = computed(() => undefined !== authStore.authOrgaId);
const displayUserContent = computed(() =>{
  if(isAuthenticatedWithOrga.value){
    return 500>=windowWidth.value;
  }
  return props.show;
});
const routerLinkArray = computed(() =>{
  return [
    { 
      title: t("Home"),
      path:{
        name: "home",
        query: getQueriesRouter(false),
      },
      class:"octopus-dropdown-item show-phone-flex", 
      condition: true
    },
    {
      title: t("Radio & Live"),
      path:{
        name: "lives",
        query: getQueriesRouter(true),
      },
      class: "octopus-dropdown-item",
      condition:
        state.generalParameters.isLiveTab &&
        ((filterStore.filterOrgaId && filterStore.filterLive) || !filterStore.filterOrgaId),
    },
    {
      title: t("Podcasts"),
      path:{
        name: "podcasts",
        query: getQueriesRouter(false),
      },
      class: "octopus-dropdown-item",
      condition: !props.notPodcastAndEmission,
    },
    {
      title: t("Emissions"),
      path:{
        name: "emissions",
        query: getQueriesRouter(false),
      },
      class: "octopus-dropdown-item",
      condition: !props.notPodcastAndEmission,
    },
    {
      title: t("Productors"),
      path:{
        name: "productors",
        query: getQueriesRouter(true),
      },
      class: "octopus-dropdown-item",
      condition:
        !state.generalParameters.podcastmaker && (!filterStore.filterOrgaId || props.isEducation),
    },
    {
      title: t("Playlists"),
      path:{
        name: "playlists",
        query: getQueriesRouter(true),
      },
      class: "octopus-dropdown-item",
      condition: true,
    },
    {
      title: t("Speakers"),
      path:{
        name: "participants",
        query: getQueriesRouter(true),
      },
      class: "octopus-dropdown-item",
      condition: true,
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
function getQueriesRouter(onlyProductor:boolean) {
  if (onlyProductor) {
    return { productor: filterStore.filterOrgaId };
  }
  return {
    productor: filterStore.filterOrgaId,
    iabId: filterStore.filterIab?.id,
    rubriquesId: rubriqueQueryParam.value,
  };
}
</script>
