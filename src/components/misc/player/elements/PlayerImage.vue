<template>
  <div>
    <a
      v-if="linkAdvertising"
      rel="noreferrer noopener"
      target="_blank"
      :href="linkAdvertising"
      class="player-image link-image"
      :class="imageWidth > 50 ? 'big-player-image' : ''"
      :title="$t('New window', {text: $t('Advertising')})"
    >
      <LinkVariantIcon />
    </a>
    <router-link
      v-else-if="podcastImage"
      :to="podcastShareUrl"
      :title="$t('Episode name page', { name: podcastDisplay?.title })"
    >
      <img
        v-lazy="useProxyImageUrl(podcastImage, imageWidth)"
        :width="imageWidth"
        :height="imageWidth"
        role="presentation"
        alt=""
        :title="$t('Episode name image', { name: podcastDisplay?.title })"
        class="player-image"
        :class="imageWidth > 50 ? 'big-player-image' : ''"
      />
    </router-link>
  </div>
</template>
<script lang="ts">
import LinkVariantIcon from "vue-material-design-icons/LinkVariant.vue";
import {useImageProxy} from "../../../composable/useImageProxy";
import { defineComponent } from "vue";
import { RouteLocationRaw } from "vue-router";
import { mapState } from "pinia";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { useVastStore } from "../../../../stores/VastStore";
import { Podcast } from "@/stores/class/general/podcast";
export default defineComponent({
  name: "PlayerImage",

  components: { LinkVariantIcon },

  props: {
    imageWidth: { default: 48, type: Number },
  },
  setup(){
    const { useProxyImageUrl } = useImageProxy();
    return { useProxyImageUrl }
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerRadio",
      "podcastImage",
    ]),
    ...mapState(useVastStore, ["linkAdvertising"]),
    podcastDisplay(): Podcast | undefined {
      if (this.playerRadio?.podcast) {
        return this.playerRadio?.podcast;
      }
      if (this.playerPodcast) {
        return this.playerPodcast;
      }
      return undefined;
    },
    podcastShareUrl(): RouteLocationRaw | string {
      if (this.playerRadio?.podcast?.podcastId) {
        return {
          name: "podcast",
          params: {
            podcastId: this.playerRadio?.podcast?.podcastId.toString(),
          },
        };
      }
      if (this.playerPodcast) {
        return {
          name: "podcast",
          params: { podcastId: this.playerPodcast.podcastId.toString() },
        };
      }
      return "";
    },
  },
});
</script>

<style lang="scss">

.octopus-app .player-image {
  border-radius: var(--octopus-border-radius);
  height: 2.4rem;
  width: 2.4rem;
  margin-right: 0.5rem;
  cursor: pointer;

  /** PHONES */
  @media (width <= 450px) {
    height: 1.8rem;
    width: 1.8rem;
  }

  &.big-player-image {
    height: 200px;
    width: 200px;
  }

  &.link-image {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--octopus-secondary);
    color: black;
  }
}
</style>
