<template>
  <div
    class="w-100 transition-height bg-dark"
    :style="{ height: playerHeight }"
  >
    <div
      class="player-container"
      :style="{ height: playerHeight }"
      @transitionend="onHidden"
    >
      <div
        v-if="isBarTop"
        class="progress secondary-bg c-hand"
        @mouseup="seekTo"
      >
        <div
          class="progress-bar primary-bg"
          role="progressbar"
          aria-valuenow="0"
          aria-valuemin="0"
          aria-valuemax="100"
          :style="'width: ' + percentProgress + '%'"
        />
        <div class="player-progress-border" />
      </div>
      <div
        v-if="display"
        class="d-flex align-items-center justify-center flex-grow pe-5 ps-5"
      >
        <audio
          v-if="!live"
          id="audio-player"
          :src="audioUrl"
          autoplay
          @timeupdate="onTimeUpdate"
          @ended="onFinished"
          @playing="onPlay"
          @durationChange="onTimeUpdate"
          @error="onError"
        />
        <audio
          v-else
          id="audio-player"
          src
          @timeupdate="onTimeUpdate"
          @ended="onFinished"
          @playing="onPlay"
          @durationChange="onTimeUpdate"
          @error="onError"
        />
        <router-link
          v-if="isImage && podcastImage"
          :to="podcastShareUrl"
        >
          <img
            :src="podcastImage"
            :alt="$t('Podcast image')"
            class="player-image c-hand"
          >
        </router-link>

        <div
          v-if="!playerError"
          class="play-button-box"
          :class="{
            'primary-bg': !isLoading,
            'text-light': !isLoading,
          }"
          @click="switchPausePlay"
        >
          <div
            class="text-light"
            :aria-label="$t('Play')"
            :class="{
              saooti: isPlaying || isPaused,
              'saooti-play2-bounty': isPaused,
              'saooti-pause-bounty': isPlaying,
              loading: isLoading,
            }"
          />
        </div>
        <div
          v-if="(isPlaying || isPaused) && (media || isStop)"
          class="play-button-box primary-bg text-light"
          @click="stopPlayer"
        >
          <div
            class="text-light saooti-stop-bounty"
            :aria-label="$t('Stop')"
          />
        </div>
        <div class="text-light player-grow-content">
          <div class="d-flex">
            <div
              v-if="playerError"
              class="text-warning player-title ms-2 me-2"
            >
              {{ $t('Podcast play error') + ' - ' }}
            </div>
            <div class="flex-grow player-title">
              {{ podcastTitle }}
            </div>
            <div
              v-if="!playerError"
              v-show="!isBarTop"
              class="hide-phone"
            >
              {{ playedTime }} / {{ totalTime }}
            </div>
          </div>
          <div
            v-if="!playerError"
            v-show="!isBarTop"
            class="progress c-hand custom-bg-darkgrey"
            style="height: 3px;"
            @mouseup="seekTo"
          >
            <div
              class="progress-bar custom-bg-grey"
              role="progressbar"
              aria-valuenow="0"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="'width: ' + percentLiveProgress + '%'"
            />
            <div
              class="progress-bar primary-bg"
              role="progressbar"
              aria-valuenow="0"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="'width: ' + percentProgress + '%'"
            />
            <div
              v-if="displayAlertBar"
              class="progress-bar progress-bar-duration bg-danger"
              :style="'left: ' + durationLivePosition + '%'"
            />
          </div>
          <CommentPlayer
            v-if="showTimeline"
            :total-time="totalSecondes"
            :comments="comments"
          />
        </div>
        <div
          v-if="0 !== comments.length && !isPodcastmaker"
          class="timeline-button"
          @click="showTimeline = !showTimeline"
        >
          <div
            class="saooti-arrow_down saooti-arrow_down-margin"
            :class="showTimeline ? '' : 'arrow-transform'"
          />
          <div>Timeline</div>
        </div>
        <div
          v-if="isClock"
          class="d-flex text-light align-items-center hide-phone"
        >
          <div class="saooti-clock-stud m-2" />
          <div>{{ actualTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { state } from '../../store/paramStore';
import DurationHelper from '../../helper/duration';
const octopusApi = require('@saooti/octopus-api');
let Hls: any= null;

const moment = require('moment');
//const axios = require("axios");
import { CommentPodcast } from '@/store/class/comment';
import { cookies } from '../mixins/functions';
import { StoreState } from '@/store/typeAppStore';
import { defineComponent, defineAsyncComponent } from 'vue';
const CommentPlayer = defineAsyncComponent(() => import('../display/comments/CommentPlayer.vue'));
export default defineComponent({
  name: 'Player',

  components: {
    CommentPlayer,
  },
  mixins:[cookies],
  emits: ['hide'],

  data() {
    return {
      forceHide: false as boolean,
      actualTime: '' as string,
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      downloadId: null as any,
      playerError: false as boolean,
      listenError: false as boolean,
      percentLiveProgress: 0 as number,
      durationLivePosition: 0 as number,
      displayAlertBar: false as boolean,
      hlsReady: false as boolean,
      comments: [] as Array<CommentPodcast>,
      showTimeline: false as boolean,
    };
  },

  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    isPlaying(): boolean {
      return 'PLAYING' === this.status;
    },
    isPaused(): boolean {
      return 'PAUSED' === this.status;
    },
    isLoading(): boolean {
      return 'LOADING' === this.status;
    },
    isImage(): string {
      return state.player.image;
    },
    isEmissionName(): string {
      return state.player.emissionName;
    },
    isClock(): boolean {
      return state.player.clock;
    },
    isBarTop(): boolean {
      return state.player.barTop;
    },
    ...mapState({
      display: (state: StoreState) => 'STOPPED' !== state.player.status,
      playerHeight(state: StoreState) {
        if ('STOPPED' === state.player.status || this.forceHide) return 0;
        if (window.innerWidth > 450 && !this.showTimeline) return '5rem';
        if (window.innerWidth > 450 && this.showTimeline) return '6rem';
        return '3.5rem';
      },
      status: (state: StoreState) => state.player.status,
      podcast: (state: StoreState) => state.player.podcast,
      media: (state: StoreState) => state.player.media,
      live: (state: StoreState) => state.player.live,
      volume: (state: StoreState) => state.player.volume,
      isStop: (state: StoreState) => state.player.stop,
      commentsLoaded: (state: StoreState) => state.comments.loadedComments,
      podcastImage: (state: StoreState) => {
        if (state.player.podcast) return state.player.podcast.imageUrl;
        return '';
      },
      playedTime: (state: StoreState) => {
        if (state.player.elapsed && state.player.elapsed > 0 && state.player.total && state.player.total > 0) {
          return DurationHelper.formatDuration(
            Math.round(state.player.elapsed * state.player.total)
          );
        }
        return '--:--';
      },
      percentProgress: (state: StoreState) => {
        if(!state.player.elapsed){return 0;}
        return state.player.elapsed * 100;
      },
      totalTime: (state: StoreState) => {
        if (state.player.elapsed && state.player.elapsed > 0 && state.player.total && state.player.total > 0)
          return DurationHelper.formatDuration(Math.round(state.player.total));
        return '--:--';
      },
      totalSecondes: (state: StoreState) => state.player.total,
    }),
    audioUrl(): string {
      if (this.media) return this.media.audioUrl;
      if (!this.podcast) return '';
      if (!this.podcast.availability.visibility)
        return this.podcast.audioStorageUrl;
      if (this.listenError) return this.podcast.audioStorageUrl;
      const parameters = [];
      parameters.push('origin=octopus');
      parameters.push('cookieName=player_' + this.podcast.podcastId);
      parameters.push('listenerId='+this.getListenerId());
      if (
        this.$store.state.authentication &&
        this.$store.state.authentication.organisationId
      ) {
        parameters.push(
          'distributorId=' + this.$store.state.authentication.organisationId
        );
      }
      return this.podcast.audioUrl + '?' + parameters.join('&');
    },
    podcastShareUrl(): any {
      if (this.podcast) {
        return {
          name: 'podcast',
          params: { podcastId: this.podcast.podcastId },
          query: { productor: this.$store.state.filter.organisationId },
        };
      }
      return '';
    },
    podcastTitle(): string {
      if (this.podcast) {
        if (this.isEmissionName)
          return this.emissionName + ' - ' + this.podcast.title;
        return this.podcast.title;
      }
      if (this.media) return this.media.title;
      if (this.live) {
        if (!this.hlsReady)
          return this.live.title + ' (' + this.$t('Start in a while') + ')';
        return this.live.title;
      }
      return '';
    },
    emissionName(): string {
      if (this.podcast) return this.podcast.emission.name;
      return '';
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
  },

  watch: {
    live: {
      deep: true,
      async handler(){
      this.hlsReady = false;
      this.setDownloadId(null);
      this.listenError = false;
      await this.playLive();
      this.initComments();
      }
    },
    playerHeight(): void {
      this.$emit('hide', 0 === this.playerHeight ? true : false);
    },
    podcast: {
      deep: true,
      handler(){
      this.setDownloadId(null);
      this.listenError = false;
      this.initComments();
      }
    },
    async listenTime(newVal): Promise<void> {
      if (!this.podcast && !this.live) {
        //Nothing can be done there is no listen time
        return;
      }
      if (!this.getDownloadId()) {
        //nothing can be done there is no downloadId
        return;
      }
      if (newVal - this.lastSend < 10) {
        //Last send is too recent, do nothing
        return;
      }
      this.lastSend = newVal;
      await octopusApi.updatePlayerTime(
        this.getDownloadId(),
        Math.round(newVal)
      );
    },
    commentsLoaded(): void {
      this.initComments(true);
    },
  },

  mounted() {
    moment.locale('fr');
    if (this.isClock) {
      setInterval(() => {
        this.actualTime = moment(new Date()).format('HH:mm:ss');
      }, 1000);
    }
    window.addEventListener('beforeunload', this.endListeningProgress);
    this.watchPlayerStatus();
  },
  
  methods: {
    getListenerId(): string{
      let listenerId = this.getCookie("octopus_listenerId");
      if(!listenerId){
        listenerId = new Date().valueOf().toString() + Math.random();
        let domain: any = /\.(.+)/.exec(window.location.host);
        if(/\.(.+)/.exec(window.location.host)){
          domain = domain[1];
        }
        this.setCookie("octopus_listenerId", listenerId, ';domain='+domain);
      }
      return listenerId;
    },
    watchPlayerStatus(): void {
      this.$store.watch(
        (state: StoreState) => state.player.status,
        (newValue: string) => {
          const audioPlayer: any = document.querySelector('#audio-player');
          if (!audioPlayer) return;
          if (this.live && !this.hlsReady) {
            audioPlayer.pause();
            this.percentLiveProgress = 0;
            this.durationLivePosition = 0;
            return;
          }
          if ('PAUSED' === newValue) {
            audioPlayer.pause();
          } else {
            audioPlayer.play();
          }
        }
      );
    },
    getDownloadId(): any {
      return this.downloadId;
    },
    setDownloadId(newValue?: any): void {
      this.endListeningProgress();
      this.downloadId = newValue;
    },
    onError(): void {
      if (this.podcast && !this.listenError) {
        this.listenError = true;
      } else if (this.podcast || this.media) {
        this.playerError = true;
      }
    },
    switchPausePlay(): void {
      const audioPlayer: any = document.querySelector('#audio-player');
      if (audioPlayer.paused) {
        this.onPlay();
      } else {
        this.onPause();
      }
    },
    stopPlayer(): void {
      this.$store.commit('playerPlayPodcast');
    },
    seekTo(event: { currentTarget: { getBoundingClientRect: () => any; clientWidth: any }; clientX: number }): void {
      const audioPlayer: any = document.querySelector('#audio-player');
      const rect = event.currentTarget.getBoundingClientRect();
      const barWidth = event.currentTarget.clientWidth;
      const x = event.clientX - rect.left; //x position within the element.
      const percentPosition = x / barWidth;
      if (percentPosition * 100 >= this.percentLiveProgress) return;
      const seekTime = this.$store.state.player.total * percentPosition;
      if (this.podcast || this.live) {
        this.notListenTime = seekTime - this.listenTime;
      }
      audioPlayer.currentTime = seekTime;
    },
    onTimeUpdate(event: { currentTarget: { currentTime: number; duration: any } }): void {
      if (this.podcast || this.live) {
        if (!this.getDownloadId()) {
          this.loadDownloadId();
        }
        if (
          this.live &&
          0 === this.listenTime &&
          0 !== event.currentTarget.currentTime
        ) {
          this.notListenTime = event.currentTarget.currentTime;
          this.listenTime = 1;
        } else {
          this.listenTime =
            event.currentTarget.currentTime - this.notListenTime;
        }
      }
      const streamDuration = event.currentTarget.duration;
      if (!streamDuration) return;
      const playerCurrentTime = event.currentTarget.currentTime;
      if (!playerCurrentTime) return;
      if (!this.live) {
        this.displayAlertBar = false;
        this.percentLiveProgress = 100;
        this.$store.commit('playerTotalTime', streamDuration);
        this.$store.commit('playerElapsed', playerCurrentTime / streamDuration);
        return;
      }
      const scheduledDuration = this.live.duration / 1000;
      if (scheduledDuration > streamDuration) {
        this.displayAlertBar = false;
        this.percentLiveProgress = (streamDuration / scheduledDuration) * 100;
        this.$store.commit('playerTotalTime', scheduledDuration);
        this.$store.commit(
          'playerElapsed',
          playerCurrentTime / scheduledDuration
        );
      } else {
        this.percentLiveProgress = 100;
        this.displayAlertBar = true;
        this.durationLivePosition = (scheduledDuration / streamDuration) * 100;
        this.$store.commit('playerTotalTime', streamDuration);
        this.$store.commit('playerElapsed', playerCurrentTime / streamDuration);
      }
    },
    onPlay(): void {
      this.$store.commit('playerPause', false);
    },
    onPause(): void {
      this.$store.commit('playerPause', true);
    },
    onFinished(): void {
      this.setDownloadId(null);
      if (this.live) {
        const audio: any = document.getElementById('audio-player');
        audio.src = '';
      }
      this.forceHide = true;
    },
    onHidden(): void {
      if (this.forceHide) {
        this.$store.commit('playerPlayPodcast');
        this.forceHide = false;
      }
    },
    loadDownloadId(): void {
      if (!this.podcast) return;
      const matching_cookies = document.cookie
        .split(';')
        .map(item => {
          const _return = item.trim().split('=');
          return _return.map(item => item.trim());
        })
        .filter(item => {
          if(!this.podcast){return '';}
          return 'player_' + this.podcast.podcastId === item[0];
        });
      if (1 === matching_cookies.length) {
        this.setDownloadId(matching_cookies[0][1]);
      }
    },
    async endListeningProgress(): Promise<void> {
      if (!this.getDownloadId()) return;
      await octopusApi.updatePlayerTime(
        this.getDownloadId(),
        Math.round(this.listenTime)
      );
      this.setDownloadId(null);
      this.notListenTime = 0;
      this.lastSend = 0;
      this.listenTime = 0;
    },
    async initHls(hlsStreamUrl: string): Promise<void> {
      return new Promise<void>(async(resolve, reject) => {
        if(null === Hls){
          //TODO -> Version light min quand ce sera possible
          await import('hls.js/dist/hls.js').then((hlsLibrary) => {
            Hls = hlsLibrary.default;
          })
           await import('hls.js').then((hlsLibrary) => {
            Hls = hlsLibrary.default;
          })
        }
        if (!Hls.isSupported()) {
          reject('Hls is not supported ! ');
        }
        const hls = new Hls();
        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          let downloadId = null;
          try {
            downloadId = await octopusApi.requestLiveDownloadId(
              this.live.livePodcastId
            );
            await octopusApi.markPlayingLive(
              this.live.livePodcastId,
              downloadId,
              'octopus',
              this.$store.state.authentication.organisationId
            );
            this.setDownloadId(downloadId);
          } catch (error) {
            console.log('ERROR downloadId');
          }
          this.hlsReady = true;
          const audio: any = document.getElementById('audio-player');
          hls.attachMedia(audio);
          await audio.play();
          this.onPlay();
          resolve();
        });
        hls.on(Hls.Events.ERROR, async () => {
          reject('There is an error while reading media content');
        });
        hls.loadSource(hlsStreamUrl);
      });
    },
    async playLive(): Promise<void> {
      if (!this.live) return;
      const hlsStreamUrl =
        state.podcastPage.hlsUri +
        'stream/dev.' +
        this.live.conferenceId +
        '/index.m3u8';
      try {
        await this.initHls(hlsStreamUrl);
      } catch (error) {
        console.log(error);
        setTimeout(() => {
          this.playLive();
        }, 1000);
      }
    },
    editRight(organisation: any): boolean {
      if (
        (state.generalParameters.isCommments &&
          this.organisationId === organisation) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    async initComments(refresh = false): Promise<void> {
      let podcastId, organisation;
      if (this.podcast) {
        podcastId = this.podcast.podcastId;
        organisation = this.podcast.organisation.id;
      } else if (this.live) {
        podcastId = this.live.livePodcastId;
        organisation = this.live.organisation;
      }
      if (
        refresh &&
        podcastId &&
        this.$store.state.comments.actualPodcastId !== podcastId
      ) {
        return;
      }
      let first = 0;
      let count = 0;
      const size = 50;
      if (
        podcastId &&
        this.$store.state.comments.actualPodcastId === podcastId
      ) {
        this.comments = this.commentsLoaded;
        if (
          this.commentsLoaded &&
          this.commentsLoaded.length < this.$store.state.comments.totalCount
        ) {
          first = this.commentsLoaded.length;
          count = this.$store.state.comments.totalCount;
        }
      }
      if (
        (!podcastId ||
          this.$store.state.comments.actualPodcastId === podcastId) &&
        0 === first
      )
        return;
      while (0 === first || this.comments.length < count) {
        const param: any = {
          first: first,
          size: size,
          podcastId: podcastId,
        };
        if (!this.editRight(organisation)) {
          param.status = ['Valid'];
        }
        const data = await octopusApi.fetchRootComments(param);
        first += size;
        count = data.totalElements;
        this.comments = this.comments.concat(data.content).filter((c: CommentPodcast) => {
          return null !== c;
        });
      }
    },
  },
})
</script>

<style lang="scss">
@import '../../sass/_variables.scss';

.play-button-box {
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.5rem;
  border-radius: 50%;
  font-size: 1.2rem;
  flex-shrink: 0;
  cursor: pointer;
}

.player-container {
  position: fixed;
  overflow: hidden;
  z-index: 12;
  width: 100%;
  bottom: 0;
  display: flex;
  flex-direction: column;
  transition: height 1s;
  background: #282828 !important;
  max-width: 100%;
  font-size: 1rem;

  .player-image {
    border-radius: 0.2rem;
    height: 2.4rem;
    width: 2.4rem;
  }
  .player-progress-border {
    height: 10px;
    width: 3px;
    background: black;
  }
  .progress {
    align-items: flex-end;
    height: 10px;
    position: relative;
  }
  .progress-bar-duration {
    width: 10px;
  }
  .progress-bar {
    height: 4px;
    position: absolute;
  }

  .progress.custom-bg-darkgrey {
    background: #555;
  }

  .progress-bar.custom-bg-grey {
    background: #e9ecef;
  }

  .player-title,
  .hide-phone {
    font-size: 0.8rem;
    margin: 0 0 5px 0;
  }
  .player-grow-content {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    flex-shrink: 1;
    flex-basis: 20px;
    overflow: hidden;
  }
  .player-title {
    font-size: 0.8rem;
    margin: 0 0 5px 0;
  }

  .hide-phone {
    font-size: 0.8rem;
    margin: 0 0 5px 0;
  }
  .timeline-button {
    background: black;
    padding: 0.1rem;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    font-size: 0.7rem;
    font-weight: bold;
    justify-content: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    color: $octopus-primary-color;
    margin-left: 0.5rem;
    @media (max-width: 960px) {
      display: none;
    }
  }
}
/** PHONES*/
@media (max-width: 450px) {
  .player-container {
    .player-image {
      height: 2rem;
      width: 2rem;
    }
  }
}

@media (max-width: 960px) {
  .player-container {
    .d-flex {
      @media (max-width: 960px) {
        flex-wrap: nowrap !important;
      }
    }
    .player-title {
      font-size: 12px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>