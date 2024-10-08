<template>
  <div>
    <a
      v-if="linkAdvertising"
      rel="noopener"
      target="_blank"
      :href="linkAdvertising"
      class="saooti-link player-image"
      :class="imageWidth > 50 ? 'big-player-image' : ''"
      :title="$t('Advertising')"
    />
    <router-link v-else-if="isImage && podcastImage" :to="podcastShareUrl">
      <img
        v-lazy="proxyImageUrl(podcastImage, imageWidth)"
        :width="imageWidth"
        :height="imageWidth"
        :alt="$t('Podcast image')"
        class="player-image"
        :class="imageWidth > 50 ? 'big-player-image' : ''"
      />
    </router-link>
  </div>
</template>
<script lang="ts">
import { state } from "../../../../stores/ParamSdkStore";
import imageProxy from "../../../mixins/imageProxy";
import { defineComponent } from "vue";
import { RouteLocationRaw } from "vue-router";
import { mapState } from "pinia";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { useFilterStore } from "../../../../stores/FilterStore";
import { useVastStore } from "../../../../stores/VastStore";
export default defineComponent({
  name: "PlayerImage",

  components: {},

  mixins: [imageProxy],
  props: {
    imageWidth: { default: 48, type: Number },
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerRadio",
      "podcastImage",
    ]),
    ...mapState(useVastStore, ["linkAdvertising"]),
    ...mapState(useFilterStore, ["filterOrgaId"]),
    isImage(): boolean {
      return state.player.image as boolean;
    },
    podcastShareUrl(): RouteLocationRaw | string {
      if (this.playerRadio?.podcast?.podcastId) {
        return {
          name: "podcast",
          params: {
            podcastId: this.playerRadio?.podcast?.podcastId.toString(),
          },
          query: { productor: this.filterOrgaId },
        };
      }
      if (this.playerPodcast) {
        return {
          name: "podcast",
          params: { podcastId: this.playerPodcast.podcastId.toString() },
          query: { productor: this.filterOrgaId },
        };
      }
      return "";
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .player-image {
    border-radius: $octopus-borderradius;
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 0.5rem;
    cursor: pointer;
    /** PHONES*/
    @media (max-width: 450px) {
      height: 1.8rem;
      width: 1.8rem;
    }
    &.big-player-image {
      height: 200px;
      width: 200px;
    }
    &.saooti-link {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ddd;
      color: black;
    }
  }
}
</style>
