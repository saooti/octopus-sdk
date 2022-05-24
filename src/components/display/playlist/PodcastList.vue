<template>
  <div class="d-flex flex-column align-items-center">
    <h2
      class="mt-3 align-self-baseline"
    >
      <template v-if="notEmptyPlaylist">
        {{ $t('Podcasts in the playlist') }}
      </template>
      <template v-else>
        {{ $t('No podcasts in the playlist') }}
      </template>
    </h2>
    <ClassicLoading
      :loading-text="loading?$t('Loading podcasts ...'):undefined"
      :error-text="loaded && !podcasts.length && notEmptyPlaylist?$t(`No podcast match your query`):undefined"
    />
    <div
      v-if="loaded && podcasts.length > 1"
      class="text-secondary mb-4"
    >
      {{ $t('Number podcasts', { nb: podcasts.length }) +" "+ $t('sort by score') }}
    </div>
    <ClassicSearch
      v-if="notEmptyPlaylist"
      v-model:textInit="searchPattern"
      class="width-600 align-self-baseline"
      id-checkbox="podcast-list-search"
      :label="$t('Search')"
    />
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
      :class="buttonPlus ? 'btn-primary align-self-center width-fit-content m-4':'btn-more'"
      :title="$t('See more')"
      @click="displayMore"
    >
      <template v-if="buttonPlus">
        {{ $t('See more') }}
      </template>
      <div
        :class="buttonPlus?'ms-1':''"
        class="saooti-more"
      />
    </button>
  </div>
</template>

<script lang="ts">
import { handle403 } from '../../mixins/handle403';
import octopusApi from '@saooti/octopus-api';
import PodcastItem from '../podcasts/PodcastItem.vue';
import { state } from '../../../store/paramStore';
import ClassicSearch from '../../form/ClassicSearch.vue';
import ClassicLoading from '../../form/ClassicLoading.vue';
import { Podcast } from '@/store/class/general/podcast';
import { Playlist } from '@/store/class/general/playlist';
import { defineComponent } from 'vue'
import { AxiosError } from 'axios';
export default defineComponent({
  name: 'PodcastList',

  components: {
    PodcastItem,
    ClassicSearch,
    ClassicLoading
  },

  mixins: [handle403],

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
      return (state.generalParameters.buttonPlus as boolean);
    },
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
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
      try {
        const content = await octopusApi.fetchPlaylistContent(
          this.playlist.playlistId.toString()
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
      } catch (error) {
        this.handle403((error as AxiosError));
      }
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
.octopus-app{
.width-600 {
  width: 600px;
  @media (max-width: 600px) {
    width: 100%;
  }
}
}
</style>