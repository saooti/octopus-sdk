<template>
  <div class="page-box">
    <h1>{{ $t('All participants') }}</h1>
    <ProductorSearch
      :organisationId="organisationId"
      :searchPattern="searchPattern"
      type="participant"
      @updateOrganisationId="updateOrganisationId"
      @updateSearchPattern="updateSearchPattern"
    />
    <ParticipantList
      :showCount="true"
      :first="first"
      :size="size"
      :query="searchPattern"
      :organisationId="organisationId"
    />
  </div>
</template>
<style lang="scss"></style>
<script>
// @ is an alias to /src
import ParticipantList from '../display/participant/ParticipantList.vue';
import ProductorSearch from '../display/filter/ProductorSearch.vue';
/* import {state} from "../../store/paramStore.js"; */

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    ProductorSearch,
    ParticipantList,
  },

  created() {
    if (this.$route.query.first) {
      this.first = this.$route.query.first;
    } else {
      this.first = 0;
    }
    if (this.$route.query.size) {
      this.size = this.$route.query.size;
    } else {
      this.size = 12;
    }
    if (this.$route.query.productor) {
      this.organisationId = this.$route.query.productor;
    } else if (this.$store.state.filter.organisationId) {
      this.organisationId = this.$store.state.filter.organisationId;
    }
  },

  data() {
    return {
      first: undefined,
      size: undefined,
      searchPattern: '',
      organisationId: undefined,
    };
  },

  methods: {
    updateOrganisationId(value) {
      this.organisationId = value;
    },
    updateSearchPattern(value) {
      this.searchPattern = value;
    },
  },
});
</script>
