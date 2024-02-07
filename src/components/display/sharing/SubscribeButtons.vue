<template>
  <div v-if="subscriptionsDisplay.length || rssUrl" class="subscribe-buttons-container">
    <div ref="subscribeButtonsContainer">
      <a
        v-for="(sub, index) in subscriptionsDisplay"
        :key="sub.name"
        :ref="'subLink' + sub.name"
        rel="noopener"
        target="_blank"
        :class="[
          0 === index ? 'first' : '',
          subscriptionsDisplay.length - 1 === index ? 'last' : '',
        ]"
        class="btn share-btn mx-2"
        :href="sub.url"
        :title="sub.title"
      >
        <span :class="sub.icon" />
      </a>
    </div>
    <a
      rel="noopener"
      target="_blank"
      class="btn share-btn mx-2 saooti-rss"
      :href="rssUrl"
      :title="$t('Rss feed')"
    />
    <button
      v-show="hiddenLinks.length"
      id="subscribe-buttons-dropdown"
      class="btn share-btn mx-2 saooti-more"
      :title="$t('See more')"
    />
    <teleport to=".octopus-app">
      <ClassicPopover
        target="subscribe-buttons-dropdown"
        :only-click="true"
        :is-fixed="true"
        :left-pos="true"
      >
        <a
          v-for="link in hiddenLinks"
          :key="link.name"
          rel="noopener"
          target="_blank"
          class="octopus-dropdown-item justify-content-start"
          :href="link.url"
        >
          <span :class="link.icon" class="me-1" /> {{ link.title }}
        </a>
      </ClassicPopover>
    </teleport>
  </div>
</template>

<script lang="ts">
import { state } from "../../../stores/ParamSdkStore";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import { Emission } from "@/stores/class/general/emission";
import { defineComponent } from "vue";
type Link = {
  name: string;
  icon: string;
  title: string;
  url: string | undefined;
};
export default defineComponent({
  name: "SubscribeButtons",
  components: {
    ClassicPopover,
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
    };
  },
  computed: {
    subscriptionsDisplay(): Array<Link> {
      const sub = [
        {
          name: "applePodcast",
          icon: "saooti-apple",
          title: "Apple Podcast | iTunes",
          url: this.getUrl("applePodcast"),
        },
        {
          name: "deezer",
          icon: "saooti-deezer",
          title: "Deezer",
          url: this.getUrl("deezer"),
        },
        {
          name: "googlePodcasts",
          icon: "saooti-google-podcasts",
          title: "Google Podcasts",
          url: this.getUrl("googlePodcasts"),
        },
        {
          name: "spotify",
          icon: "saooti-spotify",
          title: "Spotify",
          url: this.getUrl("spotify"),
        },
        {
          name: "amazon",
          icon: "saooti-amzn",
          title: "Amazon Music | Podcasters",
          url: this.getUrl("amazon"),
        },

        {
          name: "iHeart",
          icon: "saooti-iheart",
          title: "iHeart",
          url: this.getUrl("iHeart"),
        },
        {
          name: "playerFm",
          icon: "saooti-playerfm",
          title: "PlayerFM",
          url: this.getUrl("playerFm"),
        },
        {
          name: "pocketCasts",
          icon: "saooti-pocket-casts",
          title: "Pocket Casts",
          url: this.getUrl("pocketCasts"),
        },
        {
          name: "podcastAddict",
          icon: "saooti-podcast-addict",
          title: "Podcast Addict",
          url: this.getUrl("podcastAddict"),
        },
        {
          name: "radioline",
          icon: "saooti-radioline",
          title: "Radioline",
          url: this.getUrl("radioline"),
        },

        {
          name: "tunein",
          icon: "saooti-tunin",
          title: "TuneIn",
          url: this.getUrl("tunein"),
        },
      ];
      return sub.filter((item) => item.url);
    },
    rssUrl(): string | undefined {
      let api = state.generalParameters.ApiUri + "rss/";
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
      this.hiddenLinks.length = 0;
      this.subscriptionsDisplay.forEach((element: Link) => {
        const el = (
          this.$refs["subLink" + element.name] as Array<HTMLElement>
        )[0];
        if (!el) return;
        if (el.classList.contains("hid")) {
          el.classList.remove("hid");
        }
      });
      this.subscriptionsDisplay.forEach((element: Link) => {
        const el = (
          this.$refs["subLink" + element.name] as Array<HTMLElement>
        )[0];
        if (!el) return;
        const parent = el.parentElement;
        if (
          parent &&
          el.offsetLeft + el.clientWidth + 20 <
            parent.clientWidth + parent.offsetLeft
        ) {
          return;
        }
        this.hiddenLinks.push(element);
        if (!el.classList.contains("hid")) {
          el.className += " hid";
        }
      });
      if (!this.hiddenLinks.length && this.justifyCenter) {
        subscribeList.style.justifyContent = "center";
      }
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
      //flex-grow: 1;
      width: fit-content;
      //width: 0;
    }
  }
}
</style>
