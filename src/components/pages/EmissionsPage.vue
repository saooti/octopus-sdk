<template>
  <section class="page-box">
    <slot name="new-emission" />
    <ProductorSearch
      v-model:organisation-id="organisationId"
      v-model:search-pattern="searchPattern"
      type="emission"
    />
    <AdvancedSearch
      v-model:monetisable="monetisable"
      v-model:iab-id="iabId"
      v-model:sort="sort"
      v-model:include-hidden="includeHidden"
      v-model:from-date="fromDate"
      v-model:to-date="toDate"
      v-model:rubrique-filter="rubriqueFilter"
      :search-pattern="searchPattern"
      :is-education="isEducation"
      :is-emission="true"
      :organisation-id="organisationId"
    />
    <EmissionList
      :show-count="true"
      :first="paginateFirst"
      :size="ps"
      :query="searchMinSize"
      :organisation-id="organisationId"
      :monetisable="monetisable"
      :before="toDate"
      :after="fromDate"
      :sort="sort"
      :include-hidden="includeHidden"
      :iab-id="iabId"
      :rubrique-id="rubriquesFilterArrayIds.rubriqueId"
      :rubriquage-id="rubriquesFilterArrayIds.rubriquageId"
      :no-rubriquage-id="rubriquesFilterArrayIds.noRubriquageId"
    />
  </section>
</template>

<script lang="ts">
import { advancedParamInit } from "../mixins/routeParam/advancedParamInit";
import EmissionList from "../display/emission/EmissionList.vue";
import AdvancedSearch from "../display/filter/AdvancedSearch.vue";
import { defineComponent, defineAsyncComponent } from "vue";
const ProductorSearch = defineAsyncComponent(
  () => import("../display/filter/ProductorSearch.vue"),
);
export default defineComponent({
  components: {
    ProductorSearch,
    EmissionList,
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
    routeSort: { default: "LAST_PODCAST_DESC", type: String },
    routeIncludeHidden: { default: "", type: String },
    routeFrom: { default: undefined, type: String },
    routeTo: { default: undefined, type: String },
    routeOrga: { default: undefined, type: String },
    routeRubriques: { default: "", type: String },
  },

  data() {
    return {
      isEmission: true as boolean,
    };
  },
});
</script>
