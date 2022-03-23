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
        class="progress c-hand"
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
        class="d-flex align-items-center flex-grow-1 ps-2"
      >
        <audio
          id="audio-player"
          :src="!live? audioUrl: undefined"
          autoplay
          @timeupdate="onTimeUpdate"
          @ended="onFinished"
          @playing="onPlay"
          @durationChange="onTimeUpdate"
          @error="onError"
        />
        <PlayerButtons
          :player-error="playerError"
        />
        <PlayerProgressBar
          v-model:notListenTime="notListenTime"
          :hls-ready="hlsReady"
          :show-timeline="showTimeline"
          :comments="comments"
          :display-alert-bar="displayAlertBar"
          :percent-live-progress="percentLiveProgress"
          :duration-live-position="durationLivePosition"
          :player-error="playerError"
          :listen-time="listenTime"
        />
        <div
          class="play-button-box primary-bg text-light"
          @click="stopPlayer"
        >
          <div
            class="saooti-cross"
            :title="$t('Close')"
          />
        </div>
        <PlayerClockAndTimeline
          v-model:showTimeline="showTimeline"
          :comments="comments"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { mapState } from 'vuex';
import { state } from '../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
/* eslint-disable */
let Hls:any = null;
/* eslint-enable */
import { CommentPodcast } from '@/store/class/general/comment';
import { cookies } from '../mixins/functions';
import { StoreState } from '@/store/typeAppStore';
import PlayerProgressBar from './PlayerProgressBar.vue';
import PlayerButtons from './PlayerButtons.vue';
import PlayerClockAndTimeline from './PlayerClockAndTimeline.vue';
import { defineComponent } from 'vue';
import { FetchParam } from '@/store/class/general/fetchParam';
export default defineComponent({
  name: 'Player',

  components: {
    PlayerProgressBar,
    PlayerButtons,
    PlayerClockAndTimeline
  },
  mixins:[cookies],
  emits: ['hide'],
  data() {
    return {
      forceHide: false as boolean,
      listenTime: 0 as number,
      notListenTime: 0 as number,
      lastSend: 0 as number,
      downloadId: null as string|null,
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
    isBarTop(): boolean {
      return (state.player.barTop as boolean);
    },
    ...mapState({
      display: (state: StoreState) => 'STOPPED' !== state.player.status,
      playerHeight(state: StoreState) {
        if ('STOPPED' === state.player.status || this.forceHide) return 0;
        if (window.innerWidth > 450 && !this.showTimeline) return '5rem';
        if (window.innerWidth > 450 && this.showTimeline) return '6rem';
        return '3.5rem';
      },
      podcast: (state: StoreState) => state.player.podcast,
      media: (state: StoreState) => state.player.media,
      live: (state: StoreState) => state.player.live,
      volume: (state: StoreState) => state.player.volume,
      commentsLoaded: (state: StoreState) => state.comments.loadedComments,
      percentProgress: (state: StoreState) => {
        if(!state.player.elapsed){return 0;}
        return state.player.elapsed * 100;
      },
      playerSeekTime: (state: StoreState) => state.player.seekTime,
    }),
    audioUrl(): string {
      if (this.media) return this.media.audioUrl? this.media.audioUrl:"";
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
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
  },

  watch: {
    playerSeekTime(){
      if(!this.playerSeekTime){return;}
      if (this.$store.state.player.podcast || this.$store.state.player.live) {
        this.notListenTime = this.playerSeekTime - this.listenTime;
      }
      const audioPlayer: HTMLAudioElement | null = document.querySelector('#audio-player');
      if (!audioPlayer) return;
      audioPlayer.currentTime = this.playerSeekTime;
    },
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
      if ((!this.podcast && !this.live)||(!this.getDownloadId())||(newVal - this.lastSend < 10)) {
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
    audioUrl(): void{
      this.playerError = false;
    }
  },

  mounted() {
    window.addEventListener('beforeunload', this.endListeningProgress);
    this.watchPlayerStatus();
  },
  
  methods: {
    stopPlayer(): void {
      this.$store.commit('playerPlayPodcast');
    },
    getListenerId(): string{
      let listenerId = this.getCookie("octopus_listenerId");
      if(!listenerId){
        listenerId = new Date().valueOf().toString() + Math.random();
        let domain = "";
        const domainArray: RegExpExecArray | null = /\.(.+)/.exec(window.location.host);
        if(domainArray &&  null !== domainArray){
          domain = domainArray[1];
        }
        this.setCookie("octopus_listenerId", listenerId, ';domain='+domain);
      }
      return listenerId;
    },
    watchPlayerStatus(): void {
      this.$store.watch(
        (state: StoreState) => state.player.status,
        (newValue: string) => {
          const audioPlayer: HTMLAudioElement | null = document.querySelector('#audio-player');
          if (!audioPlayer) return;
          if (this.live && !this.hlsReady) {
            audioPlayer.pause();
            this.percentLiveProgress = 0;
            this.durationLivePosition = 0;
            return;
          }
          if ('PAUSED' === newValue) {
            audioPlayer.pause();
          }else if ('PLAYING' === newValue){
            audioPlayer.play();
          }
        }
      );
    },
    getDownloadId(): string|null {
      return this.downloadId;
    },
    setDownloadId(newValue: string|null): void {
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
    onTimeUpdate(event: Event): void {
      const mediaTarget = (event.currentTarget as HTMLMediaElement);
      if (this.podcast || this.live) {
        if (!this.getDownloadId()) {
          this.loadDownloadId();
        }
        if (
          this.live &&
          0 === this.listenTime &&
          0 !== mediaTarget.currentTime
        ) {
          this.notListenTime = mediaTarget.currentTime;
          this.listenTime = 1;
        } else {
          this.listenTime =
            mediaTarget.currentTime - this.notListenTime;
        }
      }
      const streamDuration = mediaTarget.duration;
      if (!streamDuration) return;
      const playerCurrentTime = mediaTarget.currentTime;
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
    onFinished(): void {
      this.setDownloadId(null);
      if (this.live) {
        const audio: HTMLElement|null = document.getElementById('audio-player');
        if(audio){
          (audio as HTMLAudioElement).src = '';
        }
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
          if(!this.live){ return; }
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
          const audio: HTMLElement|null = document.getElementById('audio-player');
          hls.attachMedia((audio as HTMLAudioElement));
          await (audio as HTMLAudioElement).play();
          this.onPlay();
          resolve();
        });
        hls.on(Hls.Events.ERROR, async() => {
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
    editRight(organisation: string): boolean {
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
        organisation = this.live.organisation.id;
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
        const param: FetchParam = {
          first: first,
          size: size,
          podcastId: podcastId,
        };
        if (!this.editRight(organisation? organisation : '')) {
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
.octopus-app{
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
  font-size: 1rem;

  .player-progress-border {
    height: 10px;
    width: 3px;
    background: black;
  }

  @media (max-width: 960px) {
    .d-flex {
      flex-wrap: nowrap !important;
    }
  }
}
}
</style>