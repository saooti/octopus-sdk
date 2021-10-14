<template>
  <div class="module-box">
    <h2
      v-if="!isOuestFrance"
      class="text-uppercase fw-bold title-page-podcast"
    >
      {{ podcast.title }}
    </h2>
    <router-link
      v-else
      :to="{
        name: 'emission',
        params: { emissionId: podcast.emission.emissionId },
        query: { productor: $store.state.filter.organisationId },
      }"
    >
      <h1>{{ podcast.emission.name }}</h1>
    </router-link>
    <div class="mb-5 mt-3 d-flex">
      <div class="w-100">
        <PodcastImage
          :class="[
            !isOuestFrance && !isLiveReadyToRecord
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
        <h3 v-if="isOuestFrance">
          {{ podcast.title }}
        </h3>
        <div
          class="date-text-zone"
          :class="isLiveReady ? 'justify-content-between' : ''"
        >
          <div
            v-if="!isOuestFrance && 0 !== date.length"
            :class="!isLiveReady ? 'me-5' : ''"
          >
            {{ date }}
          </div>
          <div class="ms-2 me-2 duration">
            <span
              v-if="isOuestFrance"
              class="saooti-clock3"
            />{{ $t('Duration', { duration: duration }) }}
          </div>
          <div
            v-if="isLiveReady"
            class="text-danger"
          >
            {{ $t('Episode record in live') }}
          </div>
        </div>
        <div
          class="descriptionText html-wysiwyg-content"
          v-html="urlify(podcast.description)"
        />
        <div class="mt-3 mb-3">
          <ParticipantDescription :participants="podcast.animators" />
          <div v-if="!isOuestFrance">
            {{ $t('Emission') + ' : ' }}
            <router-link
              class="link-info"
              :to="{
                name: 'emission',
                params: { emissionId: podcast.emission.emissionId },
                query: {
                  productor: $store.state.filter.organisationId,
                },
              }"
            >
              {{ podcast.emission.name }}
            </router-link>
          </div>
          <div v-if="!isPodcastmaker">
            {{ $t('Producted by : ') }}
            <router-link
              class="link-info"
              :to="{
                name: 'productor',
                params: { productorId: podcast.organisation.id },
                query: {
                  productor: $store.state.filter.organisationId,
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
          <div v-if="editRight && !isPodcastmaker">
            <div
              v-if="podcast.annotations && podcast.annotations.RSS"
              class="me-5"
            >
              {{ $t('From RSS') }}
            </div>
            <ErrorMessage
              v-if="!podcast.availability.visibility"
              :message="$t('Podcast is not visible for listeners')"
            />
            <ErrorMessage
              v-if="'ERROR' === podcast.processingStatus"
              :message="$t('Podcast in ERROR, please contact Saooti')"
            />
            <ErrorMessage
              v-if="podcastNotValid"
              :message="$t('Podcast not validated')"
            />
          </div>
          <ShareButtons
            v-if="isDownloadButton"
            :podcast="podcast"
            :big-round="true"
            :audio-url="podcast.audioUrl"
          />
        </div>
      </div>
    </div>
    <TagList
      v-if="isTagList"
      :tag-list="podcast.tags"
    />
  </div>
</template>

<script lang="ts">
import PodcastImage from './PodcastImage.vue';
import ParticipantDescription from './ParticipantDescription.vue';
import { state } from '../../../store/paramStore';
const moment = require('moment');
const humanizeDuration = require('humanize-duration');
import { displayMethods } from '../../mixins/functions';
import { Podcast } from '@/store/class/podcast';
import { Conference } from '@/store/class/conference';

import { defineComponent, defineAsyncComponent } from 'vue';
const ShareButtons = defineAsyncComponent(() => import('../sharing/ShareButtons.vue'));
const TagList = defineAsyncComponent(() => import('./TagList.vue'));
const ErrorMessage = defineAsyncComponent(() => import('../../misc/ErrorMessage.vue'));
export default defineComponent({
  name: "PodcastModuleBox",
  components: {
    PodcastImage,
    ParticipantDescription,
    ShareButtons,
    TagList,
    ErrorMessage,
  },

  mixins:[displayMethods],

  props: {
    playingPodcast: { default: undefined, type: Object as ()=> Podcast},
    podcast: { default: undefined, type: Object as ()=> Podcast},
    fetchConference: { default: undefined, type: Object as ()=> Conference},
  },

  emits: ['playPodcast'],

  data() {
    return {
    };
  },

  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    isOuestFrance(): boolean {
      return state.podcastPage.ouestFranceStyle;
    },
    isTagList(): boolean {
      return state.podcastPage.tagList;
    },
    isDownloadButton(): boolean {
      return state.podcastPage.downloadButton;
    },
    date(): string {
      if (this.podcast && 1970 !== moment(this.podcast.pubDate).year()){
        if('fr' === this.$i18n.locale){
          return moment(this.podcast.pubDate).format('D MMMM YYYY [à] HH[h]mm');
        }
        return moment(this.podcast.pubDate).format('D MMMM YYYY [at] HH[h]mm');
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
      if ( this.podcast &&
        (this.authenticated &&
          this.organisationId === this.podcast.organisation.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    isLiveReadyToRecord(): boolean {
      return (undefined!==this.podcast && undefined!==this.podcast.conferenceId && 0 !== this.podcast.conferenceId && 'READY_TO_RECORD' === this.podcast.processingStatus);
    },
    isLiveReady(): boolean {
      return (
        undefined!==this.podcast &&
        undefined!==this.podcast.conferenceId &&
        0 !== this.podcast.conferenceId &&
        'READY' === this.podcast.processingStatus
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
        state.generalParameters.isRoleLive
      );
    },
    podcastNotValid(): boolean {
      if (
        this.podcast &&
        this.podcast.availability &&
        false === this.podcast.valid
      )
        return true;
      return false;
    },
  },
  methods: {
    playPodcast(podcast: Podcast): void {
      this.$emit('playPodcast', podcast);
    },
  },
})
</script>

<style lang="scss">
.title-page-podcast {
  font-size: 0.9rem;
}
.width-fit-content{
  width: fit-content;
}

.date-text-zone {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  @media (max-width: 600px) {
    display: initial;
    .duration {
      margin-left: 0 !important;
    }
  }
}
</style>