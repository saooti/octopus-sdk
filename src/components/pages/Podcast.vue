<template>
  <div>
    <div class="page-box" v-if="loaded && !error">
      <h1 v-if="!isOuestFrance">{{ titlePage }}</h1>
      <Countdown :timeRemaining="timeRemaining" v-if="isCounter"/>
      <div class="d-flex">
        <div class="d-flex flex-column flex-super-grow">
          <RecordingItemButton 
          class="module-box text-center-mobile flex-no-grow" 
          :podcast="podcast" :live="true" 
          :recording="fetchConference" 
          @deleteItem="removeDeleted"
          v-if="!!fetchConference && isLiveReadyToRecord && !isNotRecorded && isOctopusAndAnimator"
          ></RecordingItemButton>
          <EditBox :podcast="podcast" v-else-if="editRight && isEditBox" :isReady='isReady'></EditBox>
          <div class="module-box">
            <h2 class="text-uppercase font-weight-bold title-page-podcast" v-if="!isOuestFrance">{{ this.podcast.title }}</h2>
            <router-link 
            :to="{ name: 'emission', params: {emissionId:podcast.emission.emissionId}, query:{productor: $store.state.filter.organisationId}}"
            v-else>
              <h1>{{ this.podcast.emission.name }}</h1>
            </router-link>
            <div class="mb-5 mt-3 d-flex">
              <div class="w-100">
              <PodcastImage
                :class="[!isOuestFrance && !isLiveReadyToRecord ? 'shadow-element':'',isLiveReadyToRecord && fetchConference && fetchConference != 'null' && fetchConference.status ? fetchConference.status.toLowerCase()+'-shadow' : '']"
                class="mr-3" 
                v-bind:podcast="podcast" 
                :hidePlay='!isLiveReadyToRecord'
                :playingPodcast='playingPodcast' 
                @playPodcast='playPodcast'
                :fetchConference="fetchConference"
                :isAnimatorLive="isOctopusAndAnimator"/>
                <h3 v-if="isOuestFrance">{{ this.podcast.title }}</h3>
                <div class="date-text-zone" :class="isLiveReady?'justify-content-between':''">
                  <div :class="!isLiveReady?'mr-5':''" v-if="!isOuestFrance && date.length !==0">{{ date }}</div>
                  <div class="ml-2 mr-2"><span class="saooti-clock3" v-if="isOuestFrance"></span>{{ $t('Duration', { duration: duration }) }}</div>
                  <div class="text-danger" v-if="isLiveReady">{{$t('Episode record in live')}}</div>
                </div>
                <div class="descriptionText" v-html="urlify(this.podcast.description)"></div>
                <div class="mt-3 mb-3">
                  <div class="comma" v-if="podcast.animators">{{ $t('Animated by : ') }}
                    <router-link
                      :aria-label="$t('Participant')"
                      class="link-info"
                      v-for="animator in podcast.animators"
                      v-bind:key="animator.participantId"
                      :to="{ name: 'participant', params: {participantId: animator.participantId}, query:{productor: $store.state.filter.organisationId}}"
                    >{{ getName(animator) }}</router-link>
                  </div>
                  <div v-if="!isOuestFrance">{{ $t('Emission') + ' : ' }}
                    <router-link
                      class="link-info"
                      :to="{ name: 'emission', params: {emissionId:podcast.emission.emissionId}, query:{productor: $store.state.filter.organisationId}}"
                    >{{ this.podcast.emission.name }}</router-link>
                  </div>
                  <div v-if="!isPodcastmaker">{{ $t('Producted by : ') }}
                    <router-link
                      class="link-info"
                      :to="{ name: 'productor', params: {productorId:podcast.organisation.id}, query:{productor: $store.state.filter.organisationId}}"
                    >{{ this.podcast.organisation.name }}</router-link>
                  </div>
                  <div class="comma" v-if="podcast.guests">{{ $t('Guests') + ' : ' }}
                    <router-link
                      class="link-info"
                      v-for="guest in podcast.guests"
                      v-bind:key="guest.participantId"
                      :to="{ name: 'participant', params: {participantId:guest.participantId}, query:{productor: $store.state.filter.organisationId}}"
                    >{{ getName(guest) }}</router-link>
                  </div>
                  <div v-if="editRight && !isPodcastmaker">
                    <div
                      class="mr-5"
                      v-if="podcast.annotations && podcast.annotations.RSS"
                    >{{ $t('From RSS') }}</div>
                    <div class="alert-text" v-if="!podcast.availability.visibility">
                      <img src="/img/caution.png" class="icon-caution"/>
                      {{ $t('Podcast is not visible for listeners') }}
                    </div>
                    <div class="alert-text" v-if="podcast.processingStatus === 'ERROR'">
                      <img src="/img/caution.png" class="icon-caution"/>
                      {{ $t('Podcast in ERROR, please contact Saooti') }}
                    </div>
                  </div>
                  <ShareButtons :podcast="podcast" :bigRound='true' :audioUrl="podcast.audioUrl" v-if="isDownloadButton"></ShareButtons>
                </div>
              </div>
            </div>
            <TagList v-if="isTagList" :tagList='podcast.tags'/>
          </div>
          <SubscribeButtons :emission="podcast.emission" v-if="isShareButtons && countLink >= 1"/>
        </div>
        <div class="d-flex flex-column share-container" :class="authenticated || notExclusive ?'flex-grow':''">
          <SharePlayer
            :podcast="podcast"
            :emission="podcast.emission"
            :exclusive="exclusive"
            :notExclusive="notExclusive"
            :organisationId='organisationId'
            :isEducation="isEducation"
            v-if="isSharePlayer && (authenticated || notExclusive)"
          ></SharePlayer>
          <ShareButtons :podcast="podcast" :notExclusive="notExclusive" v-if="isShareButtons"></ShareButtons>
        </div>
      </div>
      <template v-if="!isOuestFrance">
        <CommentSection :podcast='podcast' v-if="!isPodcastmaker" :fetchConference="fetchConference" ref="commentSection"/>
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

