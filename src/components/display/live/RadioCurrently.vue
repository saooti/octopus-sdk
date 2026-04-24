<template>
  <div class="d-flex align-items-center">
    <div
      v-if="currentlyPlayingString.length || podcastRadio"
      class="me-2 fw-bold"
    >
      {{ t("Currently") + " : " }}
    </div>
    <router-link
      v-if="podcastRadio"
      class="d-flex align-items-center"
      :to="{
        name: 'podcast',
        params: { podcastId: podcastRadio.podcastId },
      }"
      :title="t('Episode name page', { name: podcastRadio.title })"
    >
      <img
        v-lazy="useProxyImageUrl(podcastRadio.imageUrl, '80')"
        width="80"
        height="80"
        class="small-img-box"
        aria-hidden="true"
        alt=""
        
        :title="t('Episode name image', { name: podcastRadio.title })"
      />
      <div>{{ podcastRadio.title }}</div>
    </router-link>
    <div v-else-if="currentlyPlayingString.length">
      {{ currentlyPlayingString }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {useFetchRadio} from "../../composable/radio/usefetchRadioData";
import { usePlayerStore } from "../../../stores/PlayerStore";
import {useImageProxy} from "../../composable/useImageProxy";
import { computed, onMounted, onUnmounted, ref, Ref } from "vue";
import { Canal } from "@/stores/class/radio/canal";
import { MediaRadio } from "@/stores/class/general/player";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  radio: { default: undefined, type: Object as () => Canal },
})

//Data 
const currentMetadata: Ref<MediaRadio | undefined> = ref(undefined);
const currentPodcast: Ref<Podcast | undefined> = ref(undefined);
const radioInterval: Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);

  
//Composables
const { t } = useI18n();
const { fetchRadioMetadata, displayTitle } = useFetchRadio();
const { useProxyImageUrl } = useImageProxy();
const playerStore = usePlayerStore();

//Computed
const playingRadio = computed(() => playerStore.playerRadio && playerStore.playerRadio.canalId === props.radio?.id);
const podcastRadio = computed(() => {
  if (playingRadio.value) {
    return playerStore.playerRadio?.podcast;
  }
  return currentPodcast.value;
});
const currentlyPlayingString = computed(() => {
  if (playingRadio.value && playerStore.playerRadio) {
    return displayTitle(playerStore.playerRadio.metadata);
  }
  return displayTitle(currentMetadata.value);
});

onMounted(()=>{
  fetchCurrentlyPlaying();
  radioInterval.value = setInterval(() => {
    fetchCurrentlyPlaying();
  }, 10000);
})

onUnmounted(()=>{
  clearInterval(radioInterval.value as unknown as number);
  radioInterval.value= undefined;
})


//Methods
async function fetchCurrentlyPlaying(): Promise<void> {
  if (!props.radio || playingRadio.value) {
    return;
  }
  fetchRadioMetadata(
    props.radio.id,
    currentMetadata.value?.title ?? "",
    updateMetadata,
  );
}
function updateMetadata(metadata: MediaRadio|undefined, podcast?: Podcast): void {
  currentMetadata.value = metadata;
  currentPodcast.value = podcast;
}
</script>

<style lang="scss">
.octopus-app .small-img-box {
  height: 80px;
  width: 80px;
  border-radius: var(--octopus-border-radius);
  overflow: hidden;
  flex-shrink: 0;
  margin: 0.5rem;
}
</style>
