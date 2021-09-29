<template>
  <div class="d-flex flex-column align-items-center">
    <h2
      v-if="notEmptyPlaylist"
      class="mt-3 align-self-baseline"
    >
      {{ $t('Podcasts in the playlist') }}
    </h2>
    <h2
      v-else
      class="mt-3 align-self-baseline"
    >
      {{ $t('No podcasts in the playlist') }}
    </h2>
    <div
      v-if="loading"
      class="d-flex justify-content-center"
    >
      <div class="spinner-border mr-3" />
      <h3 class="mt-2">
        {{ $t('Loading podcasts ...') }}
      </h3>
    </div>
    <div v-if="loaded && !podcasts.length && notEmptyPlaylist">
      <p>{{ $t('No podcast match your query') }}</p>
    </div>
    <div
      v-if="loaded && podcasts.length > 1"
      class="text-secondary mb-4"
    >
      {{ $t('Number podcasts', { nb: podcasts.length }) + $t('sort by score') }}
    </div>
    <div
      v-if="notEmptyPlaylist"
      class="d-flex position-relative width-600 align-self-baseline"
    >
      <label
        for="search"
        class="d-inline"
        :aria-label="$t('Search')"
      />
      <input
        id="search"
        v-model="searchPattern"
        :placeholder="$t('Search')"
        class="filter-search-input input-no-outline flex-grow"
      >
      <div
        class="saooti-search-bounty filter-list-search-icon search-icon-container"
      />
    </div>
    <ul
      v-show="loaded"
      class="podcast-list"
    >
      <PodcastItem
        v-for="p in podcastsDisplay"
        :key="p.podcastId"
        :podcast="p"
      />
    </ul>
    <button
      v-show="size < podcasts.length && loaded"
      class="btn"
      :class="buttonPlus ? 'btn-linkPlus mt-3' : 'btn-more'"
      :aria-label="$t('See more')"
      @click="displayMore"
    >
      <template v-if="buttonPlus">
        {{ $t('See more') }}
      </template>
      <div class="saooti-plus" />
    </button>
  </div>
</template>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import PodcastItem from '../podcasts/PodcastItem.vue';
import { state } from '../../../store/paramStore';

import { Podcast } from '@/store/class/podcast';
import { Playlist } from '@/store/class/playlist';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastList',

  components: {
    PodcastItem,
  },

  props: {
    playlist: { default: ()=>({}), type: Object as ()=>Playlist},
  },

  data() {
    return {
      loading: true as boolean,
      loaded: true as boolean,
      podcasts: [] as Array<Podcast>,
      podcastsQuery: [] as Array<Podcast>,
      size: 12 as number,
      searchPattern: '' as string,
    };
  },

  
  computed: {
    notEmptyPlaylist(): boolean {
      return 0 !== Object.keys(this.playlist.podcasts).length;
    },
    podcastsDisplay(): Array<Podcast> {
      if (this.size < this.podcastsQuery.length)
        return this.podcastsQuery.slice(0, this.size);
      return this.podcastsQuery.slice(0, this.podcasts.length);
    },
    buttonPlus(): boolean {
      return state.generalParameters.buttonPlus;
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    editRight(): boolean {
      if (
        (this.authenticated &&
          this.organisationId === this.playlist.organisation.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
  },
  watch: {
    searchPattern(): void {
      if ('' !== this.searchPattern) {
        this.podcastsQuery = this.podcasts.filter((el: Podcast) => {
          return el.title
            .toLowerCase()
            .includes(this.searchPattern.toLowerCase());
        });
      } else {
        this.podcastsQuery = this.podcasts;
      }
    },
  },

  created() {
    if (this.notEmptyPlaylist) {
      this.fetchContent();
    } else {
      this.loading = false;
      this.loaded = true;
    }
  },
  methods: {
    async fetchContent(): Promise<void> {
      this.podcasts.length = 0;
      this.loading = true;
      this.loaded = false;
      const content = await octopusApi.fetchPlaylistContent(
        this.playlist.playlistId
      );
      for (let index = 0, len = content.length; index < len; index++) {
        content[index].order = this.playlist.podcasts[content[index].podcastId];
      }
      this.podcasts = content;
      if (!this.editRight) {
        this.podcasts = this.podcasts.filter((p: Podcast|null) => {
          return (
            null !== p &&
            (!p.availability || true === p.availability.visibility)
          );
        });
      }
      this.podcastsQuery = this.podcasts;
      this.loading = false;
      this.loaded = true;
    },
    displayMore(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.size += 12;
    },
  },
})
</script>


<style lang="scss">
.width-600 {
  width: 600px;
  @media (max-width: 600px) {
    width: 100%;
  }
}
</style>