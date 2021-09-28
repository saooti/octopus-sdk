<template>
  <div>
    <div class="page-box" v-if="loaded && !error">
      <h1 v-if="!isOuestFrance">{{ titlePage }}</h1>
      <Countdown :timeRemaining="timeRemaining" v-if="isCounter" />
      <div class="d-flex">
        <div class="d-flex flex-column flex-super-grow">
          <RecordingItemButton
            class="module-box text-center-mobile flex-no-grow"
            :podcast="podcast"
            :live="true"
            :recording="fetchConference"
            @deleteItem="removeDeleted"
            @validatePodcast="updatePodcast"
            v-if="
              !!fetchConference &&
                isLiveReadyToRecord &&
                !isNotRecorded &&
                isOctopusAndAnimator
            "
          ></RecordingItemButton>
          <EditBox
            :podcast="podcast"
            v-else-if="editRight && isEditBox"
            :isReady="isReady"
            @validatePodcast="updatePodcast"
          ></EditBox>
          <div class="module-box">
            <h2
              class="text-uppercase font-weight-bold title-page-podcast"
              v-if="!isOuestFrance"
            >
              {{ this.podcast.title }}
            </h2>
            <router-link
              :to="{
                name: 'emission',
                params: { emissionId: podcast.emission.emissionId },
                query: { productor: $store.state.filter.organisationId },
              }"
              v-else
            >
              <h1>{{ this.podcast.emission.name }}</h1>
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
                  class="mr-3"
                  v-bind:podcast="podcast"
                  :hidePlay="!isLiveReadyToRecord"
                  :playingPodcast="playingPodcast"
                  @playPodcast="playPodcast"
                  :fetchConference="fetchConference"
                  :isAnimatorLive="isOctopusAndAnimator"
                />
                <h3 v-if="isOuestFrance">{{ this.podcast.title }}</h3>
                <div
                  class="date-text-zone"
                  :class="isLiveReady ? 'justify-content-between' : ''"
                >
                  <div
                    :class="!isLiveReady ? 'mr-5' : ''"
                    v-if="!isOuestFrance && 0 !== date.length"
                  >
                    {{ date }}
                  </div>
                  <div class="ml-2 mr-2 duration">
                    <span class="saooti-clock3" v-if="isOuestFrance"></span
                    >{{ $t('Duration', { duration: duration }) }}
                  </div>
                  <div class="text-danger" v-if="isLiveReady">
                    {{ $t('Episode record in live') }}
                  </div>
                </div>
                <div
                  class="descriptionText html-wysiwyg-content"
                  v-html="urlify(this.podcast.description)"
                ></div>
                <div class="mt-3 mb-3">
                  <ParticipantDescription :participants="podcast.animators"/>
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
                      >{{ this.podcast.emission.name }}</router-link
                    >
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
                      >{{ podcast.organisation.name }}</router-link
                    >
                  </div>
                  <a
                    class="btn d-flex align-items-center my-2 width-fit-content"
                    :href="podcast.article"
                    rel="noopener"
                    target="_blank"
                    v-if="podcast.article"
                  >
                    <span class="saooti-newspaper mr-1"></span>
                    <div>{{$t('See associated article')}}</div>
                  </a>
                  <ParticipantDescription :participants="podcast.guests" :isGuest="true"/>
                  <div v-if="editRight && !isPodcastmaker">
                    <div
                      class="mr-5"
                      v-if="podcast.annotations && podcast.annotations.RSS"
                    >
                      {{ $t('From RSS') }}
                    </div>
                    <ErrorMessage
                      :message="$t('Podcast is not visible for listeners')"
                      v-if="!podcast.availability.visibility"
                    />
                    <ErrorMessage
                      :message="$t('Podcast in ERROR, please contact Saooti')"
                      v-if="'ERROR' === podcast.processingStatus"
                    />
                    <ErrorMessage
                      :message="$t('Podcast not validated')"
                      v-if="podcastNotValid"
                    />
                  </div>
                  <ShareButtons
                    :podcast="podcast"
                    :bigRound="true"
                    :audioUrl="podcast.audioUrl"
                    v-if="isDownloadButton"
                  ></ShareButtons>
                </div>
              </div>
            </div>
            <TagList v-if="isTagList" :tagList="podcast.tags" />
          </div>
          <SubscribeButtons
            :emission="podcast.emission"
            v-if="isShareButtons && countLink >= 1"
          />
        </div>
        <div
          class="d-flex flex-column share-container"
          :class="authenticated || notExclusive ? 'flex-grow' : ''"
        >
          <SharePlayer
            :podcast="podcast"
            :emission="podcast.emission"
            :exclusive="exclusive"
            :notExclusive="notExclusive"
            :organisationId="organisationId"
            :isEducation="isEducation"
            v-if="isSharePlayer && (authenticated || notExclusive)"
          ></SharePlayer>
          <ShareButtons
            :podcast="podcast"
            :notExclusive="notExclusive"
            v-if="isShareButtons"
          ></ShareButtons>
        </div>
      </div>
      <template v-if="!isOuestFrance">
        <CommentSection
          :podcast="podcast"
          v-if="!isPodcastmaker"
          :fetchConference="fetchConference"
          ref="commentSection"
        />
        <PodcastInlineList
          :emissionId="this.podcast.emission.emissionId"
          :href="'/main/pub/emission/' + this.podcast.emission.emissionId"
          :title="$t('More episodes of this emission')"
          :buttonText="$t('All podcast emission button')"
        />
        <PodcastInlineList
          v-for="c in categories"
          :key="c.id"
          :iabId="c.id"
          :href="'/main/pub/category/' + c.id"
          :title="$t('More episodes of this category : ', { name: c.name })"
          :buttonText="$t('All podcast button', { name: c.name })"
        />
      </template>
    </div>
    <div class="d-flex justify-content-center" v-if="!loaded">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading content ...') }}</h3>
    </div>
    <div class="text-center" v-if="error">
      <h3>{{ $t("Podcast doesn't exist") }}</h3>
    </div>
  </div>
