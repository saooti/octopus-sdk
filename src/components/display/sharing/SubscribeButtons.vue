<template>
  <div
    v-if="subscriptionsDisplay.length || rssUrl"
    class="subscribe-buttons-container"
  >
    <div ref="subscribeButtonsContainer">
      <a
        v-for="(sub, index) in subscriptionsDisplay"
        :key="sub.name"
        :ref="'subLink' + sub.name"
        rel="noreferrer noopener"
        target="_blank"
        :class="[
          0 === index ? 'first' : '',
          subscriptionsDisplay.length - 1 === index ? 'last' : '',
        ]"
        class="btn share-btn mx-2"
        :href="sub.url"
        :title="$t('New window', {text: sub.title})"
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
      :title="$t('New window', {text: $t('Rss feed')})"
    >
      <RssIcon />
    </a>
    <button
      v-show="hiddenLinks.length"
      id="subscribe-buttons-dropdown"
      class="btn share-btn mx-2"
      :title="$t('See more')"
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
        :title="$t('New window', {text: link.title})"
      >
        <component :is="link.icon" :fill-color="link.color" class="me-1" />
        {{ link.title }}
      </a>
    </ClassicPopover>
  </div>
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
import PlusIcon from "vue-material-design-icons/Plus.vue";
import RssIcon from "vue-material-design-icons/Rss.vue";
import { mapState } from "pinia";
import { useApiStore } from "../../../stores/ApiStore";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import { Emission } from "@/stores/class/general/emission";
import { defineComponent } from "vue";
type Link = {
  name: string;
  icon: string;
  title: string;
  color?: string;
  url: string | undefined;
};
export default defineComponent({
  name: "SubscribeButtons",
  components: {
    ClassicPopover,
    RssIcon,
    PlusIcon,
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
    emission: { default: undefined, type: Object as () => Emission },
    playlistId: { default: undefined, type: Number },
    windowWidth: { default: 0, type: Number },
    justifyCenter: { default: true, type: Boolean },
  },
  data() {
    return {
      hiddenLinks: [] as Array<Link>,
      lastWindowWidth: 420 as number,
      exclusive: false as boolean,
      notExclusive: false as boolean,
    };
  },
  computed: {
    ...mapState(useApiStore, ["apiUrl"]),
    subscriptionsDisplay(): Array<Link> {
      const sub = [
        {
          name: "applePodcast",
          icon: "ApplePodcastIcon",
          title: "Apple Podcast | iTunes",
          url: this.getUrl("applePodcast"),
          color:"#aa1dd3"
        },
        {
          name: "deezer",
          icon: "DeezerIcon",
          title: "Deezer",
          color:"#a238ff",
          url: this.getUrl("deezer"),
        },
        {
          name: "spotify",
          icon: "SpotifyIcon",
          title: "Spotify",
          color: "#1ed760",
          url: this.getUrl("spotify"),
        },
        {
          name: "amazon",
          icon: "AmazonMusicIcon",
          title: "Amazon Music",
          color: "#0c6cb3",
          url: this.getUrl("amazon"),
        },

        {
          name: "iHeart",
          icon: "IHeartIcon",
          title: "iHeart",
          url: this.getUrl("iHeart"),
          color:"#e11b22"
        },
        {
          name: "playerFm",
          icon: "PlayerFmIcon",
          title: "PlayerFM",
          url: this.getUrl("playerFm"),
          color:"#bb202a"
        },
        {
          name: "pocketCasts",
          icon: "PocketCastIcon",
          title: "Pocket Casts",
          url: this.getUrl("pocketCasts"),
          color:"#f43e37"
        },
        {
          name: "podcastAddict",
          icon: "PodcastAddictIcon",
          title: "Podcast Addict",
          url: this.getUrl("podcastAddict"),
          color:"#f4842d"
        },
        {
          name: "radioline",
          icon: "RadiolineIcon",
          title: "Radioline",
          url: this.getUrl("radioline"),
          color:"#1678bd"
        },

        {
          name: "tunein",
          icon: "TuninIcon",
          title: "TuneIn",
          url: this.getUrl("tunein"),
          color:"#36b4a7"
        },
        {
          name: "youtube",
          icon: "YoutubeIcon",
          title: "YouTube Music",
          color: "#fe0000",
          url: this.getUrl("youtube"),
        },
      ];
      return sub.filter((item) => item.url);
    },
    rssUrl(): string | undefined {
      const api = this.apiUrl + "rss/";
      if (this.emission) {
        return api + "emission/" + this.emission?.emissionId + ".rss";
      }
      if (this.playlistId) {
        return api + "playlist/" + this.playlistId + ".rss";
      }
      return undefined;
    },
  },
  watch: {
    windowWidth() {
      this.resizeWindow();
    },
  },
  mounted() {
    this.resizeWindow();
  },
  methods: {
    getUrl(sub: string): string | undefined {
      return this.externaliseLinks(
        this.emission?.annotations?.[sub] as string | undefined,
      );
    },
    externaliseLinks(link?: string): string | undefined {
      if (!link) return link;
      link = link.trim();
      return !link.startsWith("http") && !link.startsWith("//")
        ? "//" + link
        : link;
    },
    showAllElements() {
      this.subscriptionsDisplay.forEach((element: Link) => {
        const el = (
          this.$refs["subLink" + element.name] as Array<HTMLElement>
        )[0];
        if (!el) return;
        if (el.classList.contains("hid")) {
          el.classList.remove("hid");
        }
      });
    },
    hideOnlyNecessaryElements() {
      let parentWidth = 0;
      this.subscriptionsDisplay.forEach((element: Link) => {
        const el = (
          this.$refs["subLink" + element.name] as Array<HTMLElement>
        )[0];
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
        this.hiddenLinks.push(element);
        if (!el.classList.contains("hid")) {
          el.className += " hid";
        }
      });
    },
    resizeWindow() {
      if (this.windowWidth > 420 && this.lastWindowWidth > 420) {
        this.lastWindowWidth = this.windowWidth;
        return;
      }
      const subscribeList = this.$refs.subscribeButtonsContainer as HTMLElement;
      if (
        null === subscribeList ||
        !subscribeList ||
        "none" === subscribeList?.parentElement?.style.display
      ) {
        return;
      }
      this.lastWindowWidth = this.windowWidth;
      subscribeList.style.justifyContent = "flex-start";
      subscribeList.style.flexGrow = "1";
      this.hiddenLinks.length = 0;
      this.showAllElements();
      this.hideOnlyNecessaryElements();
      if (!this.hiddenLinks.length && this.justifyCenter) {
        subscribeList.style.justifyContent = "center";
      }
      subscribeList.style.flexGrow = "0";
    },
  },
});
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
