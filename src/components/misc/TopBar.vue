<template>
  <header
    role="banner"
    class="header-saooti-play"
    :style="headerBackgroundImage"
    :class="[generalStore.contentToDisplay ? 'header-img-bg':'bg-gradient', scrolled? 'scrolled':'', needToBlur ? 'header-force-blur':'']"
  >
    <TopBarMainContent
      :is-phone="isPhone"
      :scrolled="scrolled"
      :title-display="titleToDisplay"
      style="height: var(--header-size);"
      :class="headerBackgroundImage.length ? 'header-opacity':''"
      :options="options?.topBarMainContent"
    />
  </header>

  <div
    v-if="generalStore.contentToDisplay"
    class="header-content-bg"
    :style="headerBackgroundImage"
    :class="{ scrolled: scrolled, 'header-force-blur':needToBlur }"
  >
    <div class="header-additional-content header-content">
      <h1 v-if="!scrolled" class="text-truncate">
        {{ titleToDisplay }}
      </h1>
      <SubscribeButtons
        v-if="!authStore.isGarRole"
        v-show="!scrolled"
        :content="content"
        :window-width="windowWidth"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {useImageProxy} from "../composable/useImageProxy";
import TopBarMainContent, { type TopBarMainContentOptions } from "./TopBarMainContent.vue";
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useAuthStore } from "../../stores/AuthStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Emission } from "@/stores/class/general/emission";
import {useResizePhone} from "../composable/useResizePhone";
import { Playlist } from "@/stores/class/general/playlist";
import { Canal } from "@/stores/class/radio/canal";
import axios from "axios";
const SubscribeButtons = defineAsyncComponent(
  () => import("../display/sharing/SubscribeButtons.vue"),
);

defineProps<{
  options?: {
    topBarMainContent?: TopBarMainContentOptions
  }
}>();

//Data 
const scrolled = ref(false);
const oldScrollY = ref(0);
const minScroll = ref(0);
const headerBackgroundImage = ref("");
const needToBlur = ref(false);


//Composables
const { isPhone, windowWidth } = useResizePhone();
const { useProxyImageUrl } = useImageProxy();
const authStore = useAuthStore();
const generalStore = useGeneralStore();

//Computed
const titleToDisplay = computed(() => {
  if ((generalStore.contentToDisplay as Podcast)?.podcastId) {
    return (generalStore.contentToDisplay as Podcast).emission.name;
  }
  if ((generalStore.contentToDisplay as Playlist)?.playlistId) {
    return (generalStore.contentToDisplay as Playlist).title;
  }
  if ((generalStore.contentToDisplay as Emission)?.emissionId) {
    return (generalStore.contentToDisplay as Emission).name;
  }
  if ((generalStore.contentToDisplay as Canal)?.id) {
    return (generalStore.contentToDisplay as Canal).name;
  }
  return "";
});

/** The element displayed by the subscribe buttons */
const content = computed(() => {
  if ((generalStore.contentToDisplay as Podcast)?.podcastId) {
    return (generalStore.contentToDisplay as Podcast).emission;
  }
  if ((generalStore.contentToDisplay as Emission)?.emissionId) {
    return generalStore.contentToDisplay as Emission;
  }
  if ((generalStore.contentToDisplay as Playlist)?.playlistId) {
    return generalStore.contentToDisplay as Playlist;
  }
  return null;
});

//Watch
watch(()=>generalStore.contentToDisplay, async () => {
  if(!generalStore.contentToDisplay){
    headerBackgroundImage.value = "";
    needToBlur.value = false;
    return;
  }
  const widthAsked = window.innerWidth > 960 ? "1600":"1000";
  const proxyUrl = useProxyImageUrl(generalStore.contentToDisplay.imageUrl, widthAsked, undefined, true);
  try {
    const result = await axios.get(proxyUrl);
    headerBackgroundImage.value = `background-image: url('${result.data}');`;
    needToBlur.value = result.data === generalStore.contentToDisplay.imageUrl;
  } catch {
    if (generalStore.contentToDisplay.imageUrl) {
      const url = encodeURI(generalStore.contentToDisplay.imageUrl);
      headerBackgroundImage.value = `background-image: url('${url}');`;
      needToBlur.value = true;
    } else {
      headerBackgroundImage.value = '';
    }
  }
}, {deep: true, immediate: true});


onMounted(()=>{
  window.addEventListener("scroll", handleScroll);
})
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
})


//Methods
function handleScroll(): void {
  if (
    window.scrollY - oldScrollY.value > 0 &&
    window.scrollY > 1 &&
    document.body.offsetHeight - window.innerHeight > 40
  ) {
    if (!scrolled.value) {
      scrolled.value = true;
      minScroll.value = 0;
    }
  } else if (
    window.scrollY - oldScrollY.value  < 0 &&
    window.scrollY < 1 &&
    minScroll.value > 20
  ) {
    scrolled.value = false;
    minScroll.value = 0;
  }
  oldScrollY.value  = window.scrollY;
  if (minScroll.value < window.scrollY) {
    minScroll.value = window.scrollY;
  }
}
</script>

<style lang="scss">
.octopus-app {
  --header-size: 5rem;
  --header-additional-content-size: 22rem;
  @media (width <= 650px) {
    --header-size: 3.5rem;
  }
  @media (width <= 550px) {
    --header-additional-content-size: 13rem;
  }
  .header-saooti-play{
    z-index: 11;
    position: sticky;
    top: 0;
    background-color: black;
    &.header-img-bg{
      background-position: center -20vw;
      background-repeat: no-repeat;
      background-size: cover;
    }
    &.bg-gradient, &.scrolled{
      box-shadow: 0 2px 15px 5px var(--octopus-shadow) !important; 
    }
  }
  .header-content-bg{
    background-position: center calc(calc(var(--header-size) * -1) - 20vw);
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    display: flex;
    background-color: black;
    transition: height 0.7s;
    height: calc(var(--header-additional-content-size) - var(--header-size));
    @starting-style {
      height: 0rem;
    }
    &.scrolled {
      height: 0rem;
    }
  }
  .header-additional-content{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
  }
  .header-additional-content, .header-opacity{
    background: oklch(0 0 0 / 0.5);
  }
  .header-force-blur .header-additional-content, .header-force-blur .header-opacity{
    backdrop-filter: blur(8px);
  }
  .header-content{
    *:focus-visible {
      box-shadow: 0 0 10px 1px white !important;
    }
    h1 {
      color: white !important;
      font-size: 1.8rem;
      margin: 2rem 5rem;
      @media (width <= 550px) {
        font-size: 1rem;
        margin: 1rem 0.5rem 0.5rem;
      }
    }
    .admin-button:hover,
    .share-btn:hover {
      background: white;
    }
  }
}
</style>
