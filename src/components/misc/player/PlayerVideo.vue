<template>
  <teleport to=".octopus-app">
    <template v-if="playerVideo">
      <button 
        class="btn btn-transparent video-close saooti-remove"
        @click="$emit('close')"
      />
      <div class="video-wrapper">
        <iframe 
          ref="iframeVideo"
          :src="srcVideo"
          width="500" 
          height="281" 
          style="z-index:1;" 
          allowfullscreen="true" 
          allow="autoplay" 
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </template>
  </teleport>
</template>

<script lang="ts">
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PlayerVideo",
  components: {
  },
  emits:['close'],

  computed:{
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerVideo"
    ]),
    srcVideo(): string{
      if(this.playerVideo){
        return "//www.ultimedia.com/deliver/generic/iframe/mdtk/01009833/zone/1/showtitle/1/src/"+ this.playerPodcast?.video?.videoId+"/autoplay/1";
      }
      return "";
    }
  },
  watch:{
    srcVideo() {
      this.goFullScreen();
    },
  },
  mounted(){
    this.goFullScreen();
  },
  methods:{
    goFullScreen(){
      if(""===this.srcVideo){return;}
      switch (screen.orientation.type) {
        case "landscape-primary":
        case "landscape-secondary":
          (this.$refs.iframeVideo as Element).requestFullscreen();
          break;
        case "portrait-secondary":
        case "portrait-primary":
          console.log("Portrait mode");
          break;
        default:
          console.log("The orientation API isn't supported in this browser :(");
      }
    }
  }

});
</script>
<style lang="scss">
.octopus-app {
  .video-wrapper{
    border-radius: 2rem;
    overflow: hidden;
    position: fixed;
    bottom: 2.5rem;
    right: 0;
    z-index: 10;
  }
  .video-close{
    position: fixed;
    bottom: 16.5rem;
    right: 1rem;

  }
  @media (max-width: 500px) {
    .video-wrapper{
      position:relative;
      padding-bottom:56.25%;
      height:0;
    }
    .video-wrapper iframe {
      position:absolute;
      top:0;
      left:0;
      width:100% !important;
      height:100%;
      margin:0 !important;
    }
  }
}
</style>