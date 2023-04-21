<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <div class="page-element-title-container">
        <div class="page-element-title">
          <h1>{{ titlePage }}</h1>
          <Countdown
            v-if="isCounter"
            :time-remaining="timeRemaining"
          />
        </div>
        <div class="page-element-bg" :style="backgroundDisplay"></div>
      </div>
      <div class="d-flex flex-column page-element">
        <PodcastModuleBox
          :playing-podcast="playingPodcast"
          :podcast="podcast"
          :fetch-conference="fetchConference"
          @updatePodcast="updatePodcast"
        />
        <SharePlayer
          v-if="pageParameters.isSharePlayer && (authenticated || notExclusive)"
          :podcast="podcast"
          :emission="podcast.emission"
          :exclusive="exclusive"
          :not-exclusive="notExclusive"
          :organisation-id="myOrganisationId"
          :is-education="isEducation"
        />
        <ShareButtons
          v-if="pageParameters.isShareButtons"
          :podcast="podcast"
        />
        <SubscribeButtons
          v-if="pageParameters.isShareButtons && countLink >= 1"
          :emission="podcast.emission"
        />
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
          :podcast-id="podcastId"
          :title="$t('Suggested listening')"
        />
        <PodcastInlineList
          v-for="c in categories"
          :key="c.id"
          :iab-id="c.id"
          :href="'/main/pub/category/' + c.id"
          :title="$t('More episodes of this category : ', { name: c.name })"
          :button-text="$t('All podcast button', { name: c.name })"
        />
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded?$t('Loading content ...'):undefined"
      :error-text="error?$t(`This episode is not available for (re)listening`):undefined"
    />
  </div>
</template>

