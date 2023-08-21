<template>
  <iframe
    ref="iframeVideo"
    :src="srcVideo"
    :title="$t('Video')"
    width="500"
    height="281"
    style="z-index: 1"
    allowfullscreen="true"
    allow="autoplay"
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
</template>

<script lang="ts">
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PlayerVideo",
  components: {},

  computed: {
    ...mapState(usePlayerStore, ["playerPodcast", "playerVideo"]),
    srcVideo(): string {
      if (this.playerVideo) {
        return (
          "//www.ultimedia.com/deliver/generic/iframe/mdtk/01009833/zone/1/showtitle/1/src/" +
          this.playerPodcast?.video?.videoId +
          "/autoplay/1"
        );
      }
      return "";
    },
  },
  watch: {
    srcVideo() {
      this.goFullScreen();
    },
  },
  mounted() {
    this.goFullScreen();
  },
  methods: {
    goFullScreen() {
      if ("" === this.srcVideo) {
        return;
      }
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
    },
  },
});
</script>
