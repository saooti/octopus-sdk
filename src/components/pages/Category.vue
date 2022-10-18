<template>
  <div class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList
      :first="0"
      :size="30"
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
    iabId: { default: undefined, type: Number},
  },

  computed: {
    categories(): Array<Category> {
      return this.$store.state.categories;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    title():string{
      const matchCategories = this.categories.filter((c: Category) => c.id === this.iabId);
      if (1 !== matchCategories.length) return "";
      return matchCategories[0]['name'];
    }
  },
})
</script>