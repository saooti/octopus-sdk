<template>
  <div class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList :first="first" :size="size" :rubriqueId="rubriqueId" />
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
// @ is an alias to /src
const octopusApi = require('@saooti/octopus-api');
import PodcastList from '../display/podcasts/PodcastList.vue';

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    PodcastList,
  },

  props: ['first', 'size', 'rubriqueId'],

  mounted() {
    this.extractTitle();
  },

  data() {
    return {
      title: '',
    };
  },

  computed: {},

  methods: {
    async extractTitle() {
      const data = await octopusApi.fetchRubric(this.rubriqueId);
      this.title = data.name;
    },
  },

  watch: {
    rubriqueId() {
      this.extractTitle();
    },
  },
});
</script>
