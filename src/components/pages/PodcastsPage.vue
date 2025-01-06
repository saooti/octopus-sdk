<template>
  <section class="page-box">
    <ProductorSearch
      v-model:organisation-id="organisationId"
      v-model:search-pattern="searchPattern"
    />
    <AdvancedSearch
      v-model:only-video="onlyVideo"
      v-model:monetisable="monetisable"
      v-model:iab-id="iabId"
      v-model:sort="sort"
      v-model:include-hidden="includeHidden"
      v-model:from-date="fromDate"
      v-model:to-date="toDate"
      v-model:not-valid="notValid"
      v-model:rubrique-filter="rubriqueFilter"
      :search-pattern="searchPattern"
      :is-education="isEducation"
      :is-emission="false"
      :organisation-id="organisationId"
    />
    <PodcastList
      :show-count="true"
      :first="paginateFirst"
      :size="ps"
      :organisation-id="orgaArray"
      :query="searchMinSize"
      :monetisable="monetisable"
      :before="toDate"
      :after="fromDate"
      :sort-criteria="sort"
      :include-hidden="includeHidden"
      :not-valid="notValid"
      :iab-id="iabId"
      :rubrique-id="rubriquesFilterArrayIds.rubriqueId"
      :rubriquage-id="rubriquesFilterArrayIds.rubriquageId"
      :no-rubriquage-id="rubriquesFilterArrayIds.noRubriquageId"
      :with-video="withVideo"
    />
  </section>
</template>

<script lang="ts">
import { advancedParamInit } from "../mixins/routeParam/advancedParamInit";
import PodcastList from "../display/podcasts/PodcastList.vue";
import ProductorSearch from "../display/filter/ProductorSearch.vue";
import AdvancedSearch from "../display/filter/AdvancedSearch.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastsPage",
  components: {
    PodcastList,
    ProductorSearch,
    AdvancedSearch,
  },
  mixins: [advancedParamInit],
  props: {
    isEducation: { default: false, type: Boolean },
    pr: { default: 0, type: Number },
    ps: { default: 30, type: Number },
    routeQuery: { default: "", type: String },
    routeMonetisable: { default: "UNDEFINED", type: String },
    routeIab: { default: undefined, type: Number },
    routeSort: { default: "DATE", type: String },
    routeIncludeHidden: { default: "", type: String },
    routeFrom: { default: undefined, type: String },
    routeTo: { default: undefined, type: String },
    routeNotValid: { default: "", type: String },
    routeOnlyVideo: { default: "", type: String },
    routeOrga: { default: undefined, type: String },
    routeRubriques: { default: "", type: String },
  },
  data() {
    return {
      notValid: false as boolean,
      onlyVideo: false as boolean,
    };
  },
  computed: {
    orgaArray(): Array<string> {
      return this.organisationId ? [this.organisationId] : [];
    },
    withVideo(): boolean | undefined {
      return false === this.onlyVideo ? undefined : true;
    },
  },
  watch: {
    routeNotValid: {
      immediate: true,
      handler() {
        this.notValid =
          undefined !== this.organisation &&
          this.organisationRight &&
          "true" === this.routeNotValid;
      },
    },
    routeOnlyVideo: {
      immediate: true,
      handler() {
        this.onlyVideo = "true" === this.routeOnlyVideo;
      },
    },
  },
});
</script>
