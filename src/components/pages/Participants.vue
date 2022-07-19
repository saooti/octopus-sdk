<template>
  <div class="page-box">
    <h1>{{ titleDisplay }}</h1>
    <ProductorSearch
      :organisation-id="organisationId"
      :search-pattern="searchPattern"
      type="participant"
      @updateOrganisationId="organisationId = $event"
      @updateSearchPattern="searchPattern = $event"
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
import { state } from '../../store/paramStore';
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
  computed: {
    titleDisplay(): string{
      return state.intervenantsPage.titlePage ?? this.$t('All participants');
    },
  },
  created() {
    this.organisationId = this.productor??this.filterOrga;
  },
})
</script>