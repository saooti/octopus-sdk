<template>
  <div
    class="img-box d-flex flex-column justify-content-start align-items-start position-relative justify rounded-lg flex-shrink float-left"
    :style="{ 'background-image': 'url(\'' + podcast.imageUrl + '\')' }"
    v-if="podcast"
  >
    <template v-if="isPodcastmaker">
      <div v-if="mainRubrique" class="mainRubrique"></div>
      <div v-else class="notMainRubrique"></div>
    </template>
    <div
      class="live-image-status"
      :class="
        fetchConference && 'null' !== fetchConference
          ? fetchConference.status.toLowerCase() + '-bg'
          : ''
      "
      v-if="fetchConference"
    >
      {{ statusText }}
    </div>
    <div class="live-image-status recording-bg" v-if="isRecordedInLive">
      {{ $t('Recorded in live') }}
    </div>
    <div
      class="podcast-image-play-button"
      v-on:click="play"
      v-if="hidePlay || recordingLive"
      :class="classicPodcastPlay ? '' : 'transparent-background'"
    >
      <div class="icon-container" v-if="!isLiveToBeRecorded">
        <div
          :aria-label="$t('Play')"
          class="saooti-play2-bounty primary-color"
          v-show="!playingPodcast"
        ></div>
        <div
          class="special-icon-play-button"
          :class="iconName"
          v-if="!classicPodcastPlay"
        ></div>
        <div class="bloc-paddle" v-show="playingPodcast">
          <span class="paddle1 primary-color"></span>
          <span class="paddle2 primary-color"></span>
          <span class="paddle3 primary-color"></span>
        </div>
      </div>
      <div class="icon-container error-icon" v-else>
        <div
          :aria-label="textVisible"
          class="big-icon-error"
          :class="iconName"
        ></div>
      </div>
      <div
        class="small-Text mt-3 font-weight-bolder"
        v-if="!classicPodcastPlay"
      >
        {{ textVisible }}
      </div>
    </div>
    <div
      class="background-icon saooti-arrow-up2"
      :aria-label="$t('Show description')"
      v-if="!isDescription && displayDescription && isMobile"
      @click="showDescription"
    ></div>
    <div
      class="background-icon saooti-arrow-down2"
      :aria-label="$t('Hide description')"
      v-if="isDescription && displayDescription && isMobile"
      @click="showDescription"
    ></div>
  </div>
</template>

<style lang="scss">
.no-visible-img {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  padding: 0.7em;
  background: rgba(0, 0, 0, 0.31);
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
  flex-direction: column;

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

    > .saooti-play2-bounty {
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

<script lang="ts">
import { mapState } from 'vuex';
import { state } from '../../../store/paramStore';
import {StoreState} from '@/store/typeAppStore';
import { Podcast } from '@/store/class/podcast';
import { Conference } from '@/store/class/conference';
export default {
  name: 'PodcastImage',
  props: {
    podcast: { default: undefined as Podcast|undefined},
    hidePlay: { default: false as boolean},
    displayDescription: { default: false as boolean},
    arrowDirection: { default: 'up' as string},
    isAnimatorLive: { default: false as boolean},
    fetchConference: { default: undefined as Conference|undefined},
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
      if(this.podcast && this.podcast.rubriqueIds && this.podcast.rubriqueIds.includes(state.podcastPage.mainRubrique)){
        return true;
      }else{
        return false;
      }
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
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
        if (false == this.podcast.valid) return 'saooti-checkmark';
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
        return this.$t('Podcast linked to waiting live').toString();
      if ('READY' === this.podcast.processingStatus || this.fetchConference) {
        if (false == this.podcast.valid) return this.$t('Podcast to validate').toString();
        if (
          !this.podcast.availability.visibility &&
          this.podcast.availability.date
        )
          return this.$t('Podcast publish in future').toString();
        return this.$t('Podcast no visible').toString();
      }
      if (
        'PLANNED' === this.podcast.processingStatus ||
        'PROCESSING' === this.podcast.processingStatus
      )
        return this.$t('Podcast in process').toString();
      if ('CANCELED' === this.podcast.processingStatus)
        return this.$t('Podcast in cancelled status').toString();
      return this.$t('Podcast in error').toString();
    },
    statusText(): string {
      if (!this.fetchConference) return '';
      switch (this.fetchConference.status) {
        case 'PLANNED':
          return this.$t('live in few time').toString();
        case 'PENDING':
          if (this.isAnimatorLive) return this.$t('Open studio').toString();
          return this.$t('live upcoming').toString();
        case 'RECORDING':
          return this.$t('In live').toString();
        case 'DEBRIEFING':
          if (!this.isAnimatorLive) return '';
          if ('READY_TO_RECORD' === this.podcast.processingStatus)
            return this.$t('Not recording').toString();
          return this.$t('Debriefing').toString();
        case 'ERROR':
          return this.$t('In error').toString();
        case 'PUBLISHING':
          return this.$t('Publishing').toString();
        default:
          return '';
      }
    },
    recordingLive(): boolean {
      return (
        this.fetchConference &&
         -1 !== this.fetchConference.conferenceId &&
        ('RECORDING' === this.fetchConference.status ||
          'PENDING' === this.fetchConference.status)
      );
    },
  },
 
  methods: {
    play(): void {
      if (this.isLiveToBeRecorded) {
        return;
      }
      if(this.playingPodcast){
        if("PLAYING"===this.$store.state.player.status){
          this.$store.commit('playerPause', true);
        }else{
          this.$store.commit('playerPause', false);
        }
        return;
      }
      if (!this.recordingLive) {
        this.$store.commit('playerPlayPodcast', this.podcast);
        return;
      }
      this.$store.commit('playerPlayPodcast', {
        title: this.podcast.title,
        audioUrl: this.podcast.audioUrl,
        duration: this.podcast.duration,
        conferenceId: this.fetchConference.conferenceId,
        livePodcastId: this.podcast.podcastId,
        organisation: this.podcast.organisation.id,
      });
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
};
</script>
