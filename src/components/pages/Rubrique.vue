<template>
  <div class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList
      :first="firstRoute"
      :size="sizeRoute"
      :rubrique-id="rubriqueId"
    />
  </div>
</template>

<style lang="scss"></style>
<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import PodcastList from '../display/podcasts/PodcastList.vue';
import { defineComponent } from 'vue'
export default defineComponent({
  name:"Rubrique",

  components: {
    PodcastList,
  },

  props: {
    firstRoute: { default: 0 as number},
    sizeRoute: { default: 12 as number},
    rubriqueId: { default: undefined as number|undefined},
  },

  data() {
    return {
      title: '' as string,
    };
  },

  watch: {
    rubriqueId(): void {
      this.extractTitle();
    },
  },

  mounted() {
    this.extractTitle();
  },

  methods: {
    async extractTitle(): Promise<void> {
      const data = await octopusApi.fetchRubric(this.rubriqueId);
      this.title = data.name;
    },
  },
})
</script>