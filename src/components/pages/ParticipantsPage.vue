<template>
  <section v-if="isInit" class="page-box">
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

<script setup lang="ts">
import { useSimplePageParam } from "../composable/route/useSimplePageParam";
import ParticipantList from "../display/participant/ParticipantList.vue";
import ProductorSearch from "../display/filter/ProductorSearch.vue";

const props = defineProps({
  pr: { default: 0, type: Number },
  ps: { default: 30, type: Number },
  routeOrga: { default: undefined, type: String },
  routeQuery: { default: "", type: String },
});

const {
  searchPattern,
  organisationId,
  searchMinSize,
  paginateFirst,
  isInit
} = useSimplePageParam(props);

</script>
