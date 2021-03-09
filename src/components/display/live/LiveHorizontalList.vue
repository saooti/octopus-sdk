<template>
  <div class="d-flex flex-column" v-if="notEmpty">
    <h2 class="mb-4 mt-3">{{ $t('All live emission button') }}</h2>
    <ul class="podcast-list">
      <PodcastItem
        v-bind:podcast="l"
        v-for="l in lives"
        v-bind:key="l.podcastId"
      />
    </ul>
    <button
      class="btn"
      :class="buttonPlus ? 'btn-linkPlus mt-3' : 'btn-more'"
      @click="displayMore"
      v-show="!allFetched"
      :disabled="inFetching"
      :aria-label="$t('See more')"
    >
      <template v-if="buttonPlus">{{ $t('See more') }}</template>
      <div class="saooti-plus"></div>
    </button>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import PodcastItem from '../podcasts/PodcastItem.vue';
import { state } from '../../../store/paramStore.js';

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LiveHorizontalList',

  props: {
    first: { default: 0 },
    size: { default: 12 },
    emissionId: { default: undefined as any },
  },

  components: {
    PodcastItem,
  },

  created() {
    this.fetchContent(true);
  },

  data() {
    return {
      dfirst: this.$props.first,
      dsize: this.$props.size,
      totalCount: 0,
      lives: [] as any,
      notEmpty: false,
      inFetching: false,
    };
  },

  computed: {
    allFetched():boolean {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus() {
      return state.generalParameters.buttonPlus;
    },
  },

  methods: {
    async fetchContent(reset: boolean) {
      this.inFetching = true;
      if (reset) {
        this.lives.length = 0;
        this.dfirst = 0;
        this.notEmpty = false;
      }
      let param = {
        first: this.dfirst,
        size: this.dsize,
        emissionId: this.emissionId,
        sort: 'DATE',
      };
      const data = await octopusApi.fetchLives(param);
      this.afterFetching(reset, data);
    },

    afterFetching(reset: any, data: { result: any; count: number; }) {
      if (reset) {
        this.lives.length = 0;
        this.dfirst = 0;
      }
      this.lives = this.lives.concat(data.result).filter((l: null) => {
        return null !== l;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      if (0 !== this.lives.length) {
        this.notEmpty = true;
      }
      this.inFetching = false;
    },

    displayMore(event: { preventDefault: () => void; }) {
      event.preventDefault();
      this.fetchContent(false);
    },
  },
});
</script>
