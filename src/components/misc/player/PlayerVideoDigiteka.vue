<template>
  <div>
    <iframe
      v-if="playerPodcast?.video?.videoId"
      ref="iframeVideo"
      :src="srcVideo"
      :title="$t('Video')"
      width="500"
      height="281"
      style="z-index: 1"
      ebkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowfullscreen="true"
      allow="fullscreen, autoplay"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
    <SnackBar ref="snackbar" position="bottom-left" />
  </div>
</template>

<script lang="ts">
import SnackBar from "../../misc/SnackBar.vue";
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PlayerVideo",
  components: {
    SnackBar,
  },

  computed: {
    ...mapState(usePlayerStore, ["playerPodcast", "playerVideo"]),
    videoId(): string | undefined {
      return this.playerPodcast?.video?.videoId;
    },
    srcVideo(): string {
      if (this.playerVideo) {
        return (
          "//www.ultimedia.com/deliver/generic/iframe/mdtk/01009833/zone/1/showtitle/1/src/" +
          this.videoId +
          "/sound/true/autoplay/1"
        );
      }
      return "";
    },
  },
  mounted() {
    if (undefined === this.videoId) {
      (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
        this.$t("Podcast play error"),
      );
    }
  },
});
</script>
