<template>
  <div class="page-box">
    <h1 v-if="!hideBar">
      {{ $t('Podcast search') }}
    </h1>
    <h1 v-else-if="!noResult">
      {{ $t('Search results', { query: rawQuery }) }}
    </h1>
    <h1 v-else>
      {{ $t('Search - no results', { query: rawQuery }) }}
    </h1>
    <div
      v-if="!hideBar"
      class="position-relative champs-searchPage w-75"
    >
      <input
        id="search"
        ref="search"
        v-model="rawQuery"
        type="text"
        class="search-input border-primary w-100 p-2 input-no-outline"
        :placeholder="$t('Please type at least three characters')"
        autofocus
        @change="onSearchBegin"
      >
      <label
        for="search"
        class="d-inline"
        :aria-label="$t('Search')"
      />
      <div
        v-if="!rawQuery"
        class="saooti-search-bounty search-icon-container"
      />
      <div
        v-else
        class="saooti-cross search-icon-container c-hand"
        @click="rawQuery = ''"
      />
    </div>
    <PodcastList
      v-if="!!query"
      :query="query"
      :first="0"
      :size="20"
      @emptyList="onListEmpty"
    />
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import PodcastList from '../display/podcasts/PodcastList.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  name: "Search",

  components: {
    PodcastList,
  },

  props: {
    queryRoute: { default: '', type: String },
  },
  
  data() {
    return {
      rawQuery: '' as string,
      noResult: false as boolean,
    };
  },

  computed: {
    query(): string {
      if (this.rawQuery && this.rawQuery.length >= 3) return this.rawQuery;
      return '';
    },
    hideBar(): boolean {
      return state.searchPage.hideBar;
    },
  },

  watch: {
    query: {
        handler(search: any): void {
          this.rawQuery = search;
        },
      deep: true,
      immediate: true,
    },
    queryRoute(): void{
      this.rawQuery = this.queryRoute;
    }
  },

  mounted() {
    if (this.queryRoute) {
      this.rawQuery = this.queryRoute;
    }
    if (this.$refs.search) {
      (this.$refs.search as HTMLElement).focus();
    }
  },
  
  methods: {
    onListEmpty(): void {
      if (this.hideBar) {
        this.noResult = true;
      }
    },
    onSearchBegin(): void {
      if (this.hideBar) {
        this.noResult = false;
      }
    },
  },
})
</script>

<style lang="scss">
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