<template>
  <div
    class="img-box d-flex flex-column justify-content-start align-items-start position-relative justify rounded-lg flex-shrink float-left"
    :style="{ 'background-image': 'url(\'' + podcast.imageUrl +  '\')' }"
    v-if="podcast"
  >
  <div class="live-image-status" :class="fetchConference && fetchConference!=='null' ? fetchConference.status.toLowerCase()+'-bg' : ''" v-if="fetchConference">{{statusText}}</div>
  <div class="live-image-status recording-bg" v-if="isRecordedInLive">{{"Enregistré en live"}}</div>
  <template v-if="podcast && (podcast.availability.visibility  && (podcast.processingStatus === 'READY_TO_RECORD' || podcast.processingStatus === 'READY'))&& !isLiveToBeRecorded">
    <div class="podcast-image-play-button" v-on:click="play" v-if="hidePlay || recordingLive">
      <div class="icon-container">
        <div
          :aria-label="$t('Play')"
          class="saooti-play2-bounty primary-color"
          v-show="!playingPodcast"
        ></div>
        <div class="bloc-paddle" v-show="playingPodcast">
          <span class="paddle1 primary-color"></span>
          <span class="paddle2 primary-color"></span>
          <span class="paddle3 primary-color"></span>
        </div>
      </div>
    </div>
    <div class="background-icon saooti-arrow-up2" :aria-label="$t('Show description')"
    v-if="!isDescription && displayDescription && isMobile" @click="showDescription"></div>
    <div class="background-icon saooti-arrow-down2" :aria-label="$t('Hide description')"
    v-if="isDescription && displayDescription && isMobile" @click="showDescription"></div>
  </template>
  <template v-else>
    <div class="d-flex flex-column w-100 h-100 justify-content-center align-items-center transparent-background"
    :class="podcast.processingStatus === 'READY' ? 'c-hand':''" @click="play"
    >
      <img
        :src="imgUrl"
        class="no-visible-img"
        v-if="imgUrl"
      />
      <div class="no-visible-img d-flex justify-content-center align-items-center" v-else><div class="spinner-border"></div></div>
      <div class="small-Text mt-2 font-weight-bold">{{textVisible}}</div>
    </div>
  </template>
  </div>
</template>

