<template>
  <div class="module-box flex-grow-0">
    <h2 class="big-h2 mb-3 height-40">
      {{ $t("Subscribe emission") }}
    </h2>
    <template v-for="(sub, index) in subscriptionsDisplay" :key="sub.name">
      <a
        rel="noopener"
        target="_blank"
        :class="[
          0 === index ? 'first' : '',
          subscriptionsDisplay.length - 1 === index ? 'last' : '',
        ]"
        class="btn share-btn mb-2 mx-2"
        :href="sub.url"
        :title="sub.title"
      >
        <span :class="sub.icon" />
      </a>
    </template>
  </div>
</template>

<script lang="ts">
import { Emission } from "@/stores/class/general/emission";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    emission: { default: undefined, type: Object as () => Emission },
    podcastId: { default: undefined, type: Number },
  },
  computed: {
    subscriptionsDisplay() {
      const sub = [
        {
          name: "amazon",
          icon: "saooti-amzn",
          title: "Amazon Music | Podcasters",
          url: this.getUrl("amazon"),
        },
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
          name: "spotify",
          icon: "saooti-spotify",
          title: "Spotify",
          url: this.getUrl("spotify"),
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
  },
});
</script>
<style lang="scss">
.height-40 {
  height: 40px;
}
</style>
