<template>
  <div class="page-box">
    <div class="d-flex flex-column align-items-center mb-3">
      <h1>{{ $t('In live') }}</h1>
      <template v-if="!isPodcastmaker">
        <router-link
          v-if="liveRight && filterOrga"
          to="/main/priv/edit/live"
        >
          <button class="btn btn-primary">
            {{ $t('Launch a new live') }}
          </button>
        </router-link>
        <template v-else>
          <div class="align-self-start fw-bold mb-2">
            {{ $t('Please chose a productor') }}
          </div>
          <OrganisationChooser
            :defaultanswer="$t('Please chose a productor')"
            @selected="onOrganisationSelected"
          />
        </template>
      </template>
    </div>
    <LiveList
      v-if="filterOrga || organisationId"
      :conference-watched="conferenceWatched"
      :organisation-id="organisationId"
      @initConferenceIds="initConferenceIds"
    />
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import { Organisation } from '@/store/class/general/organisation';
import { defineComponent, defineAsyncComponent } from 'vue';
import { Conference } from '@/store/class/conference/conference';
const LiveList = defineAsyncComponent(() => import('../display/live/LiveList.vue'));
const OrganisationChooser = defineAsyncComponent(() => import('../display/organisation/OrganisationChooser.vue'));
export default defineComponent({
  components: {
    LiveList,
    OrganisationChooser,
  },
  props: {
    conferenceWatched: { default: () => [], type: Array as ()=>Array<{conferenceId:number,interval:ReturnType<typeof setTimeout>|undefined, status:string}>},
    organisationId: { default: undefined, type: String },
    productor:{default:undefined, type: String}
  },
  emits: ['update:organisationId', 'initConferenceIds'],
  data() {
    return {
      live: true as boolean,
    };
  },
  
  computed: {
    liveRight(): boolean {
      return (state.generalParameters.isRoleLive as boolean)&& this.live;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
  },
  created() {
    if (this.productor) {
      this.$emit('update:organisationId',this.productor);
    } else if (this.$store.state.filter.organisationId) {
      this.$emit('update:organisationId',this.$store.state.filter.organisationId);
    }
    if (!this.$store.state.auth?.organisation?.attributes?.['live.active']) {
      this.live = false;
    }
  },
  methods: {
    initConferenceIds(listIds: Array<Conference>): void {
      this.$emit('initConferenceIds', listIds);
    },
    onOrganisationSelected(organisation: Organisation|undefined): void {
      this.$emit('update:organisationId', organisation?.id);
    },
  },
})
</script>