<template>
  <div class="page-box">
    <h1>
      <template v-if="!hideBar">
        {{ $t('Podcast search') }}
      </template>
      <template v-else-if="!noResult">
        {{ $t('Search results', { query: rawQuery }) }}
      </template>
      <template v-else>
        {{ $t('Search - no results', { query: rawQuery }) }}
      </template>
    </h1>
    <ClassicSearch
      v-if="!hideBar"
      v-model:textInit="rawQuery"
      :autofocus="true"
      id-checkbox="search-page-input"
      :label="$t('Please type at least three characters')"
    />
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
import ClassicSearch from '../form/ClassicSearch.vue';
import PodcastList from '../display/podcasts/PodcastList.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  name: "Search",

  components: {
    PodcastList,
    ClassicSearch
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
      return (state.searchPage.hideBar as boolean);
    },
  },

  watch: {
    rawQuery(): void{
      if (this.hideBar) {
        this.noResult = false;
      }
    },
    query(): void{
      this.rawQuery = this.query;
    },
    queryRoute(): void{
      this.rawQuery = this.queryRoute;
    }
  },

  mounted() {
    if (this.queryRoute) {
      this.rawQuery = this.queryRoute;
    }
  },
  
  methods: {
    onListEmpty(): void {
      if (this.hideBar) {
        this.noResult = true;
      }
    },
  },
})
</script>