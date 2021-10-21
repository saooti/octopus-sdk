<template>
  <div
    v-if="filterOrga || organisationId"
    class="d-flex flex-column align-items-center live-list-container"
  >
    <div
      v-if="loading"
      class="d-flex justify-content-center"
    >
      <div class="spinner-border me-3" />
      <h3 class="mt-2">
        {{ $t('Loading lives...') }}
      </h3>
    </div>
    <div
      v-if="
        loaded && !lives.length && !livesToBe.length && !livesTerminated.length
      "
    >
      <p>{{ $t('No live currently') }}</p>
    </div>
    <div v-if="loaded && displayNextLiveMessage">
      <h3 class="text-danger">
        {{ displayNextLiveMessage }}
      </h3>
    </div>
    <template v-if="lives.length">
      <div class="horizontal-separator" />
      <p class="live-list-category">
        {{ $t('In live') }}
      </p>
      <LiveItem
        v-for="(l, index) in lives"
        :key="l.podcastId"
        class="mt-3"
        :fetch-conference="l"
        :index="index"
        @deleteItem="deleteLive"
      />
    </template>
    <template v-if="livesNotStarted.length">
      <div class="horizontal-separator" />
      <p class="live-list-category">
        {{ $t('This live is not started yet') }}
      </p>
      <LiveItem
        v-for="(l, index) in livesNotStarted"
        :key="l.podcastId"
        class="mt-3"
        :fetch-conference="l"
        :index="index"
        @deleteItem="deleteLiveNotStarted"
      />
    </template>
    <template v-if="livesToBe.length">
      <div class="horizontal-separator" />
      <p class="live-list-category">
        {{ $t('Live to be') }}
      </p>
      <LiveItem
        v-for="(l, index) in livesToBe"
        :key="l.podcastId"
        class="mt-3"
        :fetch-conference="l"
        :index="index"
        @deleteItem="deleteLiveToBe"
      />
    </template>
    <template v-if="livesTerminated.length">
      <div class="horizontal-separator" />
      <p class="live-list-category">
        {{ $t('Live terminated') }}
      </p>
      <LiveItem
        v-for="(l, index) in livesTerminated"
        :key="l.podcastId"
        class="mt-3"
        :fetch-conference="l"
        :index="index"
        @deleteItem="deleteLiveTerminated"
      />
    </template>
    <template v-if="livesPublishing.length">
      <div class="horizontal-separator" />
      <p class="live-list-category">
        {{ $t('Publishing') }}
      </p>
      <LiveItem
        v-for="(l, index) in livesPublishing"
        :key="l.podcastId"
        class="mt-3"
        :fetch-conference="l"
        :index="index"
        @deleteItem="deleteLivePublishing"
      />
    </template>
    <template v-if="livesError.length">
      <div class="horizontal-separator" />
      <p class="live-list-category">
        {{ $t('In error') }}
      </p>
      <LiveItem
        v-for="(l, index) in livesError"
        :key="l.podcastId"
        class="mt-3"
        :fetch-conference="l"
        :index="index"
        @deleteItem="deleteLiveError"
      />
    </template>
  </div>
</template>

