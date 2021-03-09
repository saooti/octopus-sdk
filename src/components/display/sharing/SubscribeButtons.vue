<template>
  <div class="module-box flex-no-grow">
    <div class="d-flex align-items-center mb-3">
      <h3 class="mb-0 share-button-title">{{ $t('Subscribe emission') }}</h3>
    </div>
    <div class="d-flex">
      <a
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="applePodcast"
        v-if="applePodcast"
        aria-label="Apple"
      >
        <span class="saooti-apple"></span>
      </a>
      <a
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="deezer"
        v-if="deezer"
        aria-label="Deezer"
      >
        <span class="saooti-deezer"></span>
      </a>
      <a
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="spotify"
        v-if="spotify"
        aria-label="Spotify"
      >
        <span class="saooti-spotify"></span>
      </a>
      <a
        target="_blank"
        class="btn mr-3 mb-2 share-btn"
        :href="tunein"
        v-if="tunein"
        aria-label="Tunin"
      >
        <span class="saooti-tunin"></span>
      </a>
      <a
        target="_blank"
        class="btn mr-3 mb-2 btn-tootak share-btn"
        :href="tootak"
        v-if="tootak"
        aria-label="Tootak"
      >
        <span class="saooti-tootak"></span>
      </a>
      <a
        target="_blank"
        class="btn mr-3 mb-2 btn-radioline share-btn"
        :href="radioline"
        v-if="radioline"
        aria-label="Radioline"
      >
        <span class="saooti-radioline"></span>
      </a>
    </div>
  </div>
</template>

<style lang="scss">
.saooti-tunin {
  color: #36b4a7;
}
.saooti-radioline {
  color: #2273b9;
}
.saooti-tootak {
  color: #ff4d53;
}
.flex-no-grow {
  flex-grow: 0 !important;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: ['podcastId', 'emission'],

  components: {},

  mounted() {
    this.applePodcast = this.externaliseLinks(this.applePodcast);
    this.deezer = this.externaliseLinks(this.deezer);
    this.spotify = this.externaliseLinks(this.spotify);
    this.tunein = this.externaliseLinks(this.tunein);
    this.tootak = this.externaliseLinks(this.tootak);
    this.radioline = this.externaliseLinks(this.radioline);
  },

  data() {
    return {
      applePodcast:
        this.emission && this.emission.annotations
          ? this.emission.annotations.applePodcast
          : undefined as any,
      deezer:
        this.emission && this.emission.annotations
          ? this.emission.annotations.deezer
          : undefined as any,
      spotify:
        this.emission && this.emission.annotations
          ? this.emission.annotations.spotify
          : undefined as any,
      tunein:
        this.emission && this.emission.annotations
          ? this.emission.annotations.tunein
          : undefined as any,
      tootak:
        this.emission && this.emission.annotations
          ? this.emission.annotations.tootak
          : undefined as any,
      radioline:
        this.emission && this.emission.annotations
          ? this.emission.annotations.radioline
          : undefined as any,
    };
  },

  computed: {},

  methods: {
    externaliseLinks(link?: string) {
      if (!link) return link;
      link = link.trim();
      if (!link.startsWith('http') && !link.startsWith('//'))
        return '//' + link;
      return link;
    },
  },
});
</script>
