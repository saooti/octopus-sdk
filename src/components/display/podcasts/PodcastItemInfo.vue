<template>
  <div class="d-contents podcast-item-info">
    <div class="d-flex justify-content-between flex-wrap text-secondary mb-3">
      <div class="me-3 small-text">
        {{ date }}
      </div>
      <div
        v-if="0 !== durationString.length"
        class="small-text"
      >
        {{ durationString }}
      </div>
    </div>
    <AnimatorsItem :animators="animators" />
    <router-link
      :to="{
        name: 'podcast',
        params: { podcastId: podcastId },
        query: { productor: $store.state.filter.organisationId },
      }"
      class="text-dark d-flex flex-column flex-grow-1"
    >
      <div class="title-podcast-item">
        {{ title }}
      </div>
    </router-link>
    <PodcastPlayBar
      :podcast-id="podcastId"
      :duration="duration"
      class="mx-2"
    />
    <div class="d-flex justify-content-between">
      <router-link
        v-if="!isPodcastmaker"
        :to="{
          name: 'productor',
          params: { productorId: podcastOrganisationId },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark producer-podcast-item"
      >
        <div>{{ '© ' + podcastOrganisationName }}</div>
      </router-link>
      <span
        v-if="editRight && podcastOrder && podcastOrder > 1"
        class="saooti-pin-octopus text-danger pe-2"
      />
    </div>
  </div>
</template>

<script lang="ts">
import AnimatorsItem from './AnimatorsItem.vue';
import { state } from '../../../store/paramStore';
import moment from 'moment';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import PodcastPlayBar from './PodcastPlayBar.vue';
import { defineComponent } from 'vue'
import { Participant } from '@/store/class/general/participant';
export default defineComponent({
  name: 'PodcastItemInfo',
  
  components: {
    AnimatorsItem,
    PodcastPlayBar
  },

  props: {
    podcastId: { default: undefined, type: Number},
    title: { default: "", type: String},
    pubDate: { default: "", type: String},
    podcastOrganisationId: { default: "", type: String},
    podcastOrganisationName: { default: "", type: String},
    podcastOrder: { default: undefined, type: Number},
    duration: { default: 0, type: Number},
    animators: { default: undefined, type: Object as ()=> Array<Participant>},
  },
  
  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    date(): string {
      return moment(this.pubDate).format('D MMMM YYYY, HH[h]mm');
    },
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
    editRight(): boolean {
      if (
        (this.authenticated &&
          this.organisationId === this.podcastOrganisationId) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    durationString(): string {
      if (this.duration <= 1) return '';
      if (this.duration > 600000) {
        return humanizeDuration(this.duration, {
          language: 'short',
          largest: 1,
          round: true,
          languages: {
            short: {
              y: () => 'years',
              mo: () => 'months',
              w: () => 'weeks',
              d: () => 'days',
              h: () => 'h',
              m: () => 'min',
              s: () => 'sec',
              ms: () => 'ms',
            },
          },
        });
      }
      return humanizeDuration(this.duration, {
        language: 'short',
        largest: 2,
        round: true,
        languages: {
          short: {
            m: () => 'min',
            s: () => 'sec',
            ms: () => 'ms',
          },
        },
      });
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
.podcast-item-info {
  .text-secondary {
    margin: 0.5rem !important;
  }
  .saooti-pin-octopus {
    font-size: 22px;
  }
  .title-podcast-item {
    font-weight: 700;
    margin: 0.25rem 0.5rem 0.5rem;
    overflow: hidden;
    display: -webkit-box;
    flex-grow: 1;
    font-size: 0.7rem;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    min-height: 3rem;
    line-height: 1rem;
    word-break: break-word;
  }

  .producer-podcast-item {
    margin: 0.2rem 0.5rem 0.5rem;
    font-size: 0.55rem;
    color: #666;
  }
}
}
</style>