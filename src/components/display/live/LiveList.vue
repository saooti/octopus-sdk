<template>
  <div
    class="d-flex flex-column align-items-center live-list-container"
    v-if="filterOrga || organisationId"
  >
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading lives...') }}</h3>
    </div>
    <div
      v-if="
        loaded && !lives.length && !livesToBe.length && !livesTerminated.length
      "
    >
      <p>{{ $t('No live currently') }}</p>
    </div>
    <div v-if="loaded && displayNextLiveMessage">
      <h3 class="text-danger">{{ displayNextLiveMessage }}</h3>
    </div>
    <template v-if="lives.length">
      <div class="horizontal-separator"></div>
      <p class="live-list-category">{{ $t('In live') }}</p>
      <LiveItem
        class="mt-3"
        v-for="(l, index) in lives"
        :fetchConference="l"
        :key="l.podcastId"
        :index="index"
        @deleteItem="deleteLive"
      />
    </template>
    <template v-if="livesNotStarted.length">
      <div class="horizontal-separator"></div>
      <p class="live-list-category">{{ $t('This live is not started yet') }}</p>
      <LiveItem
        class="mt-3"
        v-for="(l, index) in livesNotStarted"
        :fetchConference="l"
        :key="l.podcastId"
        :index="index"
        @deleteItem="deleteLiveNotStarted"
      />
    </template>
    <template v-if="livesToBe.length">
      <div class="horizontal-separator"></div>
      <p class="live-list-category">{{ $t('Live to be') }}</p>
      <LiveItem
        class="mt-3"
        v-for="(l, index) in livesToBe"
        :fetchConference="l"
        :key="l.podcastId"
        :index="index"
        @deleteItem="deleteLiveToBe"
      />
    </template>
    <template v-if="livesTerminated.length">
      <div class="horizontal-separator"></div>
      <p class="live-list-category">{{ $t('Live terminated') }}</p>
      <LiveItem
        class="mt-3"
        v-for="(l, index) in livesTerminated"
        :fetchConference="l"
        :key="l.podcastId"
        :index="index"
        @deleteItem="deleteLiveTerminated"
      />
    </template>
    <template v-if="livesPublishing.length">
      <div class="horizontal-separator"></div>
      <p class="live-list-category">{{ $t('Publishing') }}</p>
      <LiveItem
        class="mt-3"
        v-for="(l, index) in livesPublishing"
        :fetchConference="l"
        :key="l.podcastId"
        :index="index"
        @deleteItem="deleteLivePublishing"
      />
    </template>
    <template v-if="livesError.length">
      <div class="horizontal-separator"></div>
      <p class="live-list-category">{{ $t('In error') }}</p>
      <LiveItem
        class="mt-3"
        v-for="(l, index) in livesError"
        :fetchConference="l"
        :key="l.podcastId"
        :index="index"
        @deleteItem="deleteLiveError"
      />
    </template>
  </div>
</template>

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

