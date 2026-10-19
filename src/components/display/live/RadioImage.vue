<template>
  <div
    class="img-box img-box-podcast position-relative flex-shrink-0 mb-3 me-3 float-start"
  >
    <img
      v-lazy="
        radio.imageUrl
          ? useProxyImageUrl(radio.imageUrl, '270')
          : '/img/emptyradio.webp'
      "
      width="270"
      height="270"
      aria-hidden="true"
        alt=""
      
      class="img-box img-box-podcast"
      :title="t('Canal name image', { name: radio.name })"
    />
    <button class="radio-play-button" @click="playRadio">
      <PlayIcon v-if="!playingRadio" :title="t('Play')" :size="40" />
      <PodcastIsPlaying v-else />
      <div class="mx-2">
        {{ playText }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import PlayIcon from "vue-material-design-icons/Play.vue";
import {useImageProxy} from "../../composable/useImageProxy";
import { computed, defineAsyncComponent } from "vue";
import { Canal } from "@/stores/class/radio/canal";
import { useI18n } from "vue-i18n";
import { saootiPlayer } from "@saooti/saooti-player";
import { useSaootiPlayer } from "@/components/composable/useSaootiPlayer";
const PodcastIsPlaying = defineAsyncComponent(() => import("../podcasts/PodcastIsPlaying.vue"));

//Props 
const props = defineProps<{
  radio: Canal;
}>();

//Composables
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();
const { playerStatus, radioPlaying } = useSaootiPlayer();

//Computed
const playingRadio = computed(() => {
  return radioPlaying.value === props.radio.id;
});

const playText = computed(() => {
  return playingRadio.value && "PLAYING" === playerStatus.value ? t("Pause") : t("Play");
});


//Methods
function playRadio(): void {
  if (!props.radio) {
    return;
  }

  if (playingRadio.value) {
    saootiPlayer.togglePlay();
  } else {
    saootiPlayer.playRadio(props.radio.id);
    //secured: props.radio.organisationId === authStore.authOrganisation?.id && "SECURED"===authStore.authOrganisation?.privacy
  }
}
</script>

<style scoped lang="scss">
.radio-play-button{
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 0;
  font-size: 1rem;
  color: var(--octopus-color-on-primary);
  background-color: var(--octopus-primary-less-transparent);
  border-radius: var(--octopus-border-radius);
  padding:  0.2rem;
  border: 0;
}
</style>
