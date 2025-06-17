<template>
  <section class="module-box">
    <h2 class="mb-3">
      {{ t("Distribute") }}
    </h2>
    <div class="sharing-distribution-container">
      {{ t("Rss feed:") }}
      <div class="text-primary hide-small-screen text-break">
        {{ rss }}
      </div>
      <ClassicCopyButton
        :text="t('Copy')"
        :text-after-copy="t('Copied!')"
        :data-to-copy="rss"
        :snackbar-text="t('Link in clipboard')"
      />
    </div>
    <RssSection v-if="emission" :emission="emission" />
    <div class="sharing-distribution-container">
      <router-link
        v-for="platform in platformShare"
        :key="platform.title"
        :to="platform.url"
        class="text-dark"
      >
        <component
          :is="platform.icon"
          :fill-color="platform?.color"
          class="me-1"
        />{{ platform.title }}
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import ClassicCopyButton from "../../form/ClassicCopyButton.vue";
import RadiolineIcon from "../../icons/RadiolineIcon.vue";
import TuninIcon from "../../icons/TuninIcon.vue";
import PodcastAddictIcon from "../../icons/PodcastAddictIcon.vue";
import PocketCastIcon from "../../icons/PocketCastIcon.vue";
import PlayerFmIcon from "../../icons/PlayerFmIcon.vue";
import IHeartIcon from "../../icons/IHeartIcon.vue";
import AmazonMusicIcon from "../../icons/AmazonMusicIcon.vue";
import DeezerIcon from "../../icons/DeezerIcon.vue";
import ApplePodcastIcon from "../../icons/ApplePodcastIcon.vue";
import YoutubeIcon from "vue-material-design-icons/Youtube.vue";
import SpotifyIcon from "vue-material-design-icons/Spotify.vue";
import { useApiStore } from "../../../stores/ApiStore";
import classicApi from "../../../api/classicApi";
import { Emission } from "@/stores/class/general/emission";

import {  defineAsyncComponent, ref, Ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const RssSection = defineAsyncComponent(
  () => import("@/components/display/aggregator/RssSection.vue"),
);

//Props 
const props = defineProps({
  emissionId: { default: undefined, type: Number },
})

//Data 
const rss = ref("");
const emission : Ref<Emission | undefined>= ref(undefined);

//Composables
const { t } = useI18n();
const apiStore = useApiStore();

//Computed
const platformShare = computed(() => {
  return [
    {
      url: getUrl("amazon"),
      icon: AmazonMusicIcon,
      title: "Amazon Music",
      color: "#0c6cb3",
    },
    {
      url: getUrl("apple"),
      icon: ApplePodcastIcon,
      title: "Apple Podcast / iTunes",
      color:"#aa1dd3"
    },
    { url: getUrl("deezer"), 
      icon: DeezerIcon, 
      title: "Deezer",
      color:"#a238ff" },
    { url: getUrl("iHeart"), 
      icon: IHeartIcon,
      title: "iHeart",
      color:"#e11b22" },
    {
      url: getUrl("PlayerFM"),
      icon: PlayerFmIcon,
      title: "PlayerFM",
      color:"#bb202a"
    },
    {
      url: getUrl("PocketCasts"),
      icon: PocketCastIcon,
      title: "Pocket Casts",
      color:"#f43e37"
    },
    {
      url: getUrl("PodcastAddict"),
      icon: PodcastAddictIcon,
      title: "Podcast Addict",
      color:"#f4842d"
    },
    {
      url: getUrl("radioline"),
      icon: RadiolineIcon,
      title: "Radioline",
      color:"#1678bd"
    },
    {
      url: getUrl("spotify"),
      icon: SpotifyIcon,
      title: "Spotify",
      color: "#1ed760",
    },
    { url: getUrl("tuneIn"), 
    icon: TuninIcon, 
    title: "TuneIn",
    color:"#36b4a7" },
    {
      url: getUrl("youtube"),
      icon: YoutubeIcon,
      title: "YouTube Music",
      color: "#fe0000",
    },
  ];
});


onMounted(()=>{
  getEmissionDetails();
  getRSS();
})


//Methods
function getUrl(platform: string): string {
  return `/main/priv/distribution/${platform}/${props.emissionId}`;
}
async function getEmissionDetails(): Promise<void> {
  emission.value = await classicApi.fetchData<Emission>({
    api: 0,
    path: "emission/" + props.emissionId,
  });
}
function getRSS(): void {
  if (!props.emissionId || props.emissionId <= 0) return;
  rss.value = `${apiStore.apiUrl}rss/emission/${props.emissionId}.rss`;
}
</script>

<style lang="scss">


.octopus-app {
  .sharing-distribution-container {
    border: 0.05rem solid var(--octopus-border-default);
    border-radius: var(--octopus-border-radius);
    padding: 0.4rem;
    margin: 0.2rem 1rem 0.2rem 0;
    display: flex;
    font-weight: 500;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;

    a {
      display: flex;
      align-items: center;
      margin: 5px;
    }

    span {
      font-size: 1.4rem;
      margin: 0 0.3em 0 0;
    }

    @media (width <= 960px) {
      flex-wrap: wrap;
      margin: 0.2rem 0.5rem;
    }
  }
}
</style>
