<template>
  <div class="page-box">
    <div class="d-flex flex-column align-items-center mb-3">
      <h1>{{ $t('In live') }}</h1>
      <template v-if="!isPodcastmaker">
        <router-link to="/main/priv/edit/live" v-if="liveRight && filterOrga">
          <button class="btn btn-primary">{{ $t('Launch a new live') }}</button>
        </router-link>
        <template v-else>
          <div class="align-self-start font-weight-bold mb-2">
            {{ $t('Please chose a productor') }}
          </div>
          <OrganisationChooser
            :defaultanswer="$t('Please chose a productor')"
            :all="true"
            @selected="onOrganisationSelected"
          />
        </template>
      </template>
    </div>
    <LiveList
      @initConferenceIds="initConferenceIds"
      :conferenceWatched="conferenceWatched"
      :organisationId="organisationId"
      v-if="filterOrga || organisationId"
    />
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
// @ is an alias to /src
import { state } from '../../store/paramStore';

import Vue from 'vue';
import { Organisation } from '@/store/class/organisation';
export default Vue.extend({
  components: {
    LiveList: () => import('../display/live/LiveList.vue'),
    OrganisationChooser: () => import('../display/organisation/OrganisationChooser.vue'),
  },
  props: {
    conferenceWatched: { default: () => ([])  },
    organisationId: { default: undefined as any },
    productor:{default:undefined as string|undefined}
  },
  data() {
    return {
      live: true as boolean,
    };
  },
  created() {
    if (this.productor) {
      this.$emit('update:organisationId',this.productor);
    } else if (this.$store.state.filter.organisationId) {
      this.$emit('update:organisationId',this.$store.state.filter.organisationId);
    }
    if (
      this.$store.state.organisation &&
      this.$store.state.organisation.attributes &&
      !this.$store.state.organisation.attributes['live.active']
    ) {
      this.live = false;
    }
  },
  
  computed: {
    liveRight(): boolean {
      if (this.isRoleLive && this.live) return true;
      return false;
    },
    isRoleLive(): boolean {
      return state.generalParameters.isRoleLive;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
  },
  methods: {
    initConferenceIds(listIds: any): void {
      this.$emit('initConferenceIds', listIds);
    },
    onOrganisationSelected(organisation: Organisation|undefined): void {
      if (organisation && organisation.id) {
        this.$emit('update:organisationId', organisation.id);
      } else {
        this.$emit('update:organisationId', undefined);
      }
    },
  },
});
</script>
