<template>
  <div :class="responsive ? 'video-responsive-wrapper' : ''">
    <iframe
      v-if="videoId"
      ref="iframeVideo"
      :src="srcVideo"
      :title="$t('Video')"
      width="500"
      height="281"
      style="z-index: 1"
      ebkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowfullscreen="true"
      allow="fullscreen; autoplay"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
    <SnackBar ref="snackbar" position="bottom-left" />
  </div>
</template>

<script lang="ts">
import SnackBar from "../../SnackBar.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PlayerVideo",
  components: {
    SnackBar,
  },
  props: {
    videoId: { default: undefined, type: String },
    responsive: { default: false, type: Boolean },
  },

  computed: {
    srcVideo(): string {
      return (
        "//www.ultimedia.com/deliver/generic/iframe/mdtk/01009833/zone/1/showtitle/1/src/" +
        this.videoId +
        "/sound/yes/autoplay/1"
      );
    },
  },
  mounted() {
    if (undefined === this.videoId) {
      (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
        this.$t("Podcast play error"),
      );
    }
  },
  methods: {
    goFullScreen() {
      if ("" === this.srcVideo) {
        return;
      }
      (this.$refs.iframeVideo as Element).requestFullscreen();
    },
  },
});
</script>
<style lang="scss">
@import "../../../../assets/videoPlayer.scss";
</style>
