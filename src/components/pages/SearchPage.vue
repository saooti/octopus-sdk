<template>
  <div class="page-box">
    <h1>{{ titlePage }}</h1>
    <ClassicSearch
      v-if="!hideBar"
      v-model:textInit="rawQuery"
      :autofocus="true"
      id-search="search-page-input"
      :label="$t('Please type at least three characters')"
    />
    <PodcastList
      v-if="!!query"
      :query="query"
      :first="0"
      :size="20"
      @empty-list="noResult = true"
    />
  </div>
</template>

<script lang="ts">
import { state } from "../../stores/ParamSdkStore";
import ClassicSearch from "../form/ClassicSearch.vue";
import PodcastList from "../display/podcasts/PodcastList.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "SearchPage",
  components: {
    PodcastList,
    ClassicSearch,
  },
  props: {
    queryRoute: { default: "", type: String },
  },
  data() {
    return {
      rawQuery: "" as string,
      noResult: false as boolean,
    };
  },
  computed: {
    titlePage(): string {
      if (!this.hideBar) {
        return this.$t("Podcast search");
      }
      const locale = !this.noResult ? "Search results" : "Search - no results";
      return this.$t(locale, { query: this.rawQuery });
    },
    query(): string {
      return this.rawQuery && this.rawQuery.length >= 3 ? this.rawQuery : "";
    },
    hideBar(): boolean {
      return state.searchPage.hideBar as boolean;
    },
  },
  watch: {
    rawQuery(): void {
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
});
</script>
