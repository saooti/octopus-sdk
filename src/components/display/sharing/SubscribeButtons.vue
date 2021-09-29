<template>
  <div class="module-box flex-no-grow">
    <div class="d-flex align-items-center mb-3">
      <h3 class="mb-0 share-button-title">
        {{ $t('Subscribe emission') }}
      </h3>
    </div>
    <div class="d-flex flex-wrap">
      <a
        v-if="amazon"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="amazon"
        aria-label="amazon"
      >
        <span class="saooti-amazon">
          <div class="path1" />
          <div class="path2" />
          <div class="path3" />
        </span>
      </a>
      <a
        v-if="applePodcast"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="applePodcast"
        aria-label="Apple"
      >
        <span class="saooti-apple" />
      </a>
      <a
        v-if="deezer"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="deezer"
        aria-label="Deezer"
      >
        <span class="saooti-deezer" />
      </a>
      <a
        v-if="playerFm"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="playerFm"
        aria-label="playerFm"
      >
        <span class="saooti-playerfm" />
      </a>
      <a
        v-if="podcastAddict"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="podcastAddict"
        aria-label="podcastAddict"
      >
        <span class="saooti-podcast-addict" />
      </a>
      <a
        v-if="radioline"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 btn-radioline share-btn"
        :href="radioline"
        aria-label="Radioline"
      >
        <span class="saooti-radioline" />
      </a>
      <a
        v-if="spotify"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="spotify"
        aria-label="Spotify"
      >
        <span class="saooti-spotify" />
      </a>
      <a
        v-if="stitcher"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="stitcher"
        aria-label="stitcher"
      >
        <span class="saooti-stitcher-logo">
          <div class="path1" />
          <div class="path2" />
          <div class="path3" />
          <div class="path4" />
          <div class="path5" />
          <div class="path6" />
          <div class="path7" />
          <div class="path8" />
          <div class="path9" />
          <div class="path10" />
          <div class="path11" />
          <div class="path12" />
          <div class="path13" />
          <div class="path14" />
          <div class="path15" />
          <div class="path16" />
          <div class="path17" />
          <div class="path18" /> </span>
      </a>
      <a
        v-if="tunein"
        rel="noopener"
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="tunein"
        aria-label="Tunin"
      >
        <span class="saooti-tunin" />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { Emission } from '@/store/class/emission';
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    emission: { default: undefined, type: Object as ()=> Emission},
    podcastId: { default: undefined, type: Number},
  },
   
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

  computed: {},

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

  methods: {
    externaliseLinks(link?: string): string|undefined {
      if (!link) return link;
      link = link.trim();
      if (!link.startsWith('http') && !link.startsWith('//'))
        return '//' + link;
      return link;
    },
  },
})
</script>

<style lang="scss"></style>