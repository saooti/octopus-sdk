<template>
  <button
    :title="$t('Change speed')"
    class="btn play-button-box small-font btn-transparent text-light me-0"
    @click="changeSpeed"
  >
  {{
    "×"+speedArray[speedIndex]
  }}</button>
</template>
<script lang="ts">

import { defineComponent } from "vue";
export default defineComponent({
  name: "PlayerSpeedButton",

  data() {
    return {
      audioPlayer: null as HTMLAudioElement | null,
      speedIndex: 2 as number,
      speedArray: [0.5,0.75, 1, 1.25, 1.5,1.75],
    };
  },
  mounted(){
    this.audioPlayer =document.querySelector("#audio-player");
  },
  methods: {
    changeSpeed() {
      this.speedIndex += 1;
      if (this.speedIndex > this.speedArray.length - 1) {
        this.speedIndex = 0;
      }
      if(this.audioPlayer){
        this.audioPlayer.playbackRate = this.speedArray[this.speedIndex];
      }
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {

}
</style>
