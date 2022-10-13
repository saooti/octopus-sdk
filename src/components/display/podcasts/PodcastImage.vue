<template>
  <div
    v-if="podcast"
    class="img-box d-flex flex-column justify-content-start align-items-start position-relative justify rounded-lg flex-shrink-0 float-start"
  >
    <img
      v-lazy="proxyImageUrl(podcast.imageUrl,'260')"
      class="img-box"
      :alt="$t('Episode name image', {name:podcast.title})"
    >
    <div
      v-if="isPodcastmaker"
      :class="mainRubrique? 'mainRubrique' : 'notMainRubrique'"
    />
    <div
      v-if="fetchConference"
      class="live-image-status"
      :class="
        fetchConference && 'null' !== fetchConference && fetchConference.status
          ? fetchConference.status.toLowerCase() + '-bg'
          : ''
      "
    >
      {{ statusText }}
    </div>
    <div
      v-if="isRecordedInLive"
      class="live-image-status recording-bg"
    >
      {{ $t('Recorded in live') }}
    </div>
    <button
      v-if="hidePlay || recordingLive"
      class="podcast-image-play-button"
      :class="classicPodcastPlay ? '' : 'transparent-background'"
      @click="play"
    >
      <div
        v-if="!isLiveToBeRecorded"
        class="icon-container"
      >
        <div
          v-show="!playingPodcast"
          :title="$t('Play')"
          class="saooti-play primary-color"
        />
        <div
          v-if="!classicPodcastPlay"
          class="special-icon-play-button"
          :class="iconName"
        />
        <div
          v-show="playingPodcast"
          class="bloc-paddle"
        >
          <span class="paddle1" />
          <span class="paddle2" />
          <span class="paddle3" />
        </div>
      </div>
      <div
        v-else
        class="icon-container error-icon"
      >
        <div
          :title="textVisible"
          class="big-icon-error"
          :class="iconName"
        />
      </div>
      <div
        v-if="!classicPodcastPlay"
        class="small-text mt-3 fw-bolder"
      >
        {{ textVisible }}
      </div>
    </button>
    <div
      v-if="displayDescription && isMobile"
      class="background-icon primary-bg saooti-arrow-up"
      :class="isDescription ? 'saooti-arrow-down':'saooti-arrow-up'"
      :title="isDescription ? $t('Hide description'):$t('Show description')"
      @click="showDescription"
    />
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { state } from '../../../store/paramStore';
import {StoreState} from '@/store/typeAppStore';
import { Podcast } from '@/store/class/general/podcast';
import { Conference } from '@/store/class/conference/conference';
import { imageProxy } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PodcastImage',
  mixins:[imageProxy],
  props: {
    podcast: { default: ()=>({}), type: Object as ()=>Podcast},
    hidePlay: { default: false, type: Boolean},
    displayDescription: { default: false, type: Boolean},
    arrowDirection: { default: 'up', type: String},
    isAnimatorLive: { default: false, type: Boolean},
    fetchConference: { default: undefined, type: Object as ()=>Conference},
  },
  emits: ['hideDescription', 'showDescription'],
  data() {
    return {
      isDescription: false as boolean,
    };
  },
  computed: {
    ...mapState({
      playingPodcast(state: StoreState) {
        return (
          (state.player.podcast &&
            state.player.podcast.podcastId === this.podcast.podcastId) ||
          (this.fetchConference &&
            'null' !== this.fetchConference &&
            state.player.live &&
            state.player.live.conferenceId ===
              this.fetchConference.conferenceId)
        );
      },
    }),
    mainRubrique(): boolean{
      return undefined!==state.podcastPage.mainRubrique && 0!==state.podcastPage.mainRubrique && (this.podcast?.rubriqueIds?.includes(state.podcastPage.mainRubrique) as boolean);
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    isMobile(): boolean {
      return window.matchMedia('(hover: none)').matches;
    },
    isRecordedInLive(): boolean {
      return (
        undefined === this.fetchConference &&
        undefined !== this.podcast.conferenceId &&
        'READY_TO_RECORD' !== this.podcast.processingStatus
      );
    },
    isLiveToBeRecorded(): boolean {
      return (
        undefined === this.fetchConference &&
        undefined !== this.podcast.conferenceId &&
        'READY_TO_RECORD' === this.podcast.processingStatus
      );
    },
    classicPodcastPlay(): boolean {
      return (
        undefined!==this.podcast &&
        false !== this.podcast.valid &&
          ('READY_TO_RECORD' === this.podcast.processingStatus ||
            'READY' === this.podcast.processingStatus) &&
        !this.isLiveToBeRecorded && undefined!==this.podcast.availability.visibility 
        && this.podcast.availability.visibility
      );
    },
    iconName(): string {
      if (this.isLiveToBeRecorded) return 'saooti-clock';
      if ('READY' === this.podcast.processingStatus || this.fetchConference) {
        if (!this.podcast.valid) return 'saooti-checkmark';
        if (
          !this.podcast.availability.visibility &&
          this.podcast.availability.date
        )
          return 'saooti-clock';
        return 'saooti-eye-blocked';
      }
      if (
        'PLANNED' === this.podcast.processingStatus ||
        'PROCESSING' === this.podcast.processingStatus
      )
        return 'saooti-hourglass';
      if ('CANCELED' === this.podcast.processingStatus)
        return 'saooti-cancel-circle';
      return 'saooti-warning';
    },
    textVisible(): string {
      if (this.isLiveToBeRecorded)
        return this.$t('Podcast linked to waiting live');
      if ('READY' === this.podcast.processingStatus || this.fetchConference) {
        if (!this.podcast.valid) return this.$t('Podcast to validate');
        if (
          !this.podcast.availability.visibility &&
          this.podcast.availability.date
        )
          return this.$t('Podcast publish in future');
        return this.$t('Podcast no visible');
      }
      if (
        'PLANNED' === this.podcast.processingStatus ||
        'PROCESSING' === this.podcast.processingStatus
      )
        return this.$t('Podcast in process');
      if ('CANCELED' === this.podcast.processingStatus)
        return this.$t('Podcast in cancelled status');
      return this.$t('Podcast in error');
    },
    statusText(): string {
      if (!this.fetchConference) return '';
      switch (this.fetchConference.status) {
        case 'PLANNED':
          return this.$t('live in few time');
        case 'PENDING':
          if (this.isAnimatorLive) return this.$t('Open studio');
          return this.$t('live upcoming');
        case 'RECORDING':
          return this.$t('In live');
        case 'DEBRIEFING':
          if (!this.isAnimatorLive) return '';
          if ('READY_TO_RECORD' === this.podcast.processingStatus)
            return this.$t('Not recording');
          return this.$t('Debriefing');
        case 'ERROR':
          return this.$t('In error');
        case 'PUBLISHING':
          return this.$t('Publishing');
        default:
          return '';
      }
    },
    recordingLive(): boolean {
      return (
        undefined !== this.fetchConference &&
         -1 !== this.fetchConference.conferenceId &&
        ('RECORDING' === this.fetchConference.status ||
          'PENDING' === this.fetchConference.status)
      );
    },
    clickPlayGoPage():boolean{
      return (state.podcastPage.clickPlayGoPage as boolean);
    },
  },
  watch: {
    arrowDirection(): void {
      if ('up' === this.arrowDirection) {
        this.isDescription = true;
        this.showDescription();
      } else {
        this.isDescription = false;
        this.showDescription();
      }
    },
  },
 
  methods: {
    play(): void {
      if (this.isLiveToBeRecorded) {
        return;
      }
      if(this.playingPodcast){
        this.$store.commit('playerPause', "PLAYING"===this.$store.state.player.status);
        return;
      }
      if (!this.recordingLive) {
        this.$store.commit('playerPlayPodcast', this.podcast);
      }else{
        this.$store.commit('playerPlayPodcast', {
          title: this.podcast.title,
          audioUrl: this.podcast.audioUrl,
          duration: this.podcast.duration,
          conferenceId: this.fetchConference?.conferenceId,
          livePodcastId: this.podcast.podcastId,
          organisation: this.podcast.organisation,
        });
      }
      if(this.clickPlayGoPage){
        this.$router.push('/main/pub/podcast/'+this.podcast.podcastId);
      }
    },
    showDescription(): void {
      if (this.isDescription) {
        this.$emit('hideDescription');
      } else {
        this.$emit('showDescription');
      }
      this.isDescription = !this.isDescription;
    },
  },
})
</script>


