<template>
  <div class="module-box">
    <div
      class="text-uppercase h4"
    >
      {{ podcast.title }}
    </div>
    <div class="mb-5 mt-3 d-flex">
      <div class="w-100">
        <PodcastImage
          :class="[
            !isLiveReadyToRecord
              ? 'shadow-element'
              : '',
            isLiveReadyToRecord &&
              fetchConference &&
              'null' !== fetchConference &&
              fetchConference.status
              ? fetchConference.status.toLowerCase() + '-shadow'
              : '',
          ]"
          class="me-3"
          :podcast="podcast"
          :hide-play="!isLiveReadyToRecord"
          :playing-podcast="playingPodcast"
          :fetch-conference="fetchConference"
          :is-animator-live="isOctopusAndAnimator"
          @playPodcast="playPodcast"
        />
        <div
          class="d-flex flex-wrap mb-3"
          :class="isLiveReady ? 'justify-content-between' : ''"
        >
          <div
            v-if="0 !== date.length"
            :class="!isLiveReady ? 'me-5' : ''"
          >
            {{ date }}
          </div>
          <div>
            {{ $t('Duration', { duration: duration }) }}
          </div>
          <div
            v-if="isLiveReady"
            class="text-danger"
          >
            {{ $t('Episode record in live') }}
          </div>
        </div>
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="descriptionText html-wysiwyg-content"
          v-html="urlify(podcast.description)"
        />
        <!-- eslint-enable -->
        <div class="my-3">
          <ParticipantDescription :participants="podcast.animators" />
          <div>
            {{ $t('Emission') + ' : ' }}
            <router-link
              class="fw-bold"
              :to="{
                name: 'emission',
                params: { emissionId: podcast.emission.emissionId },
                query: {
                  productor: filterOrga,
                },
              }"
            >
              {{ podcast.emission.name }}
            </router-link>
          </div>
          <div v-if="!isPodcastmaker">
            {{ $t('Producted by : ') }}
            <router-link
              class="fw-bold"
              :to="{
                name: 'productor',
                params: { productorId: podcast.organisation.id },
                query: {
                  productor: filterOrga,
                },
              }"
            >
              {{ podcast.organisation.name }}
            </router-link>
          </div>
          <a
            v-if="podcast.article"
            class="btn d-flex align-items-center my-2 width-fit-content"
            :href="podcast.article"
            rel="noopener"
            target="_blank"
          >
            <span class="saooti-newspaper me-1" />
            <div>{{ $t('See associated article') }}</div>
          </a>
          <ParticipantDescription
            :participants="podcast.guests"
            :is-guest="true"
          />
          <PodcastPlayBar
            :podcast="podcast"
          />
          <div v-if="editRight && !isPodcastmaker">
            <div
              v-if="podcast.annotations && podcast.annotations.RSS"
              class="me-5"
            >
              {{ $t('From RSS') }}
            </div>
            <ErrorMessage
              v-if="''!==errorMessage"
              :message="errorMessage"
            />
          </div>
        </div>
      </div>
    </div>
    <TagList
      :tag-list="podcast.tags"
    />
  </div>
</template>

<script lang="ts">
import PodcastPlayBar from './PodcastPlayBar.vue';
import PodcastImage from './PodcastImage.vue';
import ParticipantDescription from './ParticipantDescription.vue';
import TagList from './TagList.vue';
import { state } from '../../../store/paramStore';
import moment from 'moment';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import { displayMethods } from '../../mixins/functions';
import { orgaComputed } from '../../mixins/orgaComputed';
import { Podcast } from '@/store/class/general/podcast';
import { Conference } from '@/store/class/conference/conference';

import { defineComponent, defineAsyncComponent } from 'vue';
const ErrorMessage = defineAsyncComponent(() => import('../../misc/ErrorMessage.vue'));
export default defineComponent({
  name: "PodcastModuleBox",
  components: {
    PodcastImage,
    ParticipantDescription,
    TagList,
    ErrorMessage,
    PodcastPlayBar
  },

  mixins:[displayMethods, orgaComputed],

  props: {
    playingPodcast: { default: undefined, type: Object as ()=> Podcast},
    podcast: { default: undefined, type: Object as ()=> Podcast},
    fetchConference: { default: undefined, type: Object as ()=> Conference},
  },

  emits: ['playPodcast'],

  computed: {
    errorMessage(): string{
      if(!this.podcast?.availability.visibility){
        return this.$t('Podcast is not visible for listeners');
      }
      if('ERROR' === this.podcast?.processingStatus){
        return this.$t('Podcast in ERROR, please contact Saooti');
      }
      return this.podcastNotValid ? this.$t('Podcast not validated') : '';
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    date(): string {
      if (this.podcast && 1970 !== moment(this.podcast.pubDate).year()){
        return moment(this.podcast.pubDate).format('D MMMM YYYY, HH[h]mm');
      }
      return '';
    },
    duration(): string {
      if (!this.podcast || this.podcast.duration <= 1) return '';
      if (this.podcast.duration > 600000) {
        return humanizeDuration(this.podcast.duration, {
          language: this.$i18n.locale,
          largest: 1,
          round: true,
        });
      }
      return humanizeDuration(this.podcast.duration, {
        language: this.$i18n.locale,
        largest: 2,
        round: true,
      });
    },
    editRight(): boolean {
      return (true===this.authenticated &&
        this.myOrganisationId === this.podcast?.organisation.id) ||true===state.generalParameters.isAdmin
    },
    isLiveReadyToRecord(): boolean {
      return (undefined!==this.podcast && undefined!==this.podcast.conferenceId && 0 !== this.podcast.conferenceId && 'READY_TO_RECORD' === this.podcast.processingStatus);
    },
    isLiveReady(): boolean {
      return (
        undefined!==this.podcast?.conferenceId &&
        0 !== this.podcast?.conferenceId &&
        'READY' === this.podcast?.processingStatus
      );
    },
    isNotRecorded(): boolean {
      return (
        this.isLiveReadyToRecord &&
        undefined!==this.fetchConference &&
        'DEBRIEFING' === this.fetchConference.status
      );
    },
    isOctopusAndAnimator(): boolean {
      return (
        !this.isPodcastmaker &&
        this.editRight &&
        (state.generalParameters.isRoleLive as boolean)
      );
    },
    podcastNotValid(): boolean {
      return undefined!==this.podcast?.availability && false === this.podcast?.valid;
    },
  },
  methods: {
    playPodcast(podcast: Podcast): void {
      this.$emit('playPodcast', podcast);
    },
  },
})
</script>