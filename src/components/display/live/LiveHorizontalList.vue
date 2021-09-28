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
import { state } from '../../../store/paramStore';

import { Podcast } from '@/store/class/podcast';
export default {
  name: 'LiveHorizontalList',

  components: {
    PodcastItem,
  },

  props: {
    first: { default: 0 as number },
    size: { default: 12 as number },
    emissionId: { default: undefined as undefined|number},
  },

  data() {
    return {
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      lives: [] as Array<Podcast>,
      notEmpty: false as boolean,
      inFetching: false as boolean,
    };
  },

  created() {
    this.fetchContent(true);
  },

 
  computed: {
    allFetched(): boolean {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus(): boolean {
      return state.generalParameters.buttonPlus;
    },
  },
  methods: {
    async fetchContent(reset: boolean): Promise<void> {
      this.inFetching = true;
      if (reset) {
        this.lives.length = 0;
        this.dfirst = 0;
        this.notEmpty = false;
      }
      const param = {
        first: this.dfirst,
        size: this.dsize,
        emissionId: this.emissionId,
        sort: 'DATE',
      };
      const data = await octopusApi.fetchLives(param);
      this.afterFetching(reset, data);
    },
    afterFetching(reset: boolean, data: any): void {
      if (reset) {
        this.lives.length = 0;
        this.dfirst = 0;
      }
      this.lives = this.lives.concat(data.result).filter((l: Podcast | null) => {
        return null !== l;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      if (0 !== this.lives.length) {
        this.notEmpty = true;
      }
      this.inFetching = false;
    },
    displayMore(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.fetchContent(false);
    },
  },
};
</script>
