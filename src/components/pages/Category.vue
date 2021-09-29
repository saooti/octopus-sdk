<template>
  <div class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList
      :first="firstRoute"
      :size="sizeRoute"
      :iab-id="iabId"
      :organisation-id="filterOrga"
    />
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
// @ is an alias to /src
import PodcastList from '../display/podcasts/PodcastList.vue';

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    PodcastList,
  },
  props: {
    firstRoute: { default: 0 as number},
    sizeRoute: { default: 12 as number},
    iabId: { default: undefined as number|undefined},
  },

  data() {
    return {
      title: '' as string,
    };
  },

  computed: {
    categories(): any {
      return this.$store.state.categories;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
  },
  watch: {
    iabId(): void {
      this.extractTitle();
    },
  },

  mounted() {
    this.extractTitle();
  },
  methods: {
    extractTitle(): void {
      const matchCategories = this.categories.filter((c: any) => c.id === this.iabId);
      if (1 !== matchCategories.length) return;
      this.title = matchCategories[0]['name'];

    },
  },
})
</script>
