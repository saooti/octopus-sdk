<template>
  <div class="module-box">
    <h3>{{ $t('Distribute') }}</h3>
    <p class="sharing-distribution-container">
      {{ $t('Rss feed:') }}
      <span class="primary-color text-break">{{ rss }}</span>
      <input
        type="button"
        :value="$t('Copy')"
        class="btn btn-primary"
        :aria-label="$t('Copy')"
        @click="onCopyCode(rss, afterCopy)"
      >
    </p>
    <RssSection
      v-if="emission"
      :emission="emission"
    />
    <div class="sharing-distribution-container">
      <router-link
        :to="'/main/priv/distribution/amazon/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-amazon">
          <div class="path1" />
          <div class="path2" />
          <div class="path3" />
        </span> Amazon Music | Podcasters
      </router-link>
      <router-link
        :to="'/main/priv/distribution/apple/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-apple" />Apple Podcast / iTunes
      </router-link>
      <router-link
        :to="'/main/priv/distribution/deezer/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-deezer" />Deezer
      </router-link>
      <router-link
        :to="'/main/priv/distribution/PlayerFM/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-playerfm" />PlayerFM
      </router-link>
      <router-link
        :to="'/main/priv/distribution/PocketCasts/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-pocket-casts" />Pocket Casts
      </router-link>
      <router-link
        :to="'/main/priv/distribution/PodcastAddict/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-podcast-addict" />Podcast Addict
      </router-link>
      <router-link
        :to="'/main/priv/distribution/radioline/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-radioline" />Radioline
      </router-link>
      <router-link
        :to="'/main/priv/distribution/spotify/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-spotify" />Spotify
      </router-link>

      <router-link
        :to="'/main/priv/distribution/Stitcher/' + emissionId"
        class="text-dark"
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
          <div class="path18" /> </span>Stitcher
      </router-link>

      <router-link
        :to="'/main/priv/distribution/tuneIn/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-tunin" />TuneIn
      </router-link>
    </div>
    <Snackbar
      ref="snackbar"
      position="bottom-left"
    />
  </div>
</template>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import Snackbar from '../../misc/Snackbar.vue';
import { displayMethods } from '../../mixins/functions';
import { Emission } from '@/store/class/emission';

import { defineComponent, defineAsyncComponent } from 'vue';
const RssSection = defineAsyncComponent(() => import('@/components/display/aggregator/RssSection.vue'));
export default defineComponent({
  components: {
    Snackbar,
    RssSection,
  },
  mixins: [displayMethods],
  props: {
    emissionId: { default: undefined, type: Number},
  },
  
  data() {
    return {
      emission: undefined as Emission|undefined,
      error: false as boolean,
      baseRss: '' as string,
      rss: '' as string,
    };
  },

  mounted() {
    this.getEmissionDetails();
    this.getRSS();
  },

  methods: {
    async getEmissionDetails(): Promise<void> {
      try {
        const data = await octopusApi.fetchEmission(this.emissionId);
        this.emission = data;
      } catch {
        this.error = true;
      }
    },
    getRSS(): void {
      if (!this.$props.emissionId || this.$props.emissionId <= 0) return;
      this.baseRss = octopusApi.fetchRSS(this.emissionId);
      this.rss = this.baseRss;
    },
    afterCopy(): void{
      (this.$refs.snackbar as any).open(this.$t('Link in clipboard'));
    }
  },
})
</script>

<style lang="scss">
.sharing-distribution-container {
  border: 0.05rem solid #dee2e6;
  border-radius: 0.3rem;
  padding: 0.4rem;
  margin: 0.2rem 1rem 0.2rem 0;
  display: flex;
  font-weight: 500;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  .saooti-stitcher-logo, .saooti-amazon {
    width: 35px;
    height: 20px;
    div {
      right: 0;
    }
  }
  a {
    display: flex;
    align-items: center;
    margin: 5px;
  }
  span {
    font-size: 1.3em;
    margin: 0 0.3em 0 0;
    &.saooti-tunin {
      font-size: 2.5em;
    }
    &.saooti-radioline {
      font-size: 2em;
    }
  }
  @media (max-width: 960px) {
    flex-wrap: wrap;
    margin: 0.2rem 0.5rem;
  }
  @media (max-width: 450px) {
    .primary-color {
      display: none;
    }
  }
}
</style>