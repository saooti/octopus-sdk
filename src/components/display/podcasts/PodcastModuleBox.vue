<template>
  <div class="module-box">
    <div class="mb-2 d-flex">
      <div class="w-100">
        <PodcastImage
          :class="[
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
          class="d-flex justify-content-between flex-wrap mb-2"
        >
          <div
            v-if="0 !== date.length"
            :class="!isLiveReady ? 'me-5' : ''"
          >
            {{ date }}
          </div>
          <div>
            {{ duration}}
          </div>
          <div
            v-if="isLiveReady"
            class="text-danger"
          >
            {{ $t('Episode record in live') }}
          </div>
        </div>
        <div
          class="text-uppercase h2 mb-3"
        >
          {{ podcast.title }}
        </div>
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="descriptionText html-wysiwyg-content"
          v-html="urlify(podcast.description)"
        />
        <!-- eslint-enable -->
        <div class="my-3">
          <ParticipantDescription class="mb-1" :participants="podcast.animators" />
          <div class="mb-1">
            {{ $t('Emission') + ' : ' }}
            <router-link
              :to="{
                name: 'emission',
                params: { emissionId: podcast.emission.emissionId },
                query: {
                  productor: filterOrgaId,
                },
              }"
            >
              {{ podcast.emission.name }}
            </router-link>
          </div>
          <div class="mb-1" v-if="!isPodcastmaker">
            {{ $t('Producted by : ') }}
            <router-link
              :to="{
                name: 'productor',
                params: { productorId: podcast.organisation.id },
                query: {
                  productor: filterOrgaId,
                },
              }"
            >
              {{ podcast.organisation.name }}
            </router-link>
          </div>
          <div class="mb-1" v-if="''!==photoCredit">
            {{ $t('Photo credits') + " : "+ photoCredit }}
          </div>
          <div class="mb-1" v-if="''!==audioCredit">
            {{ $t('Audio credits') + " : "+ audioCredit }}
          </div>
          <a
            v-if="podcast.article"
            class="btn d-flex align-items-center my-2 width-fit-content mb-1"
            :href="podcast.article"
            rel="noopener"
            target="_blank"
          >
            <span class="saooti-newspaper me-1" />
            <div>{{ $t('See associated article') }}</div>
          </a>
          <ParticipantDescription
            class="mb-1"
            :participants="podcast.guests"
            :is-guest="true"
          />
          <PodcastPlayBar
            :podcast-id="podcast.podcastId"
            :duration="podcast.duration"
          />
          <div v-if="editRight && !isPodcastmaker">
            <div
              v-if="podcast.annotations && 'RSS'===podcast.annotations.SOURCE_KIND"
              class="me-5 text-secondary"
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
    <RecordingItemButton
      v-if="
        !!fetchConference &&
          isLiveReadyToRecord &&
          !isNotRecorded &&
          isOctopusAndAnimator
      "
      :podcast="podcast"
      :live="true"
      :recording="fetchConference"
      @deleteItem="removeDeleted"
      @validatePodcast="$emit('updatePodcast', $event)"
    />
    <EditBox
      v-else-if="editRight && isEditBox"
      :podcast="podcast"
      @validatePodcast="$emit('updatePodcast', $event)"
    />
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
import { state } from '../../../stores/ParamSdkStore';
import dayjs from 'dayjs';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import displayMethods from '../../mixins/displayMethods';
import { orgaComputed } from '../../mixins/orgaComputed';
import { Podcast } from '@/stores/class/general/podcast';
import { Conference } from '@/stores/class/conference/conference';

import { defineComponent, defineAsyncComponent } from 'vue';
const ErrorMessage = defineAsyncComponent(() => import('../../misc/ErrorMessage.vue'));
const RecordingItemButton = defineAsyncComponent(() => import('@/components/display/studio/RecordingItemButton.vue'));
const EditBox = defineAsyncComponent(() => import('@/components/display/edit/EditBox.vue'));
export default defineComponent({
  name: "PodcastModuleBox",
  components: {
    PodcastImage,
    ParticipantDescription,
    TagList,
    ErrorMessage,
    PodcastPlayBar,
    EditBox, 
    RecordingItemButton
  },

  mixins:[displayMethods, orgaComputed],

  props: {
    playingPodcast: { default: undefined, type: Object as ()=> Podcast},
    podcast: { default: undefined, type: Object as ()=> Podcast},
    fetchConference: { default: undefined, type: Object as ()=> Conference},
  },

  emits: ['playPodcast', 'updatePodcast'],

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
      if (this.podcast && 1970 !== dayjs(this.podcast.pubDate).year()){
        return dayjs(this.podcast.pubDate).format('D MMMM YYYY');
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
    photoCredit():string{
      return (this.podcast?.annotations?.photoCredit as string) ?? '';
    },
    audioCredit():string{
      return (this.podcast?.annotations?.audioCredit as string) ?? '';
    },
    isEditBox(): boolean{
      return (state.podcastPage.EditBox as boolean)?? false;
    },
  },
  methods: {
    playPodcast(podcast: Podcast): void {
      this.$emit('playPodcast', podcast);
    },
    removeDeleted(): void {
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push('/');
      }
    },
  },
})
</script>