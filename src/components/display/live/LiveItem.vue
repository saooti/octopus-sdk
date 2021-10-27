<template>
  <div
    v-if="live"
    class="d-flex w-100"
  >
    <router-link
      class="live-date-box"
      :to="{
        name: 'podcast',
        params: { podcastId: live.podcastId },
        query: { productor: $store.state.filter.organisationId },
      }"
    >
      <div class="fw-bold">
        {{ date }}
      </div>
      <div class="fw-bold">
        {{ hours }}
      </div>
      <div class="font-size-smaller">
        {{ $t('Duration', { duration: duration }) }}
      </div>
    </router-link>
    <router-link
      :to="{
        name: 'podcast',
        params: { podcastId: live.podcastId },
        query: { productor: $store.state.filter.organisationId },
      }"
    >
      <PodcastImage
        class="me-3"
        :class="
          fetchConference &&
            'null' !== fetchConference &&
            fetchConference.status
            ? fetchConference.status.toLowerCase() + '-shadow'
            : ''
        "
        :podcast="live"
        :hide-play="false"
        :playing-podcast="false"
        :fetch-conference="fetchConference"
        :is-animator-live="organisationRight"
      />
    </router-link>
    <div class="d-flex flex-column live-special-width">
      <router-link
        class="text-uppercase link-info text-truncate"
        :to="{
          name: 'podcast',
          params: { podcastId: live.podcastId },
          query: { productor: $store.state.filter.organisationId },
        }"
      >
        {{ live.title }}
      </router-link>
      <router-link
        class="link-info text-truncate"
        :to="{
          name: 'emission',
          params: { emissionId: live.emission.emissionId },
          query: { productor: $store.state.filter.organisationId },
        }"
      >
        {{ live.emission.name }}
      </router-link>
      <div
        :id="'description-live-container-' + live.podcastId"
        class="live-description-container html-wysiwyg-content"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div
          :id="'description-live-' + live.podcastId"
          v-html="urlify(description)"
        />
        <!-- eslint-enable -->
      </div>
      <div
        v-if="live.animators"
        class="comma"
      >
        {{ $t('Animated by') }}<div class="mx-1">
          :
        </div>
        <router-link
          v-for="animator in live.animators"
          :key="animator.participantId"
          :aria-label="$t('Participant')"
          class="link-info"
          :to="{
            name: 'participant',
            params: { participantId: animator.participantId },
            query: { productor: $store.state.filter.organisationId },
          }"
        >
          {{ getName(animator) }}
        </router-link>
      </div>
      <div v-if="!isPodcastmaker">
        {{ $t('Producted by : ') }}
        <router-link
          class="link-info"
          :to="{
            name: 'productor',
            params: { productorId: live.organisation.id },
            query: { productor: $store.state.filter.organisationId },
          }"
        >
          {{ live.organisation.name }}
        </router-link>
      </div>
      <RecordingItemButton
        v-if="fetchConference && organisationRight && isEditBox"
        :live="true"
        :recording="fetchConference"
        :podcast="live"
        @deleteItem="deleteItem"
        @validatePodcast="updatePodcast"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
import PodcastImage from '../podcasts/PodcastImage.vue';
import studioApi from '@/api/studio';
import moment from 'moment';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import { displayMethods } from '../../mixins/functions';
import { Podcast } from '@/store/class/podcast';
import { Participant } from '@/store/class/participant';

import { defineComponent, defineAsyncComponent } from 'vue';
const RecordingItemButton = defineAsyncComponent(() => import('@/components/display/studio/RecordingItemButton.vue'));
export default defineComponent({
  name: 'LiveItem',

  components: {
    RecordingItemButton,
    PodcastImage,
  },
  mixins: [displayMethods],
  props: {
    fetchConference: { default: undefined, type: Object as ()=>Podcast},
    index: { default: undefined, type: Number},
  },
  emits: ['deleteItem'],

  data() {
    return {
      live: undefined as Podcast|undefined,
    };
  },
  
  computed: {
    isEditBox(): boolean {
      return state.podcastPage.EditBox;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    hours(): string {
      if(!this.live){ return ''; }
      return moment(this.live.pubDate).format('À HH[H]mm');
    },
    date(): string {
      if(!this.live){ return ''; }
      return moment(this.live.pubDate).format('D/MM/YYYY');
    },
    displayDate(): string {
      if(!this.live){ return ''; }
      return moment(this.live.pubDate).format('X');
    },
    description(): string {
      if (this.live && this.live.description) return this.live.description;
      return '';
    },
    myOrganisationId(): string {
      return state.generalParameters.organisationId;
    },
    organisationRight(): boolean {
      if (
        this.isRoleLive && this.live && 
        this.myOrganisationId === this.live.organisation.id
      )
        return true;
      return false;
    },
    isRoleLive(): boolean {
      return state.generalParameters.isRoleLive;
    },
    duration(): string {
      if (!this.live || this.live.duration <= 1) return '';
      if (this.live.duration > 600000) {
        return humanizeDuration(this.live.duration, {
          language: this.$i18n.locale,
          largest: 1,
          round: true,
        });
      }
      return humanizeDuration(this.live.duration, {
        language: this.$i18n.locale,
        largest: 2,
        round: true,
      });
    },
  },
  watch: {
    live: {
      deep: true,
      handler(){
      this.handleDescription();
      }
    },
  },

  async created() {
    this.fetchPodcastData();
  },
  methods: {
    updatePodcast(podcastUpdated: Podcast): void {
      this.live = podcastUpdated;
    },
    getName(person: Participant): string {
      const first = person.firstName || '';
      const last = person.lastName || '';
      return (first + ' ' + last).trim();
    },
    async fetchPodcastData(): Promise<void> {
      if (!this.fetchConference || !this.fetchConference.podcastId) return;
      try {
        this.live = await octopusApi.fetchPodcast(
          this.fetchConference.podcastId
        );
      } catch {
        this.$emit('deleteItem', this.index);
        if(this.fetchConference.conferenceId){
          studioApi.deleteConference(
            this.$store.state,
            this.fetchConference.conferenceId.toString()
          );
        }
      }
    },
    async handleDescription(): Promise<void> {
      this.$nextTick(() => {
        if(!this.live){
          return;
        }
        const liveDesc = document.getElementById(
          'description-live-' + this.live.podcastId
        );
        const liveDescContainer = document.getElementById(
          'description-live-container-' + this.live.podcastId
        );
        if (
          null !== liveDesc && null !== liveDescContainer && 
          liveDesc.clientHeight > liveDescContainer.clientHeight
        ) {
          liveDescContainer.classList.add('after-live-description');
        }
      });
    },
    deleteItem(): void {
      this.$emit('deleteItem', this.index);
    },
  },
})
</script>

<style lang="scss">
.live-date-box {
  width: 200px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
}
.font-size-smaller {
  font-size: smaller;
}
.live-description-container {
  overflow: hidden;
  margin-top: 0.5em;
  word-break: break-word;
  max-height: 6rem;
  position: relative;
  &.after-live-description:after {
    content: '...';
    position: absolute;
    padding-left: 1rem;
    right: 0;
    bottom: 0;
    width: 100%;
    font-size: 1rem;
    font-weight: bolder;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #f3f3f3 40%);
  }
}
.live-special-width {
  width: 0;
  flex-grow: 1;
}

</style>