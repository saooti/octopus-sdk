<template>
  <div
    v-if="notEmpty"
    class="d-flex flex-column"
  >
    <h2 class="mb-4 mt-3">
      {{ $t('All live emission button') }}
    </h2>
    <ul class="podcast-list">
      <PodcastItem
        v-for="l in lives"
        :key="l.podcastId"
        :podcast="l"
      />
    </ul>
    <button
      v-show="!allFetched"
      class="btn"
      :class="buttonPlus ? 'btn-linkPlus mt-3' : 'btn-more'"
      :disabled="inFetching"
      :aria-label="$t('See more')"
      @click="displayMore"
    >
      <template v-if="buttonPlus">
        {{ $t('See more') }}
      </template>
      <div class="saooti-plus" />
    </button>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import PodcastItem from '../podcasts/PodcastItem.vue';
import { state } from '../../../store/paramStore';

import { Podcast } from '@/store/class/general/podcast';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LiveHorizontalList',

  components: {
    PodcastItem,
  },

  props: {
    first: { default: 0, type: Number },
    size: { default: 12, type: Number },
    emissionId: { default: undefined, type: Number},
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

 
  computed: {
    allFetched(): boolean {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus(): boolean {
      return (state.generalParameters.buttonPlus as boolean);
    },
  },

  created() {
    this.fetchContent(true);
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
    afterFetching(reset: boolean, data: {count: number, result: Array<Podcast>, sort: string}): void {
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
})
</script>

<style lang="scss"></style>