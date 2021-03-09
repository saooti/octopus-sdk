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
<script lang="ts">
// @ is an alias to /src
import ParticipantList from '../display/participant/ParticipantList.vue';
import ProductorSearch from '../display/filter/ProductorSearch.vue';
import store from '@/store/AppStore';
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
    } else if (store.state.filter.organisationId) {
      this.organisationId = store.state.filter.organisationId;
    }
  },

  data() {
    return {
      first: undefined as any,
      size: undefined as any,
      searchPattern: '',
      organisationId: undefined as any,
    };
  },

  methods: {
    updateOrganisationId(value: any) {
      this.organisationId = value;
    },
    updateSearchPattern(value: string) {
      this.searchPattern = value;
    },
  },
});
</script>
