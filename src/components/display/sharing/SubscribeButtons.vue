<template>
  <div
    v-if="subscriptionsDisplay.length || rssUrl"
    class="subscribe-buttons-container"
  >
    <div ref="subscribeButtonsContainer">
      <a
        v-for="(sub, index) in subscriptionsDisplay"
        :id="'subLink' + sub.name"
        :key="sub.name"
        rel="noreferrer noopener"
        target="_blank"
        :class="[
          0 === index ? 'first' : '',
          subscriptionsDisplay.length - 1 === index ? 'last' : '',
        ]"
        class="btn share-btn mx-2"
        :href="sub.url"
        :title="t('New window', {text: sub.title})"
      >
        <component :is="sub.icon" :fill-color="sub?.color" />
      </a>
    </div>
    <a
      id="rss-suscribe-button"
      rel="noreferrer noopener"
      target="_blank"
      class="btn share-btn mx-2"
      :href="rssUrl"
      :title="t('New window', {text: t('Rss feed')})"
    >
      <RssIcon />
    </a>
    <button
      v-show="hiddenLinks.length"
      id="subscribe-buttons-dropdown"
      class="btn share-btn mx-2"
      :title="t('See more')"
    >
      <PlusIcon />
    </button>
    <ClassicPopover
      target="subscribe-buttons-dropdown"
      popover-class="popover-z-index"
      :only-click="true"
      :left-pos="true"
    >
      <a
        v-for="link in hiddenLinks"
        :key="link.name"
        rel="noreferrer noopener"
        target="_blank"
        class="octopus-dropdown-item justify-content-start d-flex align-items-center realLink"
        :href="link.url"
        :title="t('New window', {text: link.title})"
      >
        <component :is="link.icon" :fill-color="link.color" class="me-1" />
        {{ link.title }}
      </a>
    </ClassicPopover>
  </div>
</template>

<script setup lang="ts">
import PlusIcon from "vue-material-design-icons/Plus.vue";
import RssIcon from "vue-material-design-icons/Rss.vue";
import { useApiStore } from "../../../stores/ApiStore";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import { Emission } from "@/stores/class/general/emission";
import { type Component, computed, onMounted, Ref, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Playlist } from "@/stores/class/general/playlist";
import { useSharePlatforms } from "../../composable/share/useSharePlatforms";
type Link = {
  name: string;
  icon: Component;
  title: string;
  color?: string;
  url: string | undefined;
};

//Props 
const props = withDefaults(defineProps<{
  content: Emission|Playlist;
  windowWidth?: number;
  justifyCenter?: boolean;
}>(), {
  windowWidth: 0,
  justifyCenter: true
});

//Data 
const lastWindowWidth = ref(420);
const hiddenLinks: Ref<Array<Link>> = ref([]);
const subscribeButtonsContainerRef = useTemplateRef('subscribeButtonsContainer');


//Composables
const { t } = useI18n();
const apiStore = useApiStore();
const { getPlatformsWithLinks } = useSharePlatforms();

//Computed
const subscriptionsDisplay = computed(() => {
  return getPlatformsWithLinks(props.content.annotations);
});

const rssUrl = computed(() => {
  const api = apiStore.apiUrl + "rss/";
  if ((props.content as Emission).emissionId) {
    return api + "emission/" + (props.content as Emission).emissionId + ".rss";
  }
  if ((props.content as Playlist).playlistId) {
    return api + "playlist/" + (props.content as Playlist).playlistId + ".rss";
  }
  return undefined;
});


//Watch
watch(()=>props.windowWidth, () =>resizeWindow());

onMounted(()=>resizeWindow());


//Methods
function showAllElements() {
  subscriptionsDisplay.value.forEach((element: Link) => {
    const el = subscribeButtonsContainerRef?.value?.querySelector('#subLink' + element.name);
    if (!el) return;
    if (el.classList.contains("hid")) {
      el.classList.remove("hid");
    }
  });
}
function hideOnlyNecessaryElements() {
  let parentWidth = 0;
  subscriptionsDisplay.value.forEach((element: Link) => {
    const el = subscribeButtonsContainerRef?.value?.querySelector('#subLink' + element.name);
    if (!el) return;
    if (!parentWidth) {
      const buttonMoreWidth = el.clientWidth + 20;
      parentWidth =
        (el.parentElement?.clientWidth ?? 0) +
        (el.parentElement?.offsetLeft ?? 0) -
        buttonMoreWidth;
    }
    if (el.offsetLeft + el.clientWidth + 20 < parentWidth) {
      return;
    }
    hiddenLinks.value.push(element);
    if (!el.classList.contains("hid")) {
      el.className += " hid";
    }
  });
}
function resizeWindow() {
  if (props.windowWidth > 420 && lastWindowWidth.value > 420) {
    lastWindowWidth.value = props.windowWidth;
    return;
  }
  const subscribeList = subscribeButtonsContainerRef?.value as HTMLElement;
  if (
    null === subscribeList ||
    !subscribeList ||
    "none" === subscribeList?.parentElement?.style.display
  ) {
    return;
  }
  lastWindowWidth.value = props.windowWidth;
  subscribeList.style.justifyContent = "flex-start";
  subscribeList.style.flexGrow = "1";
  hiddenLinks.value.length = 0;
  showAllElements();
  hideOnlyNecessaryElements();
  if (!hiddenLinks.value.length && props.justifyCenter) {
    subscribeList.style.justifyContent = "center";
  }
  subscribeList.style.flexGrow = "0";
}
</script>
<style lang="scss">
.octopus-app {
  .subscribe-buttons-container {
    max-width: 420px;
    align-self: center;
    display: inline-flex;
    width: 100%;
    justify-content: center;

    & > div {
      display: inline-flex;
      justify-content: flex-start;
      overflow: hidden;
      width: fit-content;
    }

    @media (width <= 960px) {
      margin-top: 0.8rem;
    }
  }
}
</style>