<script lang="ts">
import LiveItem from './LiveItem.vue';
const octopusApi = require('@saooti/octopus-api');
const moment = require('moment');
import { state } from '../../../store/paramStore';
import { Conference } from '@/store/class/conference';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LiveList',
  components: {
    LiveItem,
  },

  props: {
    conferenceWatched: { default: () => [], type: Array as ()=>Array<Conference>},
    organisationId: { default: undefined, type: String},
  },
  emits: ['initConferenceIds'],

  data() {
    return {
      loading: true as boolean,
      loaded: true as boolean,
      lives: [] as Array<Conference>,
      livesNotStarted: [] as Array<Conference>,
      livesToBe: [] as Array<Conference>,
      livesTerminated: [] as Array<Conference>,
      livesError: [] as Array<Conference>,
      livesPublishing: [] as Array<Conference>,
    };
  },
  
  computed: {
    filterOrgaUsed(): string|undefined {
      if (this.filterOrga) return this.filterOrga;
      if (this.organisationId) return this.organisationId;
      return undefined;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    displayNextLiveMessage(): string {
      if (0 !== this.lives.length) return '';
      if (this.livesNotStarted.length > 0)
        return this.$t('A live can start any moment').toString();
      if (this.livesToBe.length > 0)
        return this.$t('Next live date', {
          date: moment(this.livesToBe[0].date).format('LLLL'),
        }).toString();
      return '';
    },
    myOrganisationId(): string {
      return state.generalParameters.organisationId;
    },
    organisationRight(): boolean {
      if (this.isRoleLive && this.myOrganisationId === this.filterOrgaUsed)
        return true;
      return false;
    },
    isRoleLive(): boolean {
      return state.generalParameters.isRoleLive;
    },
  },
  watch: {
    async organisationId(): Promise<void> {
      const isLive = await octopusApi.liveEnabledOrganisation(
        this.organisationId
      );
      if (isLive) {
        if(!this.loading){
          this.fetchContent();
        }
      } else {
        this.initArrays();
        this.loading = false;
        this.loaded = true;
      }
    },
    filterOrga(): void {
      if(!this.loading){
        this.fetchContent();
      }
    },
    conferenceWatched: {
      handler(): void {
        this.updateLiveLocal();
      },
      deep: true,
    },
  },

  async created() {
    const isLive = await octopusApi.liveEnabledOrganisation(
      this.filterOrgaUsed
    );
    if (isLive) {
      this.fetchContent();
    } else {
      this.loading = false;
      this.loaded = true;
    }
  },
  methods: {
    initArrays(): void {
      this.lives.length = 0;
      this.livesNotStarted.length = 0;
      this.livesToBe.length = 0;
      this.livesTerminated.length = 0;
      this.livesError.length = 0;
      this.livesPublishing.length = 0;
    },
    async fetchContent(): Promise<void> {
      this.initArrays();
      if (!this.filterOrgaUsed) {
        this.loading = false;
        this.loaded = true;
        return;
      }
      this.loading = true;
      this.loaded = false;
      const dataLives = await octopusApi.listConferences(
        this.filterOrgaUsed,
        true,
        'RECORDING'
      );
      this.lives = dataLives.filter((p: Conference | null) => {
        return null !== p;
      });
      const dataLivesToBe = await octopusApi.listConferences(
        this.filterOrgaUsed,
        true,
        'PENDING'
      );
      let indexPast = 0;
      for (let index = 0, len = dataLivesToBe.length; index < len; index++) {
        if (moment(dataLivesToBe[index].date).isBefore(moment())) {
          this.livesNotStarted.push(dataLivesToBe[index]);
          indexPast = index + 1;
        } else {
          break;
        }
      }
      const dataLivesPlanned = await octopusApi.listConferences(
        this.filterOrgaUsed,
        true,
        'PLANNED'
      );
      this.livesToBe = dataLivesToBe
        .slice(indexPast)
        .concat(dataLivesPlanned)
        .filter((p: Conference | null) => {
          return null !== p;
        });
      if (this.organisationRight) {
        const dataLivesTerminated = await octopusApi.listConferences(
          this.filterOrgaUsed,
          true,
          'DEBRIEFING'
        );
        this.livesTerminated = dataLivesTerminated.filter((p: Conference | null) => {
          return null !== p;
        });
        const dataLivesError = await octopusApi.listConferences(
          this.filterOrgaUsed,
          true,
          'ERROR'
        );
        this.livesError = dataLivesError.filter((p: Conference | null) => {
          return null !== p;
        });
        const dataLivesPublishing = await octopusApi.listConferences(
          this.filterOrgaUsed,
          true,
          'PUBLISHING'
        );
        this.livesPublishing = dataLivesPublishing.filter((p: Conference | null) => {
          return null !== p;
        });
      }
      const listIds = this.lives
        .concat(this.livesToBe)
        .concat(this.livesNotStarted);
      this.$emit('initConferenceIds', listIds);
      this.loading = false;
      this.loaded = true;
    },
    deleteLive(index: number): void {
      this.lives.splice(index, 1);
    },
    deleteLiveToBe(index: number): void {
      this.livesToBe.splice(index, 1);
    },
    deleteLiveTerminated(index: number): void {
      this.livesTerminated.splice(index, 1);
    },
    deleteLiveError(index: number): void {
      this.livesError.splice(index, 1);
    },
    deleteLiveNotStarted(index: number): void {
      this.livesNotStarted.splice(index, 1);
    },
    deleteLivePublishing(index: number): void {
      this.livesPublishing.splice(index, 1);
    },
    updateLiveLocal(): void {
      for (
        let index = 0, len = this.conferenceWatched.length;
        index < len;
        index++
      ) {
        const element = this.conferenceWatched[index];
        const indexLivesToBe = this.livesToBe.findIndex(
          (el: Conference) => el.conferenceId === element.conferenceId
        );
        if (-1 === indexLivesToBe) {
          const indexLives = this.lives.findIndex(
            (el: Conference) => el.conferenceId === element.conferenceId
          );
          if (-1 === indexLives || 'DEBRIEFING' !== element.status) continue;
          const newConf = this.lives[indexLives];
          newConf.status = element.status;
          this.lives.splice(indexLives, 1);
          this.livesTerminated.push(newConf);
          break;
        }
        if ('RECORDING' !== element.status) continue;
        const newConf = this.livesToBe[indexLivesToBe];
        newConf.status = element.status;
        this.livesToBe.splice(indexLivesToBe, 1);
        this.lives.push(newConf);
        break;
      }
    },
  },
})
</script>

<style lang="scss">
.live-list-container .horizontal-separator {
  border-top: 1px solid #cccccc;
  width: 100%;
  margin: 2rem;
}
.live-list-category {
  align-self: flex-start;
  text-transform: uppercase;
  font-weight: bold;
}

@media (max-width: 450px) {
  .live-list-container h3 {
    text-align: center;
    font-size: 1rem;
  }
  .live-list-container .horizontal-separator {
    margin: 1rem;
  }
}
</style>
