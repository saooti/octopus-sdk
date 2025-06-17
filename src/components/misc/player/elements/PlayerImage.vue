<template>
  <div>
    <a
      v-if="vastStore.linkAdvertising"
      rel="noreferrer noopener"
      target="_blank"
      :href="vastStore.linkAdvertising"
      class="player-image link-image"
      :class="imageWidth > 50 ? 'big-player-image' : ''"
      :title="t('New window', {text: t('Advertising')})"
    >
      <LinkVariantIcon />
    </a>
    <router-link
      v-else-if="playerStore.podcastImage"
      :to="podcastShareUrl"
      :title="t('Episode name page', { name: podcastDisplay?.title })"
    >
      <img
        v-lazy="useProxyImageUrl(playerStore.podcastImage, imageWidth)"
        :width="imageWidth"
        :height="imageWidth"
        aria-hidden="true"
        alt=""
        
        :title="t('Episode name image', { name: podcastDisplay?.title })"
        class="player-image"
        :class="imageWidth > 50 ? 'big-player-image' : ''"
      />
    </router-link>
  </div>
</template>
<script setup lang="ts">
import LinkVariantIcon from "vue-material-design-icons/LinkVariant.vue";
import {useImageProxy} from "../../../composable/useImageProxy";
import { computed } from "vue";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { useVastStore } from "../../../../stores/VastStore";
import { useI18n } from "vue-i18n";


//Props 
defineProps({
  imageWidth: { default: 48, type: Number },
})

//Composables
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();
const playerStore = usePlayerStore();
const vastStore = useVastStore();


//Computed
const podcastDisplay = computed(() => {
  if (playerStore.playerRadio?.podcast) {
    return playerStore.playerRadio?.podcast;
  }
  if (playerStore.playerPodcast) {
    return playerStore.playerPodcast;
  }
  return undefined;
});
const podcastShareUrl = computed(() => {
  if (playerStore.playerRadio?.podcast?.podcastId) {
    return {
      name: "podcast",
      params: {
        podcastId: playerStore.playerRadio?.podcast?.podcastId.toString(),
      },
    };
  }
  if (playerStore.playerPodcast) {
    return {
      name: "podcast",
      params: { podcastId: playerStore.playerPodcast.podcastId.toString() },
    };
  }
  return "";
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
