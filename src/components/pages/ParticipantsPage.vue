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
      :query="searchPattern"
      :organisation-id="organisationId"
    />
  </section>
</template>

<script lang="ts">
import { paginateParamInit } from "../mixins/routeParam/paginateParamInit";
import { useFilterStore } from "../../stores/FilterStore";
import ParticipantList from "../display/participant/ParticipantList.vue";
import ProductorSearch from "../display/filter/ProductorSearch.vue";
import { defineComponent } from "vue";
import { mapState } from "pinia";
export default defineComponent({
  components: {
    ProductorSearch,
    ParticipantList,
  },
  mixins: [paginateParamInit],
  props: {
    productor: { default: undefined, type: String },
    pr: { default: 0, type: Number },
    ps: { default: 30, type: Number },
  },
  data() {
    return {
      searchPattern: "" as string,
      organisationId: undefined as string | undefined,
    };
  },
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
  },
  created() {
    this.organisationId = this.productor ? this.productor : this.filterOrgaId;
  },
});
</script>
