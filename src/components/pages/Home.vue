<template>
  <div class="page-box">
    <PodcastInlineList
      v-for="c in categories"
      :key="c.id"
      :iabId="c.id"
      :title="c.name"
      :buttonText="$t('All podcast button', { name: c.name })"
    />
  </div>
</template>
<style lang="scss"></style>

<script lang="ts">
import PodcastInlineList from '../display/podcasts/PodcastInlineList.vue';
import { state } from '../../store/paramStore';

import Vue from 'vue';
export default Vue.extend({
  name: 'home',

  components: {
    PodcastInlineList,
  },
  data() {
    return {
    };
  },
  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    categories(): any {
      if(this.$store.state.filter.iab){
        return [this.$store.state.filter.iab];
      }
      return this.$store.state.categories.filter((c: any) => {
        if (this.isPodcastmaker) return c.podcastOrganisationCount;
        return c.podcastCount;
      });
    },
  },
});
</script>