<style lang="scss">
.octopus-app{
  .live-image-status {
    text-align: center;
    width: 100%;
    font-size: 0.6rem;
    padding: 0.2rem 0;
    color: white;
    text-transform: uppercase;
    position: absolute;
  }

  .background-icon{
    border-radius: 50%;
    width: 1rem;
    height: 1rem;
    font-size: 1rem;
    right: 0;
    bottom: 0;
    margin: 5px;
    position: absolute;
    cursor: pointer;
    z-index: 3;
  }
  .special-icon-play-button {
    width: 30px;
    height: 30px;
    background-color: #ffd663;
    border-radius: 50%;
    position: absolute;
    right: 4.5rem;
    top: 6rem;
    font-size: 0.9rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .transparent-background {
    background-color: rgba(255, 255, 255, 0.5);
  }
  .podcast-image-play-button{
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;
    flex-direction: column;
    background: transparent;
    border-width: 0;
    width: 100%;
    &:focus{
      background: rgba(0, 0, 0, 0.5);
    }

    .icon-container {
      background: #00000050;
      border-radius: 50%;
      height: 3rem;
      width: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      &.error-icon {
        background: #00000050 !important;
        cursor: default !important;
      }
      &:hover {
        background: #00000030;
      }
      > .saooti-play {
        font-size: 2em;
        position: relative;
        right: -0.2rem;
      }
      .big-icon-error {
        font-size: 2em;
        position: relative;
      }
      z-index: 2;
    }
  }
}
</style>