<script lang="ts">
import { orgaComputed } from '../mixins/orgaComputed';
import PodcastInlineList from '../display/podcasts/PodcastInlineList.vue';
import PodcastModuleBox from '../display/podcasts/PodcastModuleBox.vue';
import ClassicLoading from '../form/ClassicLoading.vue';
import octopusApi from '@saooti/octopus-api';
import crudApi from '@/api/classicCrud';
import { state } from '../../stores/ParamSdkStore';
import dayjs from 'dayjs';
import { Podcast } from '@/stores/class/general/podcast';
import { Conference } from '@/stores/class/conference/conference';
import { handle403 } from '../mixins/handle403';
import { defineComponent, defineAsyncComponent } from 'vue';
import { CommentPodcast } from '@/stores/class/general/comment';
import { Category } from '@/stores/class/general/category';
import { useGeneralStore } from '@/stores/GeneralStore';
import { mapState } from 'pinia';
import { AxiosError } from 'axios';
const ShareButtons = defineAsyncComponent(() => import('../display/sharing/ShareButtons.vue'));
const SharePlayer = defineAsyncComponent(() => import('../display/sharing/SharePlayer.vue'));
const SubscribeButtons = defineAsyncComponent(() => import('../display/sharing/SubscribeButtons.vue'));
const Countdown = defineAsyncComponent(() => import('../display/live/CountDown.vue'));
const CommentSection = defineAsyncComponent(() => import('../display/comments/CommentSection.vue'));
export default defineComponent({
  name: "Podcast",
  components: {
    PodcastInlineList,
    ShareButtons,
    SharePlayer,
    SubscribeButtons,
    Countdown,
    CommentSection,
    PodcastModuleBox,
    ClassicLoading
  },

  mixins: [handle403, orgaComputed],

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
    ...mapState(useGeneralStore, ['storedCategories']),
    backgroundDisplay():string{
      if(!this.podcast){
        return "";
      }
      return `background-image: url('${this.podcast.imageUrl}');`;
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    pageParameters(){
      return {
        isShareButtons: (state.podcastPage.ShareButtons as boolean),
        isSharePlayer: (state.podcastPage.SharePlayer as boolean),
      };
    },
    emissionMainCategory(): number {
      if(!this.podcast){return 0;}
      if (this.podcast.emission.annotations?.mainIabId) {
        return parseInt((this.podcast.emission.annotations.mainIabId as string), 10);
      } else if (this.podcast.emission.iabIds?.length) {
        return this.podcast.emission.iabIds[0];
      }
      return 0;
    },
    categories(): Array<Category> {
      if ('undefined' === typeof this.podcast) return [];
      return this.storedCategories
        .filter((item: Category) => {
          return ( this.podcast?.emission.iabIds &&
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
      return (true ===this.authenticated &&this.myOrganisationId === this.podcast?.organisation.id) ||true===state.generalParameters.isAdmin;
    },
    countLink(): number {
      const platformShare = ['amazon','googlePodcasts','applePodcast', 'deezer', 'spotify', 'tunein',
       'radioline', 'podcastAddict', 'playerFm', 'stitcher', 'pocketCasts'];
      let count = 0;
      for (let i = 0, len = platformShare.length; i < len; i++) {
        if (undefined !== this.podcast?.emission?.annotations?.[platformShare[i]]) count++;
      }
      return count;
    },
    isLiveReadyToRecord(): boolean {
      return (undefined!==this.podcast?.conferenceId && 0 !== this.podcast?.conferenceId && 'READY_TO_RECORD' === this.podcast?.processingStatus);
    },
    isCounter(): boolean {
      return (
        this.isLiveReadyToRecord &&
        undefined!==this.fetchConference &&
        ('PLANNED' === this.fetchConference.status ||
          'PENDING' === this.fetchConference.status)
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
      return this.isLiveReadyToRecord ?this.$t('Live episode'): this.$t('Episode');
    },
    timeRemaining(): string {
      return !this.podcast ? "":dayjs(this.podcast.pubDate).diff(dayjs(), 'seconds').toString();
    },
  },
  watch: {
    updateStatus(): void {
      if (this.fetchConference && null !== this.fetchConference) {
        this.fetchConference.status = this.updateStatus;
      }
    },
    podcastId: {
      immediate: true,
      async handler() {
        await this.getPodcastDetails();
        this.initConference();
      },
    },
  },
  
  methods: {
    async initConference(){
      if (!this.podcast || !this.isLiveReadyToRecord) return;
      if (this.isOctopusAndAnimator && undefined!==this.podcast.conferenceId) {
        const data = await crudApi.fetchData<Conference>(9,'conference/'+this.podcast.conferenceId);
        this.fetchConference = data ? data : {conferenceId:-1, title:''};
      } else if(undefined!==this.podcast.conferenceId){
        const data = await octopusApi.fetchData<string>(9, 'conference/realstatus/'+this.podcast.conferenceId);
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
    updatePodcast(podcastUpdated: Podcast): void {
      this.podcast = podcastUpdated;
    },
    initError():void{
      this.error = true;
      this.loaded = true;
    },
    handleAnnotations(){
      if(!this.podcast){return;}
      if (this.podcast.emission.annotations?.exclusive) {
        this.exclusive ='true' === this.podcast.emission.annotations.exclusive;
        this.exclusive =
          this.exclusive &&
          this.myOrganisationId !== this.podcast.organisation.id;
      }
      if (this.podcast.emission.annotations?.notExclusive) {
        this.notExclusive ='true' === this.podcast.emission.annotations.notExclusive;
      }
    },
    async getPodcastDetails(): Promise<void> {
      this.loaded = false;
      this.error = false;
      try {
        const data : Podcast = await octopusApi.fetchData<Podcast>(0, 'podcast/'+this.podcastId); 
        if("PUBLIC"!==data.organisation.privacy && this.filterOrgaId!==data.organisation.id){
          this.initError();
          return;
        }
        this.podcast = data;
        this.$emit('podcastTitle', this.podcast.title);
        this.handleAnnotations();
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

    receiveCommentEvent(event:{type: string; comment: CommentPodcast; oldStatus?:string } ): void {
      (this.$refs.commentSection as InstanceType<typeof CommentSection>).receiveCommentEvent(event);
    },
  },
})
</script>