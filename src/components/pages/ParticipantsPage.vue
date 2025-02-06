<template>
  <section class="page-box">
    <ProductorSearch
      v-model:organisation-id="organisationId"
      v-model:search-pattern="searchPattern"
      type="participant"
    />
    <ParticipantList
      :show-count="true"
      :first="paginateFirst"
      :size="ps"
      :query="searchMinSize"
      :organisation-id="organisationId"
    />
  </section>
</template>

<script lang="ts">
import { paginateParamInit } from "../mixins/routeParam/paginateParamInit";
import ParticipantList from "../display/participant/ParticipantList.vue";
import ProductorSearch from "../display/filter/ProductorSearch.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    ProductorSearch,
    ParticipantList,
  },
  mixins: [paginateParamInit],
  props: {
    pr: { default: 0, type: Number },
    ps: { default: 30, type: Number },
    routeOrga: { default: undefined, type: String },
    routeQuery: { default: "", type: String },
  },
  data() {
    return {
      searchPattern: "" as string,
      organisationId: undefined as string | undefined,
    };
  },
});
</script>
