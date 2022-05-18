<template>
  <div class="page-box">
    <h1>{{ titlePage }}</h1>
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
      @emptyList="noResult = true"
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
    titlePage():string{
      if(!this.hideBar){
        return this.$t('Podcast search');
      }
      if(!this.noResult){
        return this.$t('Search results', { query: this.rawQuery })
      }
      return this.$t('Search - no results', { query: this.rawQuery });
    },
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
    queryRoute: {
      immediate: true,
      handler() {
       this.rawQuery = this.queryRoute;
      },
    },
  },
})
</script>