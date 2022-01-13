<template>
  <div class="page-box">
    <h1>{{ $t('All playlists') }}</h1>
    <router-link
      v-if="editRight && !isPodcastmaker"
      to="/main/priv/edit/playlist"
      class="d-flex justify-content-center my-3"
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

<script lang="ts">
import PlaylistList from '../display/playlist/PlaylistList.vue';
import { state } from '../../store/paramStore';
import { defineComponent, defineAsyncComponent } from 'vue';
const ProductorSearch = defineAsyncComponent(() => import('../display/filter/ProductorSearch.vue'));
export default defineComponent({
  components: {
    ProductorSearch,
    PlaylistList,
  },
  props: {
    productor: { default: undefined, type: String},
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
      return (state.podcastsPage.ProductorSearch as boolean);
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    editRight(): boolean {
      if (state.generalParameters.isPlaylist) return true;
      return false;
    },
  },

  created() {
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