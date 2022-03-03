<template>
  <div class="d-flex flex-column align-items-center">
    <ClassicLoading
      :loading-text="loading?$t('Loading participants ...'):undefined"
    />
    <template v-if="isLoadingMoreOrFinished">
      <div
        v-if="showCount"
        class="text-secondary mb-2"
      >
        {{
          $t('Number participants', { nb: displayCount }) + $t('sort by score')
        }}
      </div>
      <ul
        class="participant-list"
      >
        <ParticipantItem
          v-for="p in participants"
          :key="p.participantId"
          :participant="p"
        />
      </ul>
      <button
        v-show="!allFetched"
        class="btn btn-more saooti-plus"
        :title="$t('See more')"
        :disabled="loading"
        @click="fetchContent(false)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import ParticipantItem from './ParticipantItem.vue';
import ClassicLoading from '../../form/ClassicLoading.vue';
import { Participant } from '@/store/class/general/participant';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ParticipantList',

  components: {
    ParticipantItem,
    ClassicLoading
  },
  props: {
    first: { default: 0, type: Number },
    size: { default: 12, type: Number },
    query: { default: undefined, type: String},
    organisationId: { default: undefined, type: String},
    showCount: { default: false, type: Boolean },
  },

  data() {
    return {
      loading: true as boolean,
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      displayCount: 0 as number,
      participants: [] as Array<Participant>,
    };
  },

   
  computed: {
    isLoadingMoreOrFinished():boolean{
      return !this.loading || this.participants.length > 1;
    },
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
  watch: {
    query(): void {
      this.fetchContent(true);
    },
    organisation(): void {
      this.fetchContent(true);
    },
  },

  created() {
    this.fetchContent(true);
  },
  methods: {
    async fetchContent(reset: boolean): Promise<void> {
      this.loading = true;
      if (reset) {
        this.dfirst = 0;
      }
      const data = await octopusApi.fetchParticipants({
        first: this.dfirst,
        size: this.dsize,
        query: this.query,
        organisationId: this.organisation,
      });
      if (reset) {
        this.participants.length = 0;
        this.dfirst = 0;
      }
      this.displayCount = data.count;
      this.participants = this.participants.concat(data.result).filter((p: Participant | null) => {
        if (null === p) {
          this.displayCount--;
        }
        return null !== p;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      this.loading = false;
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
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
}
</style>