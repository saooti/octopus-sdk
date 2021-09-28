<template>
  <div class="d-flex flex-column align-items-center">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading content ...') }}</h3>
    </div>
    <div v-if="loaded && playlists.length > 1" class="text-secondary mb-2">
      {{ $t('Number playlists', { nb: displayCount }) + $t('sort by score') }}
    </div>
    <ul class="emission-list twoEmissions">
      <PlaylistItem
        v-bind:playlist="p"
        v-for="p in playlists"
        v-bind:key="p.playlistId"
      />
    </ul>
    <button
      class="btn"
      :class="buttonPlus ? 'btn-linkPlus' : 'btn-more'"
      @click="displayMore"
      v-show="!allFetched && loaded"
      :disabled="inFetching"
      :aria-label="$t('See more')"
    >
      <template v-if="buttonPlus">{{ $t('See more') }}</template>
      <div class="saooti-plus"></div>
    </button>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import PlaylistItem from './PlaylistItem.vue';
import { state } from '../../../store/paramStore';

import { Playlist } from '@/store/class/playlist';
export default {
  name: 'PlaylistList',

  components: {
    PlaylistItem,
  },
  props: {
    first: { default: 0 as number },
    size: { default: 12 as number },
    query: { default: undefined as string|undefined },
    organisationId: { default: undefined as string|undefined },
  },

  data() {
    return {
      loading: true as boolean,
      loaded: true as boolean,
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      displayCount: 0 as number,
      playlists: [] as Array<Playlist>,
      inFetching: false as boolean,
    };
  },

  mounted() {
    this.fetchContent(true);
  },

  
  computed: {
    allFetched(): boolean {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus(): boolean {
      return state.generalParameters.buttonPlus;
    },
    changed(): string {
      return `${this.first}|${this.size}|${this.organisationId}|${this.query}`;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    sort(): string {
      if (!this.query) return 'NAME';
      return 'SCORE';
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
  },
  methods: {
    async fetchContent(reset: boolean): Promise<void> {
      this.inFetching = true;
      if (reset) {
        this.dfirst = 0;
        this.loading = true;
        this.loaded = false;
      }
      const param = {
        first: this.dfirst,
        size: this.dsize,
        query: this.query,
        organisationId: this.organisation,
        sort: this.sort,
      };
      const data = await octopusApi.fetchPlaylists(param);
      this.afterFetching(reset, data);
    },
    afterFetching(reset: boolean, data: any): void {
      if (reset) {
        this.playlists.length = 0;
        this.dfirst = 0;
      }
      this.loading = false;
      this.loaded = true;
      this.displayCount = data.count;
      this.playlists = this.playlists.concat(data.result).filter((e: Playlist | null) => {
        if (null === e) {
          this.displayCount--;
        }
        return null !== e;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      this.inFetching = false;
    },
    displayMore(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.fetchContent(false);
    },
  },
  watch: {
    changed(): void {
      this.fetchContent(true);
    },
  },
};
</script>
