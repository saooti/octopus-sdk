<template>
  <section class="module-box">
    <h2 class="mb-3">
      {{ $t("Distribute") }}
    </h2>
    <div class="sharing-distribution-container">
      {{ $t("Rss feed:") }}
      <div class="text-primary hide-small-screen text-break">
        {{ rss }}
      </div>
      <button class="btn btn-primary" @click="onCopyCode(rss, afterCopy)">
        {{ $t("Copy") }}
      </button>
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
    <SnackBar
      v-if="lazyLoadingSnackbar"
      ref="snackbar"
      position="bottom-left"
    />
  </section>
</template>

<script lang="ts">
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
import SnackBar from "../../misc/SnackBar.vue";
import displayHelper from "../../../helper/displayHelper";
import { Emission } from "@/stores/class/general/emission";

import { defineComponent, defineAsyncComponent } from "vue";
import { mapState } from "pinia";
const RssSection = defineAsyncComponent(
  () => import("@/components/display/aggregator/RssSection.vue"),
);
export default defineComponent({
  components: {
    SnackBar,
    RssSection,
    SpotifyIcon,
    YoutubeIcon,
    ApplePodcastIcon,
    DeezerIcon,
    AmazonMusicIcon,
    IHeartIcon,
    PlayerFmIcon,
    PocketCastIcon,
    PodcastAddictIcon,
    TuninIcon,
    RadiolineIcon,
  },
  props: {
    emissionId: { default: undefined, type: Number },
  },

  data() {
    return {
      emission: undefined as Emission | undefined,
      rss: "" as string,
      lazyLoadingSnackbar: false as boolean,
    };
  },
  computed: {
    ...mapState(useApiStore, ["apiUrl"]),
    platformShare() {
      return [
        {
          url: this.getUrl("amazon"),
          icon: "AmazonMusicIcon",
          title: "Amazon Music",
          color: "#0c6cb3",
        },
        {
          url: this.getUrl("apple"),
          icon: "ApplePodcastIcon",
          title: "Apple Podcast / iTunes",
          color:"#aa1dd3"
        },
        { url: this.getUrl("deezer"), 
          icon: "DeezerIcon", 
          title: "Deezer",
          color:"#a238ff" },
        { url: this.getUrl("iHeart"), 
          icon: "IHeartIcon",
          title: "iHeart",
          color:"#e11b22" },
        {
          url: this.getUrl("PlayerFM"),
          icon: "PlayerFmIcon",
          title: "PlayerFM",
          color:"#bb202a"
        },
        {
          url: this.getUrl("PocketCasts"),
          icon: "PocketCastIcon",
          title: "Pocket Casts",
          color:"#f43e37"
        },
        {
          url: this.getUrl("PodcastAddict"),
          icon: "PodcastAddictIcon",
          title: "Podcast Addict",
          color:"#f4842d"
        },
        {
          url: this.getUrl("radioline"),
          icon: "RadiolineIcon",
          title: "Radioline",
          color:"#1678bd"
        },
        {
          url: this.getUrl("spotify"),
          icon: "SpotifyIcon",
          title: "Spotify",
          color: "#1ed760",
        },
        { url: this.getUrl("tuneIn"), 
        icon: "TuninIcon", 
        title: "TuneIn",
      color:"#36b4a7" },
        {
          url: this.getUrl("youtube"),
          icon: "YoutubeIcon",
          title: "YouTube Music",
          color: "#fe0000",
        },
      ];
    },
  },

  mounted() {
    this.getEmissionDetails();
    this.getRSS();
  },

  methods: {
    onCopyCode(link: string, callback: () => void){
      displayHelper.onCopyCode(link, callback);
    },
    getUrl(platform: string): string {
      return `/main/priv/distribution/${platform}/${this.emissionId}`;
    },
    async getEmissionDetails(): Promise<void> {
      this.emission = await classicApi.fetchData<Emission>({
        api: 0,
        path: "emission/" + this.emissionId,
      });
    },
    getRSS(): void {
      if (!this.$props.emissionId || this.$props.emissionId <= 0) return;
      this.rss = `${this.apiUrl}rss/emission/${this.emissionId}.rss`;
    },
    afterCopy(): void {
      if (!this.lazyLoadingSnackbar) {
        this.lazyLoadingSnackbar = true;
        setTimeout(() => {
          this.afterCopy();
        }, 500);
      } else {
        (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
          this.$t("Link in clipboard"),
        );
      }
    },
  },
});
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