.date-text-zone{
  display: flex;
  flex-wrap: wrap;
  margin-bottom:1rem;
  @media (max-width: 600px) {
    display: initial;
  }
}
.share-container{
   @media (max-width: 960px) {
     flex-grow: 1;
   }
}
</style>
<script>
// @ is an alias to /src
import RecordingItemButton from "@/components/display/studio/RecordingItemButton.vue";
import EditBox from "@/components/display/edit/EditBox.vue";
import SharePlayer from "../display/sharing/SharePlayer.vue";
import ShareButtons from "../display/sharing/ShareButtons.vue";
import PodcastInlineList from "../display/podcasts/PodcastInlineList.vue";
import PodcastImage from "../display/podcasts/PodcastImage.vue";
import CommentSection from "../display/comments/CommentSection.vue";
import TagList from "../display/podcasts/TagList.vue";
import SubscribeButtons from "../display/sharing/SubscribeButtons.vue";
import Countdown from '../display/live/CountDown.vue';
import octopusApi from "@saooti/octopus-api";
import studioApi from '@/api/studio';
import {state} from "../../store/paramStore.js";
const moment = require("moment");
const humanizeDuration = require("humanize-duration");

export default {
  components: {
    PodcastInlineList,
    PodcastImage,
    ShareButtons,
    SharePlayer,
    EditBox,
    TagList,
    SubscribeButtons,
    RecordingItemButton,
    Countdown,
    CommentSection
  },

  async mounted() {
    await this.getPodcastDetails(this.podcastId);
    if(!this.isLiveReadyToRecord)
      return;
    if(this.isOctopusAndAnimator){
      let data = await studioApi.getConference(this.$store, this.podcast.conferenceId);
      if(data.data !== ""){
        this.fetchConference = data.data;
      }else{
        this.fetchConference = "null";
      }
    }else{
      let data = await studioApi.getRealConferenceStatus(this.$store, this.podcast.conferenceId);
      this.fetchConference = {status : data.data, conferenceId: this.podcast.conferenceId};
    }
    if(this.fetchConference !== "null" && this.fetchConference.status !=="PUBLISHING" && this.fetchConference.status !=="DEBRIEFING"){
      this.$emit('initConferenceId',this.podcast.conferenceId);
    }
  },

  props: ["podcastId", "playingPodcast", "updateStatus", "isEducation"],

  data() {
    return {
      loaded: false,
      podcast: undefined,
      error: false,
      exclusive: false,
      notExclusive: false,
      fetchConference: undefined,
    };
  },

  computed: {
    isPodcastmaker(){
      return state.generalParameters.podcastmaker;
    },
    isEditBox(){
      return state.podcastPage.EditBox;
    },
    isShareButtons(){
      return state.podcastPage.ShareButtons;
    },
    isSharePlayer(){
      return state.podcastPage.SharePlayer;
    },
    allCategories(){
      return state.generalParameters.allCategories;
    },
    organisationId(){
      return state.generalParameters.organisationId;
    },
    authenticated(){
      return state.generalParameters.authenticated;
    },
    isOuestFrance(){
      return state.podcastPage.ouestFranceStyle;
    },
    isTagList(){
      return state.podcastPage.tagList;
    },
    isDownloadButton(){
      return state.podcastPage.downloadButton;
    },
    emissionMainCategory() {
      if (
        this.podcast.emission.annotations &&
        this.podcast.emission.annotations.mainIabId
      ) {
        return parseInt(this.podcast.emission.annotations.mainIabId, 10);
      } else if (
        this.podcast.emission.iabIds &&
        this.podcast.emission.iabIds.length
      ) {
        return this.podcast.emission.iabIds[0];
      }
      return 0;
    },

    categories() {
      if (typeof this.podcast === "undefined")
        return "";
      return this.allCategories
        .filter(item => {
          return  this.podcast.emission.iabIds && this.podcast.emission.iabIds.indexOf(item.id) !== -1;
        })
        .sort((a, b) => {
          if (a.id === this.emissionMainCategory) return -1;
          if (b.id === this.emissionMainCategory) return 1;
          return 0;
        });
    },

    date() {
      if(moment(this.podcast.pubDate).year() !== 1970)
        return moment(this.podcast.pubDate).format("D MMMM YYYY [à] HH[h]mm");
      return ""
    },

    duration() {
      if(this.podcast.duration <= 1)
        return '';
      if(this.podcast.duration > 600000){
        return humanizeDuration(this.podcast.duration, {
          language: 'fr',
          largest: 1,
          round: true,
        });
      }
      return humanizeDuration(this.podcast.duration, {
        language: 'fr',
        largest: 2,
        round: true,
      });
    },

    editRight() {
      if ((this.authenticated && this.organisationId === this.podcast.organisation.id) || state.generalParameters.isAdmin)
        return true;
      return false;
    },
    isReady(){
      /* if(this.podcast && this.podcast.processingStatus !== "PLANNED" && this.podcast.processingStatus !== "PROCESSING"){
        return true;
      }else{
        return false;
      } */
      return true;
    },
    countLink(){
      let count = 0;
      if(this.podcast.emission && this.podcast.emission.annotations){
        if (this.podcast.emission.annotations.applePodcast !== undefined) count++;
        if (this.podcast.emission.annotations.deezer !== undefined) count++;
        if (this.podcast.emission.annotations.spotify !== undefined) count++;
        if (this.podcast.emission.annotations.tunein !== undefined) count++;
        if (this.podcast.emission.annotations.tootak !== undefined) count++;
        if (this.podcast.emission.annotations.radioline !== undefined) count++;
      }
      return count;
    },
    isLiveReadyToRecord(){
      return this.podcast.conferenceId && this.podcast.conferenceId !== 0 && this.podcast.processingStatus === 'READY_TO_RECORD';
    },
    isLiveReady(){
      return this.podcast.conferenceId && this.podcast.conferenceId !== 0 && this.podcast.processingStatus === 'READY';
    },
    isCounter(){
      return this.isLiveReadyToRecord && this.fetchConference && (this.fetchConference.status === 'PLANNED' ||this.fetchConference.status === 'PENDING');
    },
    isNotRecorded(){
      return this.isLiveReadyToRecord && this.fetchConference && this.fetchConference.status === 'DEBRIEFING';
    },
    isOctopusAndAnimator(){
      return !this.isPodcastmaker && this.editRight && state.generalParameters.isRoleLive;
    },
    titlePage(){
      if(this.isLiveReadyToRecord)
        return this.$t('Live episode');
      return this.$t('Episode');
    },
    timeRemaining(){
      return moment(this.podcast.pubDate).diff(moment(), 'seconds');
    }
    
  },

  methods: {
    async getPodcastDetails(podcastId) {
      try {
        let data = await octopusApi.fetchPodcast(podcastId);
        this.podcast = data;
        this.$emit('podcastTitle', this.podcast.title);
        if (
          this.podcast.emission.annotations &&
          this.podcast.emission.annotations.exclusive
        ) {
          this.exclusive =
            this.podcast.emission.annotations.exclusive == "true"
              ? true
              : false;
          this.exclusive =
            this.exclusive &&
            this.organisationId !== this.podcast.organisation.id;
        }
        if (this.podcast.emission.annotations && this.podcast.emission.annotations.notExclusive) {
          this.notExclusive = this.podcast.emission.annotations.notExclusive == "true" ? true : false;
        }
        if(!this.podcast.availability.visibility && !this.editRight && this.podcast.processingStatus !== "READY_TO_RECORD"){
          this.error= true;
        }
        this.loaded = true;
      } catch {
        this.error = true;
        this.loaded = true;
      }
    },
    getName(person) {
      const first = person.firstName || "";
      const last = person.lastName || "";
      return (first + " " + last).trim();
    },
    playPodcast(podcast){
      this.$emit('playPodcast', podcast);
    },

    urlify(text) {
      let urlRegex = /(https?:\/\/[^\s]+)/g;
      if(!text)
        return '';
      return text.replace(urlRegex, (url) =>{
        return '<a href="' + url + '">' + url + '</a>';
      });
    },
    removeDeleted() {
      if(window.history.length > 1){
        this.$router.go(-1);
      } else{
        this.$router.push('/');
      }
    },
    receiveCommentEvent(event){
      this.$refs.commentSection.receiveCommentEvent(event);
    }
  }, 
  watch:{
    updateStatus(){
      if(this.fetchConference && this.fetchConference !== null){
        this.fetchConference.status = this.updateStatus;
      }
    },
    podcastId(val) {
      this.loaded = false;
      this.error = false;
      this.getPodcastDetails(val);
    }
  }
};
</script>
