<template>
  <div
    class="d-flex flex-column align-items-center my-2 flex-grow-1 text-light"
  >
    <router-link
      v-if="isImage && podcastImage"
      :to="podcastShareUrl"
    >
      <img
        v-lazy="podcastImage"
        :alt="$t('Podcast image')"
        class="img-box"
      >
    </router-link>
    <div class="d-flex mt-2">
      <div
        v-if="playerError"
        class="text-warning mx-2"
      >
        {{ $t('Podcast play error') + ' - ' }}
      </div>
      <div class="flex-grow-1 text-truncate h3">
        {{ podcastTitle }}
      </div>
    </div>
    <div class="player-grow-large-content">
      <PlayerProgressBar
        :notListenTime="notListenTime"
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
      <div class="d-flex justify-content-between">
        <div>{{ playedTime }}</div>
        <div>{{ totalTime }}</div>
      </div>
    </div>
    <div class="d-flex align-items-center">
      <button @click="goBackward" class="btn fs-1 bg-transparent text-light saooti-backward"/>
      <button
        v-if="!playerError"
        :title="$t('Play')"
        :class="{
          'saooti-play2-bounty': isPaused,
          'saooti-pause-bounty': isPlaying,
          'spinner-border':!isPaused&&!isPlaying
        }"
        class="btn play-big-button-box text-light primary-bg"
        @click="switchPausePlay"
      />
      <button @click="goForward" class="btn fs-1 bg-transparent text-light saooti-forward2"/>
    </div>
    
    
    <!-- 
    <button
      :title="$t('Reduce')"
      class="btn play-button-box primary-bg text-light saooti-down-bounty"
      @click="changePlayerLargeVersion"
    />
    <button
      :title="$t('Close')"
      class="btn play-button-box primary-bg text-light saooti-cross"
      @click="stopPlayer"
    /> -->
    <PlayerTimeline
      v-model:showTimeline="showTimeline"
      :comments="comments"
    />
  </div>
</template>
<script lang="ts">
import { CommentPodcast } from '@/store/class/general/comment';
import { playerDisplay } from '../../mixins/player/playerDisplay';
import PlayerProgressBar from './PlayerProgressBar.vue';
import PlayerTimeline from './PlayerTimeline.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'PlayerLarge',

  components: {
    PlayerProgressBar,
    PlayerTimeline
  },

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
  mixins:[playerDisplay],
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
    },
    goBackward():void{
      
    }
  }
})
</script>

<style lang="scss">
.octopus-app{
  .player-grow-large-content{
    width: 100%;
    padding: 1rem 2rem;
    .progress, .progress-bar{
      height: 15px !important;
    }
  }
  .play-big-button-box {
    height: 5rem;
    width: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
    border-radius: 50%;
    font-size: 2.5rem !important;
    flex-shrink: 0;
    cursor: pointer;
  }
}
</style>