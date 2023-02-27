<template>
  <div class="d-flex justify-content-between flex-wrap text-secondary m-2 mb-3">
    <div class="me-3 h6">
      {{ date }}
    </div>
    <div
      v-if="0 !== durationString.length"
      class="h6"
    >
      {{ durationString }}
    </div>
  </div>
  <AnimatorsItem
    v-if="animators && 0!==animators.length"
    :animator="animators[0]"
  />
  <router-link
    :to="{
      name: 'podcast',
      params: { podcastId: podcastId },
      query: { productor: filterOrgaId },
    }"
    class="text-dark flex-grow-1 title-podcast-item"
  >
    {{ title }}
  </router-link>
  <PodcastPlayBar
    :podcast-id="podcastId"
    :duration="duration"
    class="mx-2"
  />
  <div class="d-flex justify-content-between">
    <div
      v-if="isPodcastmaker"
      class="useless-div-for-podcastmaker"
    />
    <router-link
      v-if="!isPodcastmaker"
      :to="{
        name: 'productor',
        params: { productorId: podcastOrganisationId },
        query: { productor: filterOrgaId },
      }"
      class="text-dark producer-podcast-item"
    >
      {{ '© ' + podcastOrganisationName }}
    </router-link>
  </div>
</template>

<script lang="ts">
import AnimatorsItem from './AnimatorsItem.vue';
import { state } from '../../../stores/ParamSdkStore';
import { orgaComputed } from '../../mixins/orgaComputed';
import dayjs from 'dayjs';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import PodcastPlayBar from './PodcastPlayBar.vue';
import { defineComponent } from 'vue'
import { Participant } from '@/stores/class/general/participant';
export default defineComponent({
  name: 'PodcastItemInfo',
  
  components: {
    AnimatorsItem,
    PodcastPlayBar
  },

  mixins:[orgaComputed],

  props: {
    podcastId: { default: undefined, type: Number},
    title: { default: "", type: String},
    pubDate: { default: "", type: String},
    podcastOrganisationId: { default: "", type: String},
    podcastOrganisationName: { default: "", type: String},
    duration: { default: 0, type: Number},
    animators: { default: undefined, type: Object as ()=> Array<Participant>},
  },
  
  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    date(): string {
      return dayjs(this.pubDate).format('D MMMM YYYY, HH[h]mm');
    },
    editRight(): boolean {
      return (true===this.authenticated && this.myOrganisationId === this.podcastOrganisationId) ||
        true===state.generalParameters.isAdmin
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
    margin-left: auto;
  }
}
</style>