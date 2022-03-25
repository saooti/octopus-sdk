<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <div class="page-podcast-title">
        <h1 v-if="!isOuestFrance">
          {{ titlePage }}
        </h1>
        <Countdown
          v-if="isCounter"
          :time-remaining="timeRemaining"
        />
      </div>
      <div class="d-flex page-podcast">
        <div class="d-flex flex-column flex-super-grow">
          <RecordingItemButton
            v-if="
              !!fetchConference &&
                isLiveReadyToRecord &&
                !isNotRecorded &&
                isOctopusAndAnimator
            "
            class="module-box text-center-mobile flex-grow-0"
            :podcast="podcast"
            :live="true"
            :recording="fetchConference"
            @deleteItem="removeDeleted"
            @validatePodcast="updatePodcast"
          />
          <EditBox
            v-else-if="editRight && isEditBox"
            :podcast="podcast"
            :is-ready="true"
            @validatePodcast="updatePodcast"
          />
          <PodcastModuleBox
            :playing-podcast="playingPodcast"
            :podcast="podcast"
            :fetch-conference="fetchConference"
          />
          <SubscribeButtons
            v-if="isShareButtons && countLink >= 1"
            :emission="podcast.emission"
          />
        </div>
        <div
          class="d-flex flex-column flex-grow-mobile"
          :class="authenticated || notExclusive ? 'flex-grow-1' : ''"
        >
          <SharePlayer
            v-if="isSharePlayer && (authenticated || notExclusive)"
            :podcast="podcast"
            :emission="podcast.emission"
            :exclusive="exclusive"
            :not-exclusive="notExclusive"
            :organisation-id="organisationId"
            :is-education="isEducation"
          />
          <ShareButtons
            v-if="isShareButtons"
            :podcast="podcast"
            :not-exclusive="notExclusive"
          />
        </div>
      </div>
      <template v-if="!isOuestFrance">
        <CommentSection
          v-if="!isPodcastmaker"
          ref="commentSection"
          :podcast="podcast"
          :fetch-conference="fetchConference"
        />
        <PodcastInlineList
          class="mt-4"
          :emission-id="podcast.emission.emissionId"
          :href="'/main/pub/emission/' + podcast.emission.emissionId"
          :title="$t('More episodes of this emission')"
          :button-text="$t('All podcast emission button')"
        />
        <PodcastInlineList
          v-for="c in categories"
          :key="c.id"
          :iab-id="c.id"
          :href="'/main/pub/category/' + c.id"
          :title="$t('More episodes of this category : ', { name: c.name })"
          :button-text="$t('All podcast button', { name: c.name })"
        />
      </template>
    </template>
    <ClassicLoading
      :loading-text="!loaded?$t('Loading content ...'):undefined"
      :error-text="error?$t(`Podcast doesn't exist`):undefined"
    />
  </div>
</template>

<script lang="ts">
import PodcastInlineList from '../display/podcasts/PodcastInlineList.vue';
import PodcastModuleBox from '../display/podcasts/PodcastModuleBox.vue';
import ClassicLoading from '../form/ClassicLoading.vue';
import octopusApi from '@saooti/octopus-api';
import studioApi from '@/api/studio';
import { state } from '../../store/paramStore';
import moment from 'moment';
import { Podcast } from '@/store/class/general/podcast';
import { Conference } from '@/store/class/conference/conference';
import { handle403 } from '../mixins/handle403';
import { defineComponent, defineAsyncComponent } from 'vue';
import CommentSectionVue from '../display/comments/CommentSection.vue';
import { CommentPodcast } from '@/store/class/general/comment';
import { Category } from '@/store/class/general/category';
import { AxiosError } from 'axios';
const ShareButtons = defineAsyncComponent(() => import('../display/sharing/ShareButtons.vue'));
const SharePlayer = defineAsyncComponent(() => import('../display/sharing/SharePlayer.vue'));
const EditBox = defineAsyncComponent(() => import('@/components/display/edit/EditBox.vue'));
const SubscribeButtons = defineAsyncComponent(() => import('../display/sharing/SubscribeButtons.vue'));
const RecordingItemButton = defineAsyncComponent(() => import('@/components/display/studio/RecordingItemButton.vue'));
const Countdown = defineAsyncComponent(() => import('../display/live/CountDown.vue'));
const CommentSection = defineAsyncComponent(() => import('../display/comments/CommentSection.vue'));
export default defineComponent({
  name: "Podcast",
  components: {
    PodcastInlineList,
    ShareButtons,
    SharePlayer,
    EditBox,
    SubscribeButtons,
    RecordingItemButton,
    Countdown,
    CommentSection,
    PodcastModuleBox,
    ClassicLoading
  },

  mixins: [handle403],

  props: {
    updateStatus: { default: undefined, type: String},
    playingPodcast: { default: undefined, type: Object as ()=> Podcast},
    podcastId: { default: 0, type: Number},
    isEducation: { default: false, type: Boolean},
  },

  emits: ['initConferenceId', 'podcastTitle'],

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

  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    isEditBox(): boolean {
      return (state.podcastPage.EditBox as boolean);
    },
    isShareButtons(): boolean {
      return (state.podcastPage.ShareButtons as boolean);
    },
    isSharePlayer(): boolean {
      return (state.podcastPage.SharePlayer as boolean);
    },
    allCategories(): Array<Category> {
      return this.$store.state.categories;
    },
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
    isOuestFrance(): boolean {
      return (state.podcastPage.ouestFranceStyle as boolean);
    },
    emissionMainCategory(): number {
      if(!this.podcast){return 0;}
      if (
        this.podcast.emission.annotations &&
        this.podcast.emission.annotations.mainIabId
      ) {
        return parseInt((this.podcast.emission.annotations.mainIabId as string), 10);
      } else if (
        this.podcast.emission.iabIds &&
        this.podcast.emission.iabIds.length
      ) {
        return this.podcast.emission.iabIds[0];
      }
      return 0;
    },
    categories(): Array<Category> {
      if ('undefined' === typeof this.podcast) return [];
      return this.allCategories
        .filter((item: Category) => {
          return ( this.podcast &&
            this.podcast.emission.iabIds &&
            -1 !== this.podcast.emission.iabIds.indexOf(item.id)
          );
        })
        .sort((a: Category, b: Category) => {
          if (a.id === this.emissionMainCategory) return -1;
          if (b.id === this.emissionMainCategory) return 1;
          return 0;
        });
    },
    editRight(): boolean {
      if ( this.podcast &&
        (this.authenticated &&
          this.organisationId === this.podcast.organisation.id) ||
        state.generalParameters.isAdmin
      ){
        return true;
      }
      return false;
    },
    countLink(): number {
      let count = 0;
      if (this.podcast && this.podcast.emission && this.podcast.emission.annotations) {
        if (undefined !== this.podcast.emission.annotations.amazon) count++;
        if (undefined !== this.podcast.emission.annotations.googlePodcasts) count++;
        if (undefined !== this.podcast.emission.annotations.applePodcast)
          count++;
        if (undefined !== this.podcast.emission.annotations.deezer) count++;
        if (undefined !== this.podcast.emission.annotations.spotify) count++;
        if (undefined !== this.podcast.emission.annotations.tunein) count++;
        if (undefined !== this.podcast.emission.annotations.radioline) count++;
        if (undefined !== this.podcast.emission.annotations.podcastAddict) count++;
        if (undefined !== this.podcast.emission.annotations.playerFm) count++;
        if (undefined !== this.podcast.emission.annotations.stitcher) count++;
        if (undefined !== this.podcast.emission.annotations.pocketCasts) count++;
      }
      return count;
    },
    isLiveReadyToRecord(): boolean {
      return (undefined!==this.podcast && undefined!==this.podcast.conferenceId && 0 !== this.podcast.conferenceId && 'READY_TO_RECORD' === this.podcast.processingStatus);
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
        (state.generalParameters.isRoleLive as boolean)
      );
    },
    titlePage(): string {
      if (this.isLiveReadyToRecord) return this.$t('Live episode').toString();
      return this.$t('Episode').toString();
    },
    timeRemaining(): string {
      if(!this.podcast){return "";}
      return moment(this.podcast.pubDate).diff(moment(), 'seconds').toString();
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
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
  
  async mounted() {
    await this.getPodcastDetails(this.podcastId);
    if (!this.podcast) return;
    if (!this.isLiveReadyToRecord) return;
    if (this.isOctopusAndAnimator && undefined!==this.podcast.conferenceId) {
      const data = await studioApi.getConference(this.$store.state,this.podcast.conferenceId.toString());
      if (data) {
        this.fetchConference = data;
      } else {
        this.fetchConference = {conferenceId:-1, title:''};
      }
    } else if(undefined!==this.podcast.conferenceId){
      const data = await octopusApi.getRealConferenceStatus(this.podcast.conferenceId.toString());
      this.fetchConference = {
        status: data,
        conferenceId: this.podcast.conferenceId,
        title:'',
      };
    }
    if (
      this.fetchConference && 
      -1 !== this.fetchConference.conferenceId &&
      'PUBLISHING' !== this.fetchConference.status &&
      'DEBRIEFING' !== this.fetchConference.status
    ) {
      this.$emit('initConferenceId', this.podcast.conferenceId);
    }
  },
  
  
  methods: {
    updatePodcast(podcastUpdated: Podcast): void {
      this.podcast = podcastUpdated;
    },
    initError():void{
      this.error = true;
      this.loaded = true;
    },
    async getPodcastDetails(podcastId: number): Promise<void> {
      try {
        const data : Podcast = await octopusApi.fetchPodcast(podcastId.toString());
        if("PUBLIC"!==data.organisation.privacy && this.filterOrga!==data.organisation.id){
          this.initError();
          return;
        }
        this.podcast = data;
        this.$emit('podcastTitle', this.podcast.title);
        if (
          this.podcast.emission.annotations &&
          this.podcast.emission.annotations.exclusive
        ) {
          this.exclusive =
            'true' === this.podcast.emission.annotations.exclusive
              ? true
              : false;
          this.exclusive =
            this.exclusive &&
            this.organisationId !== this.podcast.organisation.id;
        }
        if (
          this.podcast.emission.annotations &&
          this.podcast.emission.annotations.notExclusive
        ) {
          this.notExclusive =
            'true' === this.podcast.emission.annotations.notExclusive
              ? true
              : false;
        }
        if (
          (!this.podcast.availability.visibility ||
            ('READY_TO_RECORD' !== this.podcast.processingStatus &&
              'READY' !== this.podcast.processingStatus) ||
            false === this.podcast.valid) &&
          !this.editRight
        ) {
          this.error = true;
        }
        this.loaded = true;
      } catch(error) {
        this.handle403((error as AxiosError));
        this.initError();
      }
    },
    removeDeleted(): void {
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push('/');
      }
    },
    receiveCommentEvent(event:{type?: string; comment: CommentPodcast; status?: string; oldStatus?:string } ): void {
      (this.$refs.commentSection as InstanceType<typeof CommentSectionVue>).receiveCommentEvent(event);
    },
  },
})
</script>