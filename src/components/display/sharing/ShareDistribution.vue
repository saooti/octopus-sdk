<template>
  <div class="module-box">
    <h3>{{ $t('Distribute') }}</h3>
    <p class="sharing-distribution-container">
      {{ $t('Rss feed:') }}
      <span class="primary-darker hide-small-screen text-break">{{ rss }}</span>
      <input
        type="button"
        :value="$t('Copy')"
        class="btn btn-primary"
        :title="$t('Copy')"
        @click="onCopyCode(rss, afterCopy)"
      >
    </p>
    <RssSection
      v-if="emission"
      :emission="emission"
    />
    <div class="sharing-distribution-container">
      <router-link 
        v-for="platform in platformShare" 
        :key="platform.title"
        :to="platform.url"
        class="text-dark"
      >
        <span :class="platform.icon">
          <div v-for="index in platform.path" :key="index" :class="'path'+index" />
        </span>{{platform.title}}
      </router-link>
    </div>
    <Snackbar
      ref="snackbar"
      position="bottom-left"
    />
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
import Snackbar from '../../misc/Snackbar.vue';
import { displayMethods } from '../../mixins/functions';
import { Emission } from '@/store/class/general/emission';

import { defineComponent, defineAsyncComponent } from 'vue';
import SnackbarVue from '../../misc/Snackbar.vue';
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
      rss: '' as string,
    };
  },
  computed:{
    platformShare(){
      return [
      {url:this.getUrl('amazon'), icon:'saooti-amazon', title:'Amazon Music | Podcasters', path:3},
      {url:this.getUrl('apple'), icon:'saooti-apple', title:'Apple Podcast / iTunes', path:0},
      {url:this.getUrl('deezer'), icon:'saooti-deezer', title:'Deezer', path:0},
      {url:this.getUrl('googlePodcasts'), icon:'saooti-google-podcasts', title:'Google Podcasts', path:7},
      {url:this.getUrl('PlayerFM'), icon:'saooti-playerfm', title:'PlayerFM', path:0},
      {url:this.getUrl('PocketCasts'), icon:'saooti-pocket-casts', title:'Pocket Casts', path:0},
      {url:this.getUrl('PodcastAddict'), icon:'saooti-podcast-addict', title:'Podcast Addict', path:0},
      {url:this.getUrl('radioline'), icon:'saooti-radioline', title:'Radioline', path:0},
      {url:this.getUrl('spotify'), icon:'saooti-spotify', title:'Spotify', path:0},
      {url:this.getUrl('Stitcher'), icon:'saooti-stitcher-logo', title:'Stitcher', path:18},
      {url:this.getUrl('tuneIn'), icon:'saooti-tunin', title:'TuneIn', path:0}];
    }
  },

  mounted() {
    this.getEmissionDetails();
    this.getRSS();
  },

  methods: {
    getUrl(platform: string): string{
      return `/main/priv/distribution/${platform}/${this.emissionId}`;
    },
    async getEmissionDetails(): Promise<void> {
      this.emission = await octopusApi.fetchData<Emission>(0,'emission/'+this.emissionId);
    },
    getRSS(): void {
      if (!this.$props.emissionId || this.$props.emissionId <= 0) return;
      this.rss = `${state.octopusApi.url}rss/emission/${this.emissionId}.rss`;
    },
    afterCopy(): void{
      (this.$refs.snackbar as InstanceType<typeof SnackbarVue>).open(this.$t('Link in clipboard'));
    }
  },
})
</script>

<style lang="scss">
.octopus-app{
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
  .saooti-google-podcasts {
    width: 15px;
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
}
}
</style>