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

<script lang="ts">
import PodcastList from '../display/podcasts/PodcastList.vue';

import { defineComponent } from 'vue'
import { Category } from '@/store/class/general/category';
export default defineComponent({
  components: {
    PodcastList,
  },
  props: {
    firstRoute: { default: 0, type: Number},
    sizeRoute: { default: 12, type: Number},
    iabId: { default: undefined, type: Number},
  },

  data() {
    return {
      title: '' as string,
    };
  },

  computed: {
    categories(): Array<Category> {
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
      const matchCategories = this.categories.filter((c: Category) => c.id === this.iabId);
      if (1 !== matchCategories.length) return;
      this.title = matchCategories[0]['name'];

    },
  },
})
</script>

<style lang="scss"></style>