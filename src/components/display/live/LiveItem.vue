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
        class="text-uppercase fw-bold text-truncate"
        :to="{
          name: 'podcast',
          params: { podcastId: live.podcastId },
          query: { productor: $store.state.filter.organisationId },
        }"
      >
        {{ live.title }}
      </router-link>
      <router-link
        class="fw-bold text-truncate"
        :to="{
          name: 'emission',
          params: { emissionId: live.emission.emissionId },
          query: { productor: $store.state.filter.organisationId },
        }"
      >
        {{ live.emission.name }}
      </router-link>
      <div
        ref="descriptionLiveContainer"
        class="live-description-container html-wysiwyg-content"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div
          ref="descriptionLive"
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
          :title="$t('Participant')"
          class="fw-bold"
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
          class="fw-bold"
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
import crudApi from '@/api/classicCrud';
import moment from 'moment';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import displayMethods from '../../mixins/displayMethods';
import { Podcast } from '@/store/class/general/podcast';
import { Participant } from '@/store/class/general/participant';

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
      return (state.podcastPage.EditBox as boolean);
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    hours(): string {
      return !this.live?'': moment(this.live.pubDate).format('HH[H]mm');
    },
    date(): string {
      return !this.live? '': moment(this.live.pubDate).format('D/MM/YYYY');
    },
    displayDate(): string {
      return !this.live? '':moment(this.live.pubDate).format('X');
    },
    description(): string {
      return this.live?.description??'';
    },
    myOrganisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    organisationRight(): boolean {
      return true===this.isRoleLive && this.myOrganisationId === this.live?.organisation.id;
    },
    isRoleLive(): boolean {
      return (state.generalParameters.isRoleLive as boolean);
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
      return (`${person.firstName??''} ${person.lastName??''}`).trim();
    },
    async fetchPodcastData(): Promise<void> {
      if (!this.fetchConference || !this.fetchConference.podcastId) return;
      try {
        this.live = await octopusApi.fetchData<Podcast>(0, 'podcast/'+this.fetchConference.podcastId);
      } catch {
        this.$emit('deleteItem', this.index);
        if(this.fetchConference.conferenceId){
          await crudApi.deleteData(this.$store.state, 9 ,'conference/'+this.fetchConference.conferenceId);
        }
      }
    },
    async handleDescription(): Promise<void> {
      this.$nextTick(() => {
        if(!this.live){
          return;
        }
        const liveDesc = (this.$refs.descriptionLive as HTMLElement);
        const liveDescContainer = (this.$refs.descriptionLiveContainer as HTMLElement);
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
.octopus-app{
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
}
</style>