<template>
  <div class="video-player">
    <div v-if="errorPlay.length" class="video-live-error">{{errorPlay}}</div>
    <video
      v-show="useVideoSrc"
      ref="videoelement"
      playsinline
    />
    <div
      ref="videocontainer"
      class="video-container"
    />
  </div>
</template>
<script lang="ts">

// @ts-ignore
import Clappr from '@clappr/core';
// @ts-ignore
import HlsjsPlayback from '@clappr/hlsjs-playback';
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
      player: undefined as Clappr.Player,
      playing: false as boolean,
      stalledTimout: undefined as ReturnType<typeof setTimeout>|undefined,
    };
  },
  computed:{
    videoContainer(): HTMLElement{
      return (this.$refs.videocontainer as HTMLElement);
    },
    videoElement(): HTMLVideoElement{
      return (this.$refs.videoelement as HTMLVideoElement);
    },
  },
  mounted(){
    this.playLive();
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
      if (this.videoElement.canPlayType('application/vnd.apple.mpegurl') && !navigator.userAgent.includes('Android')) {
        this.useVideoSrc = true;
        this.playLiveIos();
        return;
      }
      this.player = new Clappr.Player({
        source: this.hlsUrl,
        autoPlay: false,
        height: '100%',
        width: '100%',
        plugins: {
          playback: [HlsjsPlayback],
        },
        playback: {
          controls: true,
          playInline: true,
          hlsjsConfig: {
            enableWorker: false,
            debug:true,
          }
        },
        events: {
          onError: async(error: Clappr.error) =>{
            this.stopLive();
            if (error.description && error.description.includes('403')) {
              this.errorPlay = this.$t('Video is unavailable');
            }else{
              this.errorPlay = this.$t('Podcast play error');
            }
          },
          onPlay:()=>{
            this.errorPlay = "";
            this.playing = true; 
          },
          onTimeUpdate:()=>{
            clearTimeout(this.stalledTimout);
            this.definedStalledTimeout();
          }
        }
      });
      this.playing = true; 
      this.player.attachTo(this.videoContainer);
      if(0!==this.videoContainer.getElementsByTagName("video").length){
        this.videoContainer.getElementsByTagName("video")[0].play();
      }
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
      this.player.destroy();
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
  .video-container{
    width: 500px;
    height: 281px;
  }
}
</style>
