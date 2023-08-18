<template>
  <div id="player-video-hls" class="video-player">
    <div v-if="errorPlay.length" class="video-live-error">{{errorPlay}}</div>
    <video id="video-element-hls" ref="videoelement" class="video-js" playsinline></video>
  </div>
</template>
<script lang="ts">
import videojs, { VideoJsPlayer } from 'video.js';
import qualitySelector from 'videojs-hls-quality-selector';
import qualityLevels from 'videojs-contrib-quality-levels';
if (!videojs.getPlugin('qualityLevels')) {
  videojs.registerPlugin('qualityLevels', qualityLevels);
}
if (!videojs.getPlugin('hlsQualitySelector')) {
  videojs.registerPlugin('hlsQualitySelector', qualitySelector);
}
import { defineComponent } from 'vue';
export default defineComponent({
  name: "PlayerVideoHls",

  props: {
    hlsUrl: { default: "", type: String },
  },

  emits:['changeValid'],
  data() {
    return {
      errorPlay: "" as string,
      useVideoSrc: false as boolean,
      player: undefined as VideoJsPlayer|undefined,
      playing: false as boolean,
      stalledTimout: undefined as ReturnType<typeof setTimeout>|undefined,
    };
  },
  computed:{
    videoElement(): HTMLVideoElement{
      return (this.$refs.videoelement as HTMLVideoElement);
    },
    videoOptions(){
      return {
        autoplay: true,
        controls: true,
        liveui: true,
        sources: [
          {
            src: this.hlsUrl,
            type: 'application/x-mpegURL',
          }
        ],
        html5: {
          vhs: {
            overrideNative:  !videojs.browser.IS_SAFARI,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
        plugins: {
          hlsQualitySelector: {
            displayCurrentQuality: true,
          },
        },
      }
    }
  },
  mounted(){
    this.playLive();
    this.useVideoSrc = ""!==this.videoElement.canPlayType('application/vnd.apple.mpegurl') && !navigator.userAgent.includes('Android');
  },

  beforeUnmount() { 
    if(this.playing){
      this.stopLive();
    }
  },

  methods: {
    definedStalledTimeout(){
      this.stalledTimout =setTimeout(()=>{
        this.videoClean();
        this.playLive();
      }, 5000);
    },
    async playLive(): Promise<void> {
      clearTimeout(this.stalledTimout);
      this.definedStalledTimeout();
      if (this.useVideoSrc) {
        this.playLiveIos();
        return;
      }
      this.player = videojs((document.getElementById("video-element-hls") as Element), this.videoOptions, () => {
        this.errorPlay = "";
        this.playing = true; 
      });
      this.player.on('timeupdate', () => {
        clearTimeout(this.stalledTimout);
        this.definedStalledTimeout();
      });
      this.player.on('error', (error) => {
        this.stopLive();
        if (error.description && error.description.includes('403')) {
          this.errorPlay = this.$t('Video is unavailable');
        }else{
          this.errorPlay = this.$t('Podcast play error');
        }
      });
    },
    async playLiveIos(): Promise<void>{
      this.videoElement.onloadedmetadata = ()=>{
        const playPromise =  this.videoElement.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.errorPlay = "";
            this.playing = true; 
          })
          .catch(() => {
            this.playing = false; 
          });
        }
      };
      this.videoElement.onerror = async()=>{
        this.stopLive();
        this.errorPlay = this.$t('Podcast play error');
      };
       this.videoElement.ontimeupdate = async()=>{
          clearTimeout(this.stalledTimout);
          this.definedStalledTimeout();
      };
      this.videoElement.src = this.hlsUrl;
    },
    videoClean(): void{
      if(this.useVideoSrc){
        this.videoElement.pause();
        this.videoElement.removeAttribute('src');
        this.videoElement.load();
        return;
      }
      if(this.player){
        this.player.dispose();
        //Redraw
        const video_parent = document.getElementById("player-video-hls");
        if(video_parent){
          const video = document.createElement('video');
          video.id="video-element-hls";
          video.className="video-js";
          video.preload="auto";
          video.setAttribute("playsinline","true");
          video_parent.appendChild(video);
        }
      }
    },
    stopLive(): void{
      clearTimeout(this.stalledTimout);
      this.errorPlay = "";
      this.videoClean();
      this.playing = false;
    },
  },

});
</script>

<style lang="scss">
@import 'video.js';
@import "@scss/_variables.scss";
.octopus-app{
  .video-live-error{
    text-align: center;
    width: 100%;
    font-size: 1rem;
    font-weight: bold;
    padding: 0.2rem 0;
    color: white;
    position: absolute;
    top: 0;
    background: $danger;
    z-index: 1;
  }
  .video-js{
    width: 500px;
    height: 281px;
  }
}
</style>
