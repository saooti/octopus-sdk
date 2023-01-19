import { mapState } from 'vuex';
import octopusApi from '@saooti/octopus-api';
import { CommentPodcast } from '@/store/class/general/comment';
import cookies from '../cookies';
import { playerLive } from './playerLive';
import { playerComment } from './playerComment';
import { playerTranscript } from './playerTranscript';
import { defineComponent } from 'vue';
import { Player } from '@/store/class/general/player';
export const playerLogic = defineComponent({
  mixins:[cookies,playerLive,playerComment, playerTranscript],
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
    ...mapState('player',{
      podcast (state: Player){ return state.podcast},
      media: (state: Player) => state.media,
      live: (state: Player) => state.live,
      radio: (state: Player) => state.radio,
      volume: (state: Player) => state.volume,
      status : (state: Player) => state.status,
      percentProgress: (state: Player) => {
        if(!state.elapsed){return 0;}
        return state.elapsed * 100;
      },
      playerSeekTime: (state: Player) => state.seekTime,
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
      if(!this.podcast || !this.podcast.availability.visibility ||this.listenError){return;}
      const response = await octopusApi.fetchDataPublic<{location:string, downloadId: number}>(0,"podcast/download/register/"+ this.getAudioUrlParameters());
      this.setDownloadId(response.downloadId.toString());
      this.audioUrlToPlay = response.location;
    },
    podcast: {
      deep: true,
      handler(){
        this.reInitPlayer();
        this.getTranscription();
      }
    },
    live: {
      deep: true,
      handler(){
        this.$nextTick(async () => {
          this.hlsReady = false;
          this.reInitPlayer();
          this.playLive();
        });
      }
    },
    radio(){
      this.$nextTick(async () => {
        this.hlsReady = false;
        this.reInitPlayer();
        this.playRadio();
      });
    },
    async listenTime(newVal): Promise<void> {
      if (this.radio && (!this.podcast && !this.live)||(!this.downloadId)||(newVal - this.lastSend < 10)) {
        return;
      }
      this.lastSend = newVal;
      await octopusApi.putDataPublic(0, 'podcast/listen/' + this.downloadId + '?seconds=' +  Math.round(newVal), undefined);
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
    status() {
      const audioPlayer: HTMLAudioElement | null = document.querySelector('#audio-player');
      if (!audioPlayer) return;
      if (this.live && !this.hlsReady) {
        audioPlayer.pause();
        this.percentLiveProgress = 0;
        this.durationLivePosition = 0;
        return;
      }
      if ('PAUSED' === this.status && this.radio) {
        this.hlsReady = false;
        this.reInitPlayer();
        this.endingLive();
      }else if('PAUSED' === this.status){
        audioPlayer.pause();
      }else if ('PLAYING' === this.status && this.radio){
        if(this.radio.isInit){
          this.playRadio();
        }else{
          this.radio.isInit = true;
        }
      }else if('PLAYING' === this.status){
        audioPlayer.play();
      }
    },
  },

  mounted() {
    window.addEventListener('beforeunload', this.endListeningProgress);
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
    getAudioUrlParameters(): string{
      if (!this.podcast) return '';
      const parameters = [];
      parameters.push('origin=octopus');
      parameters.push('listenerId='+this.getListenerId());
      if (
        this.$store.state.auth &&
        this.$store.state.auth.organisationId
      ) {
        parameters.push(
          'distributorId=' + this.$store.state.auth.organisationId
        );
      }
      if("SECURED" === this.podcast.organisation.privacy && this.$store.state.auth && this.$store.state.auth.oAuthParam.accessToken){
        parameters.push('access_token='+this.$store.state.auth?.oAuthParam.accessToken);
      }
      return this.podcast.podcastId + '.mp3?' + parameters.join('&');
    },
    getAudioUrl(): string{
      if (this.media) return this.media.audioUrl? this.media.audioUrl:"";
      if (!this.podcast) return '';
      if (!this.podcast.availability.visibility || "PROCESSING"===this.podcast.processingStatus)
        return this.podcast.audioStorageUrl;
      if (this.listenError) return this.podcast.audioStorageUrl;
      return this.getAudioUrlParameters();
    },
    reInitPlayer():void{
      this.setDownloadId(null);
      this.listenError = false;
      this.initComments();
      if (this.live || this.radio) {
        this.endingLive();
      }
    },
    stopPlayer(): void {
      this.$store.commit('player/playPodcast');
    },
    getListenerId(): string{
      let listenerId = this.getCookie("octopus_listenerId");
      if(!listenerId){
        listenerId = new Date().valueOf().toString() + Math.random();
        this.setCookie("octopus_listenerId", listenerId, ';domain='+this.getDomain());
      }
      return listenerId;
    },
    onError(): void {
      if (this.podcast && ""!==this.audioUrlToPlay &&  !this.listenError) {
        this.listenError = true;
      } else if ((this.podcast && ""!==this.audioUrlToPlay ) || this.media) {
        this.playerError = true;
      }
    },
    streamDurationForSafari(mediaTarget:HTMLMediaElement){
      let streamDuration = mediaTarget.duration;
      if(Infinity===streamDuration){
        const seekable = mediaTarget.seekable;
        if(seekable){
          streamDuration = seekable.end(seekable.length - 1);
        }else{
          streamDuration = mediaTarget.currentTime;
        }
      }
      return streamDuration;
    },
    
    onTimeUpdatePodcast(streamDuration:number, currentTime:number){
      this.displayAlertBar = false;
      this.percentLiveProgress = 100;
      this.$store.commit('player/totalTime', streamDuration);
      this.$store.commit('player/elapsed', currentTime / streamDuration);
      this.onTimeUpdateTranscript(currentTime);
    },
    onTimeUpdateLive(streamDuration: number, currentTime:number){
      if(!this.live){return;}
      const scheduledDuration = this.live.duration / 1000;
      if (scheduledDuration > streamDuration) {
        this.displayAlertBar = false;
        this.percentLiveProgress = (streamDuration / scheduledDuration) * 100;
        this.$store.commit('player/totalTime', scheduledDuration);
        this.$store.commit(
          'player/elapsed',
          currentTime / scheduledDuration
        );
      } else {
        this.percentLiveProgress = 100;
        this.displayAlertBar = true;
        this.durationLivePosition = (scheduledDuration / streamDuration) * 100;
        this.$store.commit('player/totalTime', streamDuration);
        this.$store.commit('player/elapsed', currentTime / streamDuration);
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
      let streamDuration = this.streamDurationForSafari(mediaTarget);
      if (!streamDuration) return;
      if (!mediaTarget.currentTime) return;
      if (!this.live) {
        this.onTimeUpdatePodcast(streamDuration,mediaTarget.currentTime);
        return;
      }
      this.onTimeUpdateLive(streamDuration,mediaTarget.currentTime);
    },
    onSeeked(event: Event):void {
      const mediaTarget = (event.currentTarget as HTMLMediaElement);
      const currentTime = mediaTarget.currentTime;
      this.onSeekedTranscript(currentTime);
    },
    onFinished(): void {
      this.setDownloadId(null);
      if (this.live) {
        this.endingLive();
      }
      this.forceHide = true;
    },
  },
})