import { mapState } from 'vuex';
import octopusApi from '@saooti/octopus-api';
import { CommentPodcast } from '@/store/class/general/comment';
import { cookies } from '../functions';
import { playerLive } from './playerLive';
import { playerComment } from './playerComment';
import { StoreState } from '@/store/typeAppStore';
import { defineComponent } from 'vue';
export const playerLogic = defineComponent({
  mixins:[cookies,playerLive,playerComment],
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
      audioUrlToPlay: "" as string
    };
  },
  computed: {
    ...mapState({
      podcast (state: StoreState){ return state.player.podcast},
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
      return this.getAudioUrl();
    },
  },

  watch: {
    async audioUrl(): Promise<void>{
      this.playerError = false;
      if(this.media || !this.podcast || !this.podcast.availability.visibility ||this.listenError){
        this.audioUrlToPlay = this.audioUrl;
      }
      if(!this.podcast){return;}
      const response = await octopusApi.fetchPodcastDownloadUrl("podcast/download/register/"+ this.audioUrl);
      this.setDownloadId(response.downloadId.toString());
      this.audioUrlToPlay = response.location;
    },
    podcast: {
      deep: true,
      handler(){
        this.reInitPlayer();
      }
    },
    live: {
      deep: true,
      async handler(){
        this.hlsReady = false;
        this.reInitPlayer();
        await this.playLive();
      }
    },
    async listenTime(newVal): Promise<void> {
      if ((!this.podcast && !this.live)||(!this.downloadId)||(newVal - this.lastSend < 10)) {
        return;
      }
      this.lastSend = newVal;
      await octopusApi.updatePlayerTime(
        this.downloadId,
        Math.round(newVal)
      );
    },
    playerSeekTime(){
      if(!this.playerSeekTime){return;}
      if (this.$store.state.player.podcast || this.$store.state.player.live) {
        this.notListenTime = this.playerSeekTime - this.listenTime;
      }
      const audioPlayer: HTMLAudioElement | null = document.querySelector('#audio-player');
      if (!audioPlayer) return;
      audioPlayer.currentTime = this.playerSeekTime;
    },
  },

  mounted() {
    window.addEventListener('beforeunload', this.endListeningProgress);
    this.watchPlayerStatus();
  },
  
  methods: {
    getDomain(): string{
      let domain = "";
      const domainArray: RegExpExecArray | null = /\.(.+)/.exec(window.location.host);
      if(domainArray &&  null !== domainArray){
        domain = domainArray[1];
      }
      return domain;
    },
    getAudioUrl(): string{
      if (this.media) return this.media.audioUrl? this.media.audioUrl:"";
      if (!this.podcast) return '';
      if (!this.podcast.availability.visibility)
        return this.podcast.audioStorageUrl;
      if (this.listenError) return this.podcast.audioStorageUrl;
      const parameters = [];
      parameters.push('origin=octopus');
      parameters.push('listenerId='+this.getListenerId());
      if (
        this.$store.state.authentication &&
        this.$store.state.authentication.organisationId
      ) {
        parameters.push(
          'distributorId=' + this.$store.state.authentication.organisationId
        );
      }
      if("SECURED" === this.podcast.organisation.privacy && this.$store.state.authentication.isAuthenticated && this.$store.state.oAuthParam.accessToken){
        parameters.push('access_token='+this.$store.state.oAuthParam.accessToken);
      }
      return this.podcast.podcastId + '.mp3?' + parameters.join('&');
    },
    reInitPlayer():void{
      this.setDownloadId(null);
      this.listenError = false;
      this.initComments();
    },
    stopPlayer(): void {
      this.$store.commit('playerPlayPodcast');
    },
    getListenerId(): string{
      let listenerId = this.getCookie("octopus_listenerId");
      if(!listenerId){
        listenerId = new Date().valueOf().toString() + Math.random();
        this.setCookie("octopus_listenerId", listenerId, ';domain='+this.getDomain());
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
    onError(): void {
      if (this.podcast && ""!==this.audioUrlToPlay &&  !this.listenError) {
        this.listenError = true;
      } else if ((this.podcast && ""!==this.audioUrlToPlay ) || this.media) {
        this.playerError = true;
      }
    },
    onTimeUpdate(event: Event): void {
      const mediaTarget = (event.currentTarget as HTMLMediaElement);
      if (this.podcast || this.live) {
        if (!this.downloadId) {
          return;
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
      if (!mediaTarget.currentTime) return;
      if (!this.live) {
        this.displayAlertBar = false;
        this.percentLiveProgress = 100;
        this.$store.commit('playerTotalTime', streamDuration);
        this.$store.commit('playerElapsed', mediaTarget.currentTime / streamDuration);
        return;
      }
      const scheduledDuration = this.live.duration / 1000;
      if (scheduledDuration > streamDuration) {
        this.displayAlertBar = false;
        this.percentLiveProgress = (streamDuration / scheduledDuration) * 100;
        this.$store.commit('playerTotalTime', scheduledDuration);
        this.$store.commit(
          'playerElapsed',
          mediaTarget.currentTime / scheduledDuration
        );
      } else {
        this.percentLiveProgress = 100;
        this.displayAlertBar = true;
        this.durationLivePosition = (scheduledDuration / streamDuration) * 100;
        this.$store.commit('playerTotalTime', streamDuration);
        this.$store.commit('playerElapsed', mediaTarget.currentTime / streamDuration);
      }
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
  },
})