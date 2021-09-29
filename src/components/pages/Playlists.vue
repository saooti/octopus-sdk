<template>
  <div class="page-box">
    <h1>{{ $t('All playlists') }}</h1>
    <router-link
      v-if="editRight && !isPodcastmaker"
      to="/main/priv/edit/playlist"
      class="d-flex justify-content-center"
    >
      <button class="btn btn-primary">
        {{ $t('Create playlist') }}
      </button>
    </router-link>
    <ProductorSearch
      v-if="isProductorSearch"
      v-model:organisationId="organisationId"
      :search-pattern="searchPattern"
      type="playlist"
      @updateOrganisationId="updateOrganisationId"
      @updateSearchPattern="updateSearchPattern"
    />
    <PlaylistList
      :show-count="true"
      :first="first"
      :size="size"
      :query="searchPattern"
      :organisation-id="organisationId"
    />
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
// @ is an alias to /src
import PlaylistList from '../display/playlist/PlaylistList.vue';
import { state } from '../../store/paramStore';
import { defineComponent } from 'vue'
export default defineComponent({
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
  methods: {
    updateOrganisationId(value: string): void {
      this.organisationId = value;
    },
    updateSearchPattern(value: string): void {
      this.searchPattern = value;
    },
  },
})
</script>
