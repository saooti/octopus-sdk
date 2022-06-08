<template>
  <div>
    <h2 class="mt-3 align-self-baseline">
      {{ titleList }}
    </h2>
    <ClassicSearch
      v-if="!loading && notEmptyPlaylist"
      v-model:textInit="searchPattern"
      class="width-600 align-self-baseline"
      id-checkbox="podcast-list-search"
      :label="$t('Search')"
    />
    <ListPaginate
      id="podcastPlaylistListPaginate"
      v-model:first="first"
      v-model:rowsPerPage="size"
      v-model:isMobile="isMobile"
      :text-count="podcasts.length > 1 ? `${$t('Number podcasts', { nb: podcasts.length })} ${$t('sort by score')}` : undefined"
      :total-count="podcasts.length"
      :loading="loading"
      :loading-text="loading?$t('Loading podcasts ...'):undefined"
      :error-text="!loading && !podcasts.length && notEmptyPlaylist?$t(`No podcast match your query`):undefined"
    >
      <template #list>
        <ul
          class="podcast-list"
        >
          <template
            v-for="p in podcastsDisplay"
            :key="p.podcastId"
          >
            <PodcastItem
              v-if="-1!==p.podcastId"
              :podcast="p"
            />
          </template>
        </ul>
      </template>
    </ListPaginate>
  </div>
</template>

<script lang="ts">
import ListPaginate from '../list/ListPaginate.vue';
import { handle403 } from '../../mixins/handle403';
import { orgaComputed } from '../../mixins/orgaComputed';
import octopusApi from '@saooti/octopus-api';
import PodcastItem from '../podcasts/PodcastItem.vue';
import { state } from '../../../store/paramStore';
import ClassicSearch from '../../form/ClassicSearch.vue';
import { Podcast } from '@/store/class/general/podcast';
import { Playlist } from '@/store/class/general/playlist';
import { defineComponent } from 'vue'
import { AxiosError } from 'axios';
export default defineComponent({
  name: 'PodcastList',

  components: {
    PodcastItem,
    ClassicSearch,
    ListPaginate
  },

  mixins: [handle403, orgaComputed],

  props: {
    playlist: { default: ()=>({}), type: Object as ()=>Playlist},
  },

  data() {
    return {
      loading: true as boolean,
      podcasts: [] as Array<Podcast>,
      podcastsQuery: [] as Array<Podcast>,
      size: 30 as number,
      first: 0 as number,
      searchPattern: '' as string,
      isMobile: false as boolean,
    };
  },

  
  computed: {
    titleList(): string{
      return this.notEmptyPlaylist ? this.$t('Podcasts in the playlist') : this.$t('No podcasts in the playlist');
    },
    notEmptyPlaylist(): boolean {
      return 0 !== Object.keys(this.playlist.podcasts).length;
    },
    podcastsDisplay(): Array<Podcast>{
      if(this.isMobile){
        return this.podcastsQuery.slice(0, Math.min(this.first + this.size,this.podcasts.length));
      }
      return this.podcastsQuery.slice(this.first, Math.min(this.first + this.size,this.podcasts.length));
		},
    editRight(): boolean {
      if (
        (this.authenticated &&
          this.myOrganisationId === this.playlist.organisation?.id) ||
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
    this.fetchContent();
  },
  methods: {
    async fetchContent(): Promise<void> {
      if (this.notEmptyPlaylist){
        this.podcasts.length = 0;
        this.loading = true;
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
      }
      this.loading = false;
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