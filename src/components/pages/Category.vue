<template>
  <div class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList
      :first="first"
      :size="size"
      :iabId="iabId"
      :organisationId="filterOrga"
    />
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
// @ is an alias to /src
import PodcastList from '../display/podcasts/PodcastList.vue';
import { state } from '../../store/paramStore';

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    PodcastList,
  },

  props: ['first', 'size', 'iabId'],

  mounted() {
    this.extractTitle(this.iabId);
  },

  data() {
    return {
      title: '',
    };
  },

  computed: {
    categories() {
      return state.generalParameters.allCategories;
    },
    filterOrga():any {
      return this.$store.state.filter.organisationId;
    },
  },

  methods: {
    extractTitle(iabId: any) {
      const matchCategories = this.categories.filter((c: any) => c.id === iabId);
      if (1 !== matchCategories.length) return '';
      this.title = matchCategories[0]['name'];
    },
  },

  watch: {
    iabId(val) {
      this.extractTitle(val);
    },
  },
});
</script>