<script lang="ts">
import studioApi from '@/api/studio';
import LiveItem from './LiveItem.vue';
const octopusApi = require('@saooti/octopus-api');
const moment = require('moment');
import { state } from '../../../store/paramStore';

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LiveList',

  props: {
    conferenceWatched: { default: [] },
    organisationId: { default: undefined as any },
  },
  emits: ['initConferenceIds'],

  components: {
    LiveItem,
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

  data() {
    return {
      loading: true,
      loaded: true,
      lives: [] as any,
      livesNotStarted: [] as any,
      livesToBe: [] as any,
      livesTerminated: [] as any,
      livesError: [] as any,
      livesPublishing: [] as any,
    };
  },

  computed: {
    filterOrgaUsed():any {
      if (this.filterOrga) return this.filterOrga;
      if (this.organisationId) return this.organisationId;
      return undefined;
    },
    filterOrga():any {
      return this.$store.state.filter.organisationId;
    },
    displayNextLiveMessage():string {
      if (0 !== this.lives.length) return '';
      if (this.livesNotStarted.length > 0)
        return this.$t('A live can start any moment');
      if (this.livesToBe.length > 0)
        return this.$t('Next live date', {
          date: moment(this.livesToBe[0].date).format('LLLL'),
        });
      return '';
    },
    myOrganisationId() {
      return state.generalParameters.organisationId;
    },
    organisationRight() {
      if (this.isRoleLive && this.myOrganisationId === this.filterOrgaUsed)
        return true;
      return false;
    },
    isRoleLive() {
      return state.generalParameters.isRoleLive;
    },
  },

  methods: {
    initArrays() {
      this.lives.length = 0;
      this.livesNotStarted.length = 0;
      this.livesToBe.length = 0;
      this.livesTerminated.length = 0;
      this.livesError.length = 0;
      this.livesPublishing.length = 0;
    },
    async fetchContent() {
      if (!this.filterOrgaUsed) {
        this.loading = false;
        this.loaded = true;
        return;
      }
      this.loading = true;
      this.loaded = false;
      let dataLives = await studioApi.listConferences(
        this.$store,
        true,
        this.filterOrgaUsed,
        'RECORDING'
      );
      this.lives = dataLives.filter((p:any) => {
        return null !== p;
      });
      let dataLivesToBe = await studioApi.listConferences(
        this.$store,
        true,
        this.filterOrgaUsed,
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
      let dataLivesPlanned = await studioApi.listConferences(
        this.$store,
        true,
        this.filterOrgaUsed,
        'PLANNED'
      );
      this.livesToBe = dataLivesToBe
        .slice(indexPast)
        .concat(dataLivesPlanned)
        .filter((p: null) => {
          return null !== p;
        });
      if (this.organisationRight) {
        let dataLivesTerminated = await studioApi.listConferences(
          this.$store,
          true,
          this.filterOrgaUsed,
          'DEBRIEFING'
        );
        this.livesTerminated = dataLivesTerminated.filter((p:any) => {
          return null !== p;
        });
        let dataLivesError = await studioApi.listConferences(
          this.$store,
          true,
          this.filterOrgaUsed,
          'ERROR'
        );
        this.livesError = dataLivesError.filter((p:any) => {
          return null !== p;
        });
        let dataLivesPublishing = await studioApi.listConferences(
          this.$store,
          true,
          this.filterOrgaUsed,
          'PUBLISHING'
        );
        this.livesPublishing = dataLivesPublishing.filter((p:any) => {
          return null !== p;
        });
      }
      let listIds = this.lives
        .concat(this.livesToBe)
        .concat(this.livesNotStarted);
      this.$emit('initConferenceIds', listIds);
      this.loading = false;
      this.loaded = true;
    },
    deleteLive(index: any) {
      this.lives.splice(index, 1);
    },
    deleteLiveToBe(index: any) {
      this.livesToBe.splice(index, 1);
    },
    deleteLiveTerminated(index: any) {
      this.livesTerminated.splice(index, 1);
    },
    deleteLiveError(index: any) {
      this.livesError.splice(index, 1);
    },
    deleteLiveNotStarted(index: any) {
      this.livesNotStarted.splice(index, 1);
    },
    deleteLivePublishing(index: any) {
      this.livesPublishing.splice(index, 1);
    },
    updateLiveLocal() {
      for (
        let index = 0, len = this.conferenceWatched.length;
        index < len;
        index++
      ) {
        const element:any = this.conferenceWatched[index];
        let indexLivesToBe = this.livesToBe.findIndex(
          (          el: { conferenceId: any; }) => el.conferenceId === element.conferenceId
        );
        if (-1 === indexLivesToBe) {
          let indexLives = this.lives.findIndex(
            (            el: { conferenceId: any; }) => el.conferenceId === element.conferenceId
          );
          if (-1 === indexLives || 'DEBRIEFING' !== element.status) continue;
          let newConf = this.lives[indexLives];
          newConf.status = element.status;
          this.lives.splice(indexLives, 1);
          this.livesTerminated.push(newConf);
          break;
        }
        if ('RECORDING' !== element.status) continue;
        let newConf = this.livesToBe[indexLivesToBe];
        newConf.status = element.status;
        this.livesToBe.splice(indexLivesToBe, 1);
        this.lives.push(newConf);
        break;
      }
    },
  },

  watch: {
    async organisationId() {
      this.initArrays();
      const isLive = await octopusApi.liveEnabledOrganisation(
        this.organisationId
      );
      if (isLive) {
        this.fetchContent();
      } else {
        this.loading = false;
        this.loaded = true;
      }
    },
    filterOrga():any {
      this.initArrays();
      this.fetchContent();
    },
    conferenceWatched: {
      handler() {
        this.updateLiveLocal();
      },
      deep: true,
    },
  },
});
</script>
