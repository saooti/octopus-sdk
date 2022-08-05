<template>
  <div class="page-box">
    <h1>{{ $t('All playlists') }}</h1>
    <router-link
      v-if="editRight && !isPodcastmaker"
      to="/main/priv/edit/playlist"
      class="d-flex justify-content-center my-3"
    >
      <div class="btn btn-primary">
        {{ $t('Create playlist') }}
      </div>
    </router-link>
    <ProductorSearch
      v-if="isProductorSearch"
      v-model:organisationId="organisationId"
      :search-pattern="searchPattern"
      type="playlist"
      @updateOrganisationId="organisationId = $event"
      @updateSearchPattern="searchPattern = $event"
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
import { orgaComputed } from '../mixins/orgaComputed';
import PlaylistList from '../display/playlist/PlaylistList.vue';
import { state } from '../../store/paramStore';
import { defineComponent, defineAsyncComponent } from 'vue';
const ProductorSearch = defineAsyncComponent(() => import('../display/filter/ProductorSearch.vue'));
export default defineComponent({
  components: {
    ProductorSearch,
    PlaylistList,
  },
  mixins:[orgaComputed],
  props: {
    productor: { default: undefined, type: String},
  },

  data() {
    return {
      first: 0 as number,
      size: 30 as number,
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
      return state.generalParameters.isPlaylist ? true : false;
    },
  },

  created() {
    this.organisationId = this.productor ?this.productor: this.filterOrga;;
  },
})
</script>