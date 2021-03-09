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
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import { state } from '../../store/paramStore.js';
import store from '@/store/AppStore';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    ProductorSearch,
    PlaylistList,
  },

  created() {
    if (this.$route.query.first) {
      this.first = this.$route.query.first;
    } else {
      this.first = 0;
    }
    if (this.$route.query.size) {
      this.size = this.$route.query.size;
    } else {
      this.size = 12;
    }
    if (this.$route.query.productor) {
      this.organisationId = this.$route.query.productor;
    } else if (store.state.filter.organisationId) {
      this.organisationId = store.state.filter.organisationId;
    }
  },

  data() {
    return {
      first: undefined as any,
      size: undefined as any,
      searchPattern: '',
      organisationId: undefined as any,
    };
  },

  computed: {
    isProductorSearch() {
      return state.podcastsPage.ProductorSearch;
    },
    isPodcastmaker() {
      return state.generalParameters.podcastmaker;
    },
    editRight() {
      if (state.generalParameters.isPlaylist) return true;
      return false;
    },
  },

  methods: {
    updateOrganisationId(value: any) {
      this.organisationId = value;
    },
    updateSearchPattern(value: string) {
      this.searchPattern = value;
    },
  },
});
</script>
