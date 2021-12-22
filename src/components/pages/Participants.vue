<template>
  <div class="page-box">
    <h1 v-if="undefined === titlePage">
      <template v-if="undefined === titlePage">
        {{ $t('All participants') }}
      </template>
      <template v-else>
        {{ titlePage }}
      </template>
    </h1>
    <ProductorSearch
      :organisation-id="organisationId"
      :search-pattern="searchPattern"
      type="participant"
      @updateOrganisationId="updateOrganisationId"
      @updateSearchPattern="updateSearchPattern"
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
import ParticipantList from '../display/participant/ParticipantList.vue';
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import { state } from '../../store/paramStore';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    ProductorSearch,
    ParticipantList,
  },
  props: {
    productor: { default: undefined, type: String},
  },

  data() {
    return {
      first: 0 as number,
      size: 12 as number,
      searchPattern: '',
      organisationId: undefined as string | undefined,
    };
  },

  computed: {
    titlePage(): string|undefined {
      return state.intervenantsPage.titlePage;
    },
  },

  created() {
    if (this.productor) {
      this.organisationId = this.productor;
    } else if (this.$store.state.filter.organisationId) {
      this.organisationId = this.$store.state.filter.organisationId;
    }
  },
  
  methods: {
    updateOrganisationId(value: string): void {
      this.organisationId = value;
    },
    updateSearchPattern(value: string): void {
      this.searchPattern = value;
    },
  },
})
</script>