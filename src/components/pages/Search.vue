<template>
  <div class="page-box">
    <h1 v-if="!hideBar">{{ $t('Podcast search') }}</h1>
    <h1 v-else-if="!noResult">
      {{ $t('Search results', { query: this.rawQuery }) }}
    </h1>
    <h1 v-else>{{ $t('Search - no results', { query: this.rawQuery }) }}</h1>
    <div class="position-relative champs-searchPage w-75" v-if="!hideBar">
      <input
        id="search"
        type="text"
        ref="search"
        v-model="rawQuery"
        class="search-input border-primary w-100 p-2 input-no-outline"
        :placeholder="$t('Please type at least three characters')"
        @change="onSearchBegin"
        autofocus
      />
      <label for="search" class="d-inline" :aria-label="$t('Search')"></label>
      <div
        class="saooti-search-bounty search-icon-container"
        v-if="!rawQuery"
      ></div>
      <div
        class="saooti-cross search-icon-container c-hand"
        @click="rawQuery = ''"
        v-else
      ></div>
    </div>
    <PodcastList
      :query="query"
      :first="0"
      :size="20"
      @emptyList="onListEmpty"
      v-if="!!query"
    />
  </div>
</template>

<style lang="scss">
.search-icon-container {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
}
.champs-searchPage {
  margin: 0 auto;
  input {
    margin: 1rem 0 !important;
    padding-right: 40px !important;
  }
  .search-icon-container {
    margin: 0 1em 0 0;
  }
}
</style>

<script lang="ts">
// @ is an alias to /src
import { state } from '../../store/paramStore.js';
import PodcastList from '../display/podcasts/PodcastList.vue';

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    PodcastList,
  },

  mounted() {
    if (this.$route.query.query) {
      this.rawQuery = this.$route.query.query;
    }
    let ref:any = this.$refs.search;
    if (ref) {
      ref.focus();
    }
  },

  data() {
    return {
      rawQuery: '' as any,
      noResult: false,
    };
  },

  computed: {
    query():string {
      if (this.rawQuery && this.rawQuery.length >= 3) return this.rawQuery;
      return '';
    },
    hideBar() {
      return state.searchPage.hideBar;
    },
  },

  methods: {
    onListEmpty() {
      if (this.hideBar) {
        this.noResult = true;
      }
    },
    onSearchBegin() {
      if (this.hideBar) {
        this.noResult = false;
      }
    },
  },

  watch: {
    '$route.query.query': {
      handler(search) {
        this.rawQuery = search;
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>
