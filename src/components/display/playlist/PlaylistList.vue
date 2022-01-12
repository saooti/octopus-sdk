<template>
  <div class="d-flex flex-column align-items-center">
    <ClassicLoading
      :loading-text="loading?$t('Loading content ...'):undefined"
    />
    <div
      v-if="loaded && playlists.length > 1"
      class="text-secondary mb-2"
    >
      {{ $t('Number playlists', { nb: displayCount }) + $t('sort by score') }}
    </div>
    <ul class="emission-list two-emissions">
      <PlaylistItem
        v-for="p in playlists"
        :key="p.playlistId"
        :playlist="p"
      />
    </ul>
    <button
      v-show="!allFetched && loaded"
      class="btn"
      :class="buttonPlus ? 'btn-link':'btn-more'"
      :disabled="inFetching"
      :title="$t('See more')"
      @click="displayMore"
    >
      <template v-if="buttonPlus">
        {{ $t('See more') }}
      </template>
      <div
        :class="buttonPlus?'ms-1':''"
        class="saooti-plus"
      />
    </button>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import PlaylistItem from './PlaylistItem.vue';
import { state } from '../../../store/paramStore';
import ClassicLoading from '../../form/ClassicLoading.vue';
import { Playlist } from '@/store/class/general/playlist';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PlaylistList',

  components: {
    PlaylistItem,
    ClassicLoading
  },
  props: {
    first: { default: 0, type: Number },
    size: { default: 12, type: Number },
    query: { default: undefined, type: String},
    organisationId: { default: undefined, type: String},
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

  
  computed: {
    allFetched(): boolean {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus(): boolean {
      return (state.generalParameters.buttonPlus as boolean);
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
  watch: {
    changed(): void {
      this.fetchContent(true);
    },
  },

  mounted() {
    this.fetchContent(true);
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
    afterFetching(reset: boolean, data: {count: number, result: Array<Playlist>, sort: string}): void {
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
    displayMore(): void {
      this.fetchContent(false);
    },
  },
})
</script>

<style lang="scss"></style>