<template>
  <div class="page-box">
    <h1>{{ $t('All playlists') }}</h1>
    <router-link
      to="/main/priv/edit/playlist"
      v-if="editRight && !isPodcastmaker"
      class="d-flex justify-content-center"
    >
      <button class="btn btn-primary">{{ $t('Create playlist') }}</button>
    </router-link>
    <ProductorSearch
      v-model:organisationId="organisationId"
      :searchPattern="searchPattern"
      type="playlist"
      @updateOrganisationId="updateOrganisationId"
      @updateSearchPattern="updateSearchPattern"
      v-if="isProductorSearch"
    />
    <PlaylistList
      :showCount="true"
      :first="first"
      :size="size"
      :query="searchPattern"
      :organisationId="organisationId"
    />
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
// @ is an alias to /src
import PlaylistList from '../display/playlist/PlaylistList.vue';
import { state } from '../../store/paramStore';
export default {
  components: {
    ProductorSearch: () => import('../display/filter/ProductorSearch.vue'),
    PlaylistList,
  },
  props: {
    firstRoute: { default: 0 as number},
    sizeRoute: { default: 12 as number},
    productor: { default: undefined as string|undefined},
  },

  data() {
    return {
      first: 0 as number,
      size: 12 as number,
      searchPattern: '' as string,
      organisationId: undefined as string | undefined,
    };
  },

  created() {
    if (this.firstRoute) {
      this.first = this.firstRoute;
    }
    if (this.sizeRoute) {
      this.size = this.sizeRoute;
    }
    if (this.productor) {
      this.organisationId = this.productor;
    } else if (this.$store.state.filter.organisationId) {
      this.organisationId = this.$store.state.filter.organisationId;
    }
  },
  
  computed: {
    isProductorSearch(): boolean {
      return state.podcastsPage.ProductorSearch;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    editRight(): boolean {
      if (state.generalParameters.isPlaylist) return true;
      return false;
    },
  },
  methods: {
    updateOrganisationId(value: string): void {
      this.organisationId = value;
    },
    updateSearchPattern(value: string): void {
      this.searchPattern = value;
    },
  },
};
</script>
