<template>
  <div class="page-box">
    <ProductorSearch
      v-model:organisation-id="organisationId"
      v-model:search-pattern="searchPattern"
      type="participant"
    />
    <ParticipantList
      :show-count="true"
      :first="first"
      :size="size"
      :query="searchPattern"
      :organisation-id="organisationId"
    />
  </div>
</template>

<script lang="ts">
import { orgaComputed } from '../mixins/orgaComputed';
import ParticipantList from '../display/participant/ParticipantList.vue';
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    ProductorSearch,
    ParticipantList,
  },
  mixins: [orgaComputed],
  props: {
    productor: { default: undefined, type: String},
  },
  data() {
    return {
      first: 0 as number,
      size: 30 as number,
      searchPattern: '' as string,
      organisationId: undefined as string | undefined,
    };
  },
  created() {
    this.organisationId = this.productor ?this.productor: this.filterOrgaId;
  },
})
</script>