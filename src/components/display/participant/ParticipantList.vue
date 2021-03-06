<template>
  <div class="d-flex flex-column align-items-center">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading participants ...') }}</h3>
    </div>
    <div
      v-if="showCount && loaded && participants.length > 1"
      class="text-secondary mb-2"
    >
      {{
        $t('Number participants', { nb: displayCount }) + $t('sort by score')
      }}
    </div>
    <ul class="participant-list" v-show="loaded">
      <ParticipantItem
        v-bind:participant="p"
        v-for="p in participants"
        v-bind:key="p.participantId"
      />
    </ul>
    <button
      class="btn btn-more"
      @click="displayMore"
      v-show="!allFetched && loaded"
      :aria-label="$t('See more')"
      :disabled="inFetching"
    >
      <div class="saooti-plus"></div>
    </button>
  </div>
</template>

<style lang="scss">
.participant-list {
  align-self: stretch;
  flex-grow: 1;
  margin: 0;
  padding: 0;
  /*For ie11 */
  display: flex;
  flex-wrap: wrap;
  /* end */

  display: grid; /* 1 */
  grid-template-columns: repeat(auto-fill, 14rem); /* 2 */
  grid-gap: 2rem; /* 3 */
  justify-content: space-between; /* 4 */
}
/** PHONES*/
@media (max-width: 655px) {
  .participant-list {
    align-self: auto;
    grid-gap: 0;
  }
}
</style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import ParticipantItem from './ParticipantItem.vue';

import Vue from 'vue';
import { Participant } from '@/store/class/participant';
export default Vue.extend({
  name: 'ParticipantList',
  props: {
    first: { default: 0 as number },
    size: { default: 12 as number },
    query: { default: undefined as string|undefined },
    organisationId: { default: undefined as string|undefined },
    showCount: { default: false as boolean },
  },

  components: {
    ParticipantItem,
  },

  data() {
    return {
      loading: true as boolean,
      loaded: true as boolean,
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      displayCount: 0 as number,
      participants: [] as Array<Participant>,
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
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
  },
  methods: {
    async fetchContent(reset: boolean): Promise<void> {
      this.inFetching = true;
      if (reset) {
        this.participants.length = 0;
        this.dfirst = 0;
        this.loading = true;
        this.loaded = false;
      }
      const data = await octopusApi.fetchParticipants({
        first: this.dfirst,
        size: this.dsize,
        query: this.query,
        organisationId: this.organisation,
      });
      this.loading = false;
      this.loaded = true;
      this.displayCount = data.count;
      this.participants = this.participants.concat(data.result).filter((p: Participant | null) => {
        if (null === p) {
          this.displayCount--;
        }
        return null !== p;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      this.inFetching = false;
    },
    displayMore(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.fetchContent(false);
    },
  },
  watch: {
    query(): void {
      this.fetchContent(true);
    },
    organisation(): void {
      this.fetchContent(true);
    },
  },
});
</script>