</template>
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
<script lang="ts">
// @ is an alias to /src
import PodcastInlineList from '../display/podcasts/PodcastInlineList.vue';
import PodcastImage from '../display/podcasts/PodcastImage.vue';
import ParticipantDescription from '../display/podcasts/ParticipantDescription.vue';
const octopusApi = require('@saooti/octopus-api');
import studioApi from '@/api/studio';
import { state } from '../../store/paramStore';
const moment = require('moment');
const humanizeDuration = require('humanize-duration');
import { displayMethods } from '../mixins/functions';
import { Podcast } from '@/store/class/podcast';
import { Conference } from '@/store/class/conference';
export default {
  components: {
    PodcastInlineList,
    PodcastImage,
    ParticipantDescription,
    ShareButtons: () => import('../display/sharing/ShareButtons.vue'),
    SharePlayer: () => import('../display/sharing/SharePlayer.vue'),
    EditBox: () => import('@/components/display/edit/EditBox.vue'),
    TagList: () => import('../display/podcasts/TagList.vue'),
    SubscribeButtons: () => import('../display/sharing/SubscribeButtons.vue'),
    RecordingItemButton: () => import('@/components/display/studio/RecordingItemButton.vue'),
    Countdown: () => import('../display/live/CountDown.vue'),
    CommentSection: () => import('../display/comments/CommentSection.vue'),
    ErrorMessage: () => import('../misc/ErrorMessage.vue'),
  },
  mixins:[displayMethods],
  props: {
    updateStatus: { default: undefined as string|undefined},
    playingPodcast: { default: undefined as Podcast|undefined},
    podcastId: { default: undefined as number|undefined},
    isEducation: { default: false as boolean},
  },
  emits: ['initConferenceId', 'podcastTitle', 'playPodcast'],

  data() {
    return {
      loaded: false as boolean,
      podcast: undefined as Podcast|undefined,
      error: false as boolean,
      exclusive: false as boolean,
      notExclusive: false as boolean,
      fetchConference: undefined as Conference|undefined,
    };
  },
  
  async mounted() {
    await this.getPodcastDetails(this.podcastId);
    if (!this.isLiveReadyToRecord) return;
    if (this.isOctopusAndAnimator) {
      const data: any = await studioApi.getConference(this.$store.state,this.podcast!.conferenceId!.toString());
      if ('' !== data.data) {
        this.fetchConference = data.data;
      } else {
        this.fetchConference = {conferenceId:-1, title:''};
      }
    } else if(undefined!==this.podcast!.conferenceId){
      const data: any = await octopusApi.getRealConferenceStatus(this.podcast!.conferenceId!.toString());
      this.fetchConference = {
        status: data.data,
        conferenceId: this.podcast!.conferenceId,
        title:'',
      };
    }
    if (
      this.fetchConference && 
      -1 !== this.fetchConference.conferenceId &&
      'PUBLISHING' !== this.fetchConference.status &&
      'DEBRIEFING' !== this.fetchConference.status
    ) {
      this.$emit('initConferenceId', this.podcast!.conferenceId);
    }
  },
  
  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    isEditBox(): boolean {
      return state.podcastPage.EditBox;
    },
    isShareButtons(): boolean {
      return state.podcastPage.ShareButtons;
    },
    isSharePlayer(): boolean {
      return state.podcastPage.SharePlayer;
    },
    allCategories(): any {
      return this.$store.state.categories;
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
    emissionMainCategory(): number {
      if (
        this.podcast!.emission.annotations &&
        this.podcast!.emission.annotations.mainIabId
      ) {
        return parseInt(this.podcast!.emission.annotations.mainIabId, 10);
      } else if (
        this.podcast!.emission.iabIds &&
        this.podcast!.emission.iabIds.length
      ) {
        return this.podcast!.emission.iabIds[0];
      }
      return 0;
    },
    categories(): any {
      if ('undefined' === typeof this.podcast) return '';
      return this.allCategories
        .filter((item: any) => {
          return (
            this.podcast!.emission.iabIds &&
            -1 !== this.podcast!.emission.iabIds.indexOf(item.id)
          );
        })
        .sort((a: any, b: any) => {
          if (a.id === this.emissionMainCategory) return -1;
          if (b.id === this.emissionMainCategory) return 1;
          return 0;
        });
    },
    date(): string {
      if (1970 !== moment(this.podcast!.pubDate).year()){
        if('fr' === this.$i18n.locale){
          return moment(this.podcast!.pubDate).format('D MMMM YYYY [à] HH[h]mm');
        }
        return moment(this.podcast!.pubDate).format('D MMMM YYYY [at] HH[h]mm');
      }
      return '';
    },
    duration(): string {
      if (this.podcast!.duration <= 1) return '';
      if (this.podcast!.duration > 600000) {
        return humanizeDuration(this.podcast!.duration, {
          language: this.$i18n.locale,
          largest: 1,
          round: true,
        });
      }
      return humanizeDuration(this.podcast!.duration, {
        language: this.$i18n.locale,
        largest: 2,
        round: true,
      });
    },
    editRight(): boolean {
      if (
        (this.authenticated &&
          this.organisationId === this.podcast!.organisation.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    isReady(): boolean {
      /* if(this.podcast && this.podcast.processingStatus !== "PLANNED" && this.podcast.processingStatus !== "PROCESSING"){
        return true;
      }else{
        return false;
      } */
      return true;
    },
    countLink(): number {
      let count = 0;
      if (this.podcast!.emission && this.podcast!.emission.annotations) {
        if (undefined !== this.podcast!.emission.annotations.amazon) count++;
        if (undefined !== this.podcast!.emission.annotations.applePodcast)
          count++;
        if (undefined !== this.podcast!.emission.annotations.deezer) count++;
        if (undefined !== this.podcast!.emission.annotations.spotify) count++;
        if (undefined !== this.podcast!.emission.annotations.tunein) count++;
        if (undefined !== this.podcast!.emission.annotations.radioline) count++;
        if (undefined !== this.podcast!.emission.annotations.podcastAddict) count++;
        if (undefined !== this.podcast!.emission.annotations.playerFm) count++;
        if (undefined !== this.podcast!.emission.annotations.stitcher) count++;
      }
      return count;
    },
    isLiveReadyToRecord(): boolean {
      return (undefined!==this.podcast!.conferenceId && 0 !== this.podcast!.conferenceId && 'READY_TO_RECORD' === this.podcast!.processingStatus);
    },
    isLiveReady(): boolean {
      return (
        undefined!==this.podcast!.conferenceId &&
        0 !== this.podcast!.conferenceId &&
        'READY' === this.podcast!.processingStatus
      );
    },
    isCounter(): boolean {
      return (
        this.isLiveReadyToRecord &&
        undefined!==this.fetchConference &&
        ('PLANNED' === this.fetchConference.status ||
          'PENDING' === this.fetchConference.status)
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
    titlePage(): string {
      if (this.isLiveReadyToRecord) return this.$t('Live episode').toString();
      return this.$t('Episode').toString();
    },
    timeRemaining(): string {
      return moment(this.podcast!.pubDate).diff(moment(), 'seconds');
    },
    podcastNotValid(): boolean {
      if (
        this.podcast &&
        this.podcast.availability &&
        false === this.podcast!.valid
      )
        return true;
      return false;
    },
  },
  methods: {
    updatePodcast(podcastUpdated: Podcast): void {
      this.podcast = podcastUpdated;
    },
    async getPodcastDetails(podcastId: number): Promise<void> {
      try {
        const data = await octopusApi.fetchPodcast(podcastId);
        this.podcast = data;
        this.$emit('podcastTitle', this.podcast!.title);
        if (
          this.podcast!.emission.annotations &&
          this.podcast!.emission.annotations.exclusive
        ) {
          this.exclusive =
            'true' === this.podcast!.emission.annotations.exclusive
              ? true
              : false;
          this.exclusive =
            this.exclusive &&
            this.organisationId !== this.podcast!.organisation.id;
        }
        if (
          this.podcast!.emission.annotations &&
          this.podcast!.emission.annotations.notExclusive
        ) {
          this.notExclusive =
            'true' === this.podcast!.emission.annotations.notExclusive
              ? true
              : false;
        }
        if (
          (!this.podcast!.availability.visibility ||
            ('READY_TO_RECORD' !== this.podcast!.processingStatus &&
              'READY' !== this.podcast!.processingStatus) ||
            false === this.podcast!.valid) &&
          !this.editRight
        ) {
          this.error = true;
        }
        this.loaded = true;
      } catch {
        this.error = true;
        this.loaded = true;
      }
    },
    getName(person: any): string {
      const first = person.firstName || '';
      const last = person.lastName || '';
      return (first + ' ' + last).trim();
    },
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
    receiveCommentEvent(event: any): void {
      (this.$refs.commentSection as any).receiveCommentEvent(event);
    },
  },
  watch: {
    updateStatus(): void {
      if (this.fetchConference && null !== this.fetchConference) {
        this.fetchConference.status = this.updateStatus;
      }
    },
    podcastId(): void {
      this.loaded = false;
      this.error = false;
      this.getPodcastDetails(this.podcastId);
    },
  },
};
</script>
