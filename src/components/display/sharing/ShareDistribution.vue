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
        @click="onCopyCode(rss, afterCopy)"
        :aria-label="$t('Copy')"
      />
    </p>
    <RssSection :emission="emission" v-if="emission" />
    <div class="sharing-distribution-container">
      <router-link
        v-bind:to="'/main/priv/distribution/amazon/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-amazon">
          <div class="path1"></div>
          <div class="path2"></div>
          <div class="path3"></div>
        </span> Amazon Music | Podcasters
      </router-link>
       <router-link
        v-bind:to="'/main/priv/distribution/apple/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-apple" />Apple Podcast / iTunes
      </router-link>
      <router-link
        v-bind:to="'/main/priv/distribution/deezer/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-deezer" />Deezer
      </router-link>
       <router-link
        v-bind:to="'/main/priv/distribution/PlayerFM/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-playerfm" />PlayerFM
      </router-link>
       <router-link
        v-bind:to="'/main/priv/distribution/PocketCasts/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-pocket-casts"></span>Pocket Casts
      </router-link>
      <router-link
        v-bind:to="'/main/priv/distribution/PodcastAddict/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-podcast-addict" />Podcast Addict
      </router-link>
      <router-link
        v-bind:to="'/main/priv/distribution/radioline/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-radioline" />Radioline
      </router-link>
      <router-link
        v-bind:to="'/main/priv/distribution/spotify/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-spotify" />Spotify
      </router-link>

      <router-link
        v-bind:to="'/main/priv/distribution/Stitcher/' + emissionId"
        class="text-dark"
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
        >Stitcher
      </router-link>

      <router-link
        v-bind:to="'/main/priv/distribution/tuneIn/' + emissionId"
        class="text-dark"
      >
        <span class="saooti-tunin" />TuneIn
      </router-link>
    </div>
    <Snackbar ref="snackbar" position="bottom-left"></Snackbar>
  </div>
</template>
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
<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import Snackbar from '../../misc/Snackbar.vue';
import { displayMethods } from '../../mixins/functions';
import { Emission } from '@/store/class/emission';

export default{
  components: {
    Snackbar,
    RssSection: () => import('@/components/display/aggregator/RssSection.vue'),
  },
  mixins: [displayMethods],
  props: {
    emissionId: { default: undefined as number|undefined},
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
};
</script>