<style lang="scss">
.no-visible-img{
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  padding: 0.7em;
  background: rgba(0,0,0,.31);
}
.transparent-background{
  background-color: rgba(255,255,255, .5);
}
.podcast-image-play-button {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;

  .icon-container {
    background: #00000050;
    border-radius: 50%;
    height: 3rem;
    width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #00000030;;
    }

    > .saooti-play2-bounty {
      font-size: 2em;
      position: relative;
      right: -0.2rem;
    }
    z-index: 2;
  }
}
.bloc-paddle {
  align-items: flex-end;
  display: flex;
  width: 2rem;
  height: 2.6rem;
  padding: 0.7rem;
  justify-content: space-around;
  align-content: flex-start;
  border-radius: 50%;
  background: transparent !important;

  > span {
    width: 0.1rem;
    background: #fff;
  }

  .paddle1 {
    animation-duration: 0.6s;
    animation-name: slidein;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .paddle2 {
    animation-duration: 0.3s;
    animation-name: slidein2;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .paddle3 {
    animation-duration: 0.5s;
    animation-name: slidein3;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
    @keyframes slidein {
    0% {
      height: 0;
    }
    100% {
      height: 1rem;
    }
  }

  @keyframes slidein2 {
    0% {
      height: 0.3rem;
    }
    100% {
      height: 1.2rem;
    }
  }

  @keyframes slidein3 {
    0% {
      height: 1.2rem;
    }
    100% {
      height: 0;
    }
  }
}
</style>

<script>
import { mapState } from 'vuex';
export default {
  name: 'PodcastImage',

  props: ['podcast', 'hidePlay', 'displayDescription', 'arrowDirection', "fetchConference", "isAnimatorLive"],
  computed: {
    ...mapState({
      playingPodcast(state) {
        return (
          (state.player.podcast &&
          state.player.podcast.podcastId == this.podcast.podcastId) || 
          (this.fetchConference && this.fetchConference!=='null' && state.player.live && state.player.live.conferenceId === this.fetchConference.conferenceId)
        );
      },
    }),

    isMobile(){
      return window.matchMedia( "(hover: none)" ).matches;
    },

    isRecordedInLive(){
      return this.fetchConference === undefined && this.podcast.conferenceId !== undefined && this.podcast.processingStatus !== "READY_TO_RECORD";
    },

    isLiveToBeRecorded(){
      return this.fetchConference === undefined && this.podcast.conferenceId !== undefined && this.podcast.processingStatus === "READY_TO_RECORD";
    },

    imgUrl(){
      if(this.isLiveToBeRecorded)
        return "/img/clock.png";
      if(this.podcast.processingStatus === "READY" || this.fetchConference){
        if(!this.podcast.availability.visibility && this.podcast.availability.date)
          return "/img/clock.png";
        return "/img/novisible.png";
      }
      if(this.podcast.processingStatus === "PLANNED" || this.podcast.processingStatus === "PROCESSING")
        return '/img/hourglass.png';
      if(this.podcast.processingStatus === "CANCELED")
        return '/img/cancelled.png';
      return '/img/caution.png';
    },

    textVisible(){
      if(this.isLiveToBeRecorded)
        return this.$t("Podcast linked to waiting live");
      if(this.podcast.processingStatus === "READY" || this.fetchConference){
        if(!this.podcast.availability.visibility && this.podcast.availability.date)
          return this.$t('Podcast publish in future');
        return this.$t('Podcast no visible');
      }
      if(this.podcast.processingStatus === "PLANNED" || this.podcast.processingStatus === "PROCESSING")
        return this.$t('Podcast in process');
      if(this.podcast.processingStatus === "CANCELED")
        return this.$t('Podcast in cancelled status');
      return this.$t('Podcast in error');
    },

    statusText(){
      if(!this.fetchConference)
        return "";
      switch (this.fetchConference.status) {
        case "PLANNED": return this.$t('live in few time');
        case "PENDING":
          if(this.isAnimatorLive)
            return this.$t("Open studio");
          return this.$t('live upcoming');
        case "RECORDING":return this.$t("In live");
        case "DEBRIEFING":
          if(!this.isAnimatorLive)
            return "";
          if(this.podcast.processingStatus === "READY_TO_RECORD")
            return this.$t("Not recording");
          return this.$t("Debriefing");
        case "ERROR":return this.$t("In error");
        case "PUBLISHING": return this.$t("Publishing");
        default:return "";
      }
    },

    recordingLive(){
      return this.fetchConference &&
             this.fetchConference!=='null' &&
             (this.fetchConference.status === 'RECORDING' || this.fetchConference.status === 'PENDING');
    }
  },

  data() {
    return {
      isDescription : false,
    };
  },

  methods: {
    play() {
      if(!this.recordingLive){
        this.$store.commit('playerPlayPodcast', this.podcast);
        return;
      }
      this.$store.commit('playerPlayPodcast', {
        title: this.podcast.title,
        audioUrl:this.podcast.audioUrl,
        duration : this.podcast.duration,
        conferenceId: this.fetchConference.conferenceId,
        livePodcastId: this.podcast.podcastId,
        organisation: this.podcast.organisation.id,
      });
    },
    showDescription(){
      if(this.isDescription){
        this.$emit('hideDescription');
      }else {
         this.$emit('showDescription');
      }
      this.isDescription = !this.isDescription;
    }
  },

  watch:{
    arrowDirection(newValue){
      if(newValue === 'up'){
        this.isDescription = true;
        this.showDescription();
      }else{
        this.isDescription = false;
        this.showDescription();
      }
    }
  }
};
</script>
