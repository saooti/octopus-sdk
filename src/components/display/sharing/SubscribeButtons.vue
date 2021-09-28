<template>
  <div class="module-box flex-no-grow">
    <div class="d-flex align-items-center mb-3">
      <h3 class="mb-0 share-button-title">{{ $t('Subscribe emission') }}</h3>
    </div>
    <div class="d-flex flex-wrap">
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="amazon"
        v-if="amazon"
        aria-label="amazon"
      >
        <span class="saooti-amazon">
          <div class="path1"></div>
          <div class="path2"></div>
          <div class="path3"></div>
        </span>
      </a>
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="applePodcast"
        v-if="applePodcast"
        aria-label="Apple"
      >
        <span class="saooti-apple"></span>
      </a>
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="deezer"
        v-if="deezer"
        aria-label="Deezer"
      >
        <span class="saooti-deezer"></span>
      </a>
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="playerFm"
        v-if="playerFm"
        aria-label="playerFm"
      >
        <span class="saooti-playerfm"></span>
      </a>
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="podcastAddict"
        v-if="podcastAddict"
        aria-label="podcastAddict"
      >
        <span class="saooti-podcast-addict"></span>
      </a>
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 btn-radioline share-btn"
        :href="radioline"
        v-if="radioline"
        aria-label="Radioline"
      >
        <span class="saooti-radioline"></span>
      </a>
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="spotify"
        v-if="spotify"
        aria-label="Spotify"
      >
        <span class="saooti-spotify"></span>
      </a>
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="stitcher"
        v-if="stitcher"
        aria-label="stitcher"
      >
        <span class="saooti-stitcher-logo">
          <div class="path1"></div>
          <div class="path2"></div>
          <div class="path3"></div>
          <div class="path4"></div>
          <div class="path5"></div>
          <div class="path6"></div>
          <div class="path7"></div>
          <div class="path8"></div>
          <div class="path9"></div>
          <div class="path10"></div>
          <div class="path11"></div>
          <div class="path12"></div>
          <div class="path13"></div>
          <div class="path14"></div>
          <div class="path15"></div>
          <div class="path16"></div>
          <div class="path17"></div>
          <div class="path18"></div> </span
        >
      </a>
      <a
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="tunein"
        v-if="tunein"
        aria-label="Tunin"
      >
        <span class="saooti-tunin"></span>
      </a>
    </div>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
import { Emission } from '@/store/class/emission';
export default {
  props: {
    emission: { default: undefined as Emission|undefined},
    podcastId: { default: undefined as number|undefined},
  },
  components: {},

   data() {
    return {
      applePodcast:
        this.emission && this.emission.annotations
          ? this.emission.annotations.applePodcast
          : undefined as string | undefined,
      deezer:
        this.emission && this.emission.annotations
          ? this.emission.annotations.deezer
          : undefined as string | undefined,
      spotify:
        this.emission && this.emission.annotations
          ? this.emission.annotations.spotify
          : undefined as string | undefined,
      tunein:
        this.emission && this.emission.annotations
          ? this.emission.annotations.tunein
          : undefined as string | undefined,
      radioline:
        this.emission && this.emission.annotations
          ? this.emission.annotations.radioline
          : undefined as string | undefined,
      podcastAddict:
        this.emission && this.emission.annotations
          ? this.emission.annotations.podcastAddict
          : undefined as string | undefined,
      playerFm:
        this.emission && this.emission.annotations
          ? this.emission.annotations.playerFm
          : undefined as string | undefined,
      stitcher:
        this.emission && this.emission.annotations
          ? this.emission.annotations.stitcher
          : undefined as string | undefined,
      amazon:
        this.emission && this.emission.annotations
          ? this.emission.annotations.amazon
          : undefined as string | undefined,
    };
  },

  mounted() {
    this.applePodcast = this.externaliseLinks(this.applePodcast);
    this.deezer = this.externaliseLinks(this.deezer);
    this.spotify = this.externaliseLinks(this.spotify);
    this.tunein = this.externaliseLinks(this.tunein);
    this.radioline = this.externaliseLinks(this.radioline);
    this.podcastAddict = this.externaliseLinks(this.podcastAddict);
    this.playerFm = this.externaliseLinks(this.playerFm);
    this.stitcher = this.externaliseLinks(this.stitcher);
    this.amazon = this.externaliseLinks(this.amazon);
  },

  computed: {},

  methods: {
    externaliseLinks(link?: string): string|undefined {
      if (!link) return link;
      link = link.trim();
      if (!link.startsWith('http') && !link.startsWith('//'))
        return '//' + link;
      return link;
    },
  },
};
</script>
