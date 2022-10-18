<template>
  <div
    class="d-flex align-items-center flex-grow-1 ps-2"
  >
    <router-link
      v-if="isImage && podcastImage"
      :to="podcastShareUrl"
    >
      <img
        v-lazy="proxyImageUrl(podcastImage,'48')"
        :alt="$t('Podcast image')"
        class="player-image"
      >
    </router-link>
    <button
      v-if="!playerError"
      :title="$t('Play')"
      :class="{
        'saooti-play': isPaused,
        'saooti-pause': isPlaying,
        '':!isPaused&&!isPlaying
      }"
      class="btn play-button-box text-light primary-bg"
      @click="switchPausePlay"
    >
      <span
        v-if="!isPaused&&!isPlaying"
        class="spinner-border flex-shrink-0"
      />
    </button>
    <div class="text-light player-grow-content">
      <div class="d-flex mb-1">
        <div
          v-if="playerError"
          class="text-warning mx-2"
        >
          {{ $t('Podcast play error') + ' - ' }}
        </div>
        <div class="flex-grow-1 text-truncate">
          {{ podcastTitle }}
        </div>
        <div
          v-if="!playerError"
          class="hide-phone"
        >
          {{ playedTime }} / {{ totalTime }}
        </div>
      </div>
      <PlayerProgressBar
        :hls-ready="hlsReady"
        :show-timeline="showTimeline"
        :comments="comments"
        :display-alert-bar="displayAlertBar"
        :percent-live-progress="percentLiveProgress"
        :duration-live-position="durationLivePosition"
        :player-error="playerError"
        :listen-time="listenTime"
        @updateNotListenTime="$emit('update:notListenTime', $event)"
      />
    </div>
    <button
      :title="$t('Enlarge')"
      class="btn play-button-box saooti-up"
      @click="changePlayerLargeVersion"
    />
    <button
      :title="$t('Close')"
      class="btn play-button-box saooti-remove"
      @click="stopPlayer"
    />
    <PlayerTimeline
      v-model:showTimeline="showTimeline"
      :comments="comments"
    />
  </div>
</template>
<script lang="ts">
import { CommentPodcast } from '@/store/class/general/comment';
import { playerDisplay } from '../../mixins/player/playerDisplay';
import { imageProxy } from '../../mixins/functions';
import PlayerProgressBar from './PlayerProgressBar.vue';
import PlayerTimeline from './PlayerTimeline.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'PlayerCompact',

  components: {
    PlayerProgressBar,
    PlayerTimeline
  },
  mixins:[playerDisplay, imageProxy],

  props: {
    playerError: { default: false, type: Boolean},
    notListenTime: { default: 0 , type: Number},
    hlsReady: { default: false , type: Boolean},
    comments: { default: ()=>[] , type: Array as ()=> Array<CommentPodcast> },
    displayAlertBar: { default: false , type: Boolean},
    percentLiveProgress: { default: 0 , type: Number},
    durationLivePosition: { default: 0 , type: Number},
    listenTime: { default: 0 , type: Number},
  },

  emits: ['stopPlayer', 'update:notListenTime', 'changePlayerLargeVersion'],
  data() {
    return {
      showTimeline: false as boolean,
    };
  },
  methods:{
    stopPlayer(){
      this.$emit('stopPlayer');
    },
    changePlayerLargeVersion(){
      this.$emit('changePlayerLargeVersion');
    }
  }
})
</script>

<style lang="scss">
.octopus-app{
  .player-grow-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
    font-size: 0.8rem;
  }
  .player-image {
    border-radius: 0.2rem;
    height: 2.4rem;
    width: 2.4rem;
    cursor: pointer;
    /** PHONES*/
    @media (max-width: 450px) {
      height: 1.8rem;
      width: 1.8rem;
    }
  }
  .play-button-box {
    height: 2.2rem;
    width: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
    border-radius: 50% !important;
    font-size: 0.7rem !important;
    flex-shrink: 0;
    cursor: pointer;
  }
}
</style>