<template>
  <div v-if="playerError" class="text-warning mx-2">
    {{ t("Podcast play error") + " - " }}
  </div>
  <component
    :is="vastStore.linkAdvertising ? 'a' : 'div'"
    class="flex-grow-1 text-truncate text-light"
    :class="titleClass"
    :href="vastStore.linkAdvertising"
    rel="noreferrer noopener"
    target="_blank"
    :title="t('New window', {text: podcastTitle})"
  >
    {{ podcastTitle }}
  </component>
</template>
<script setup lang="ts">
import {useFetchRadio} from "../../../composable/radio/usefetchRadioData";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { useVastStore } from "../../../../stores/VastStore";
import { computed, onUnmounted, Ref, ref, watch } from "vue";
import { MediaRadio, NextAdvertising } from "@/stores/class/general/player";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  playerError: { default: false, type: Boolean },
  hlsReady: { default: false, type: Boolean },
  titleClass: { default: "", type: String },
})

//Data 
const radioInterval: Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);

//Composables
const { t } = useI18n();
const { fetchRadioMetadata, displayTitle } = useFetchRadio();
const playerStore = usePlayerStore();
const vastStore = useVastStore();


//Computed
const podcastTitle = computed(() => {
  if (vastStore.isAdPlaying) {
    return t("Advertising") + vastStore.titleAdvertising;
  }
  if (playerStore.playerRadio) {
    if (playerStore.playerRadio.podcast) {
      return playerStore.playerRadio.podcast.title;
    }
    return displayTitle(playerStore.playerRadio.metadata);
  }
  if (playerStore.playerPodcast) {
    return playerStore.playerPodcast.title;
  }
  if (playerStore.playerMedia) return playerStore.playerMedia.title;
  if (playerStore.playerLive) {
    if (!props.hlsReady)
      return (
        playerStore.playerLive.title + " (" + t("Start in a while") + ")"
      );
    return playerStore.playerLive.title;
  }
  return "";
});

//Watch
watch(()=>playerStore.playerRadio, (newValue, oldValue) => {
  if (oldValue && newValue && newValue.canalId === oldValue.canalId) {
    return;
  }
  clearInterval(radioInterval.value as unknown as number);
  if (playerStore.playerRadio) {
    fetchCurrentlyPlaying();
    radioInterval.value = setInterval(() => {
      fetchCurrentlyPlaying();
    }, 10000);
  }
}, {deep: true,immediate: true});

onUnmounted(()=>{
  clearInterval(radioInterval.value as unknown as number);
  radioInterval.value= undefined;
})


//Methods
async function fetchCurrentlyPlaying(): Promise<void> {
  fetchRadioMetadata(
    playerStore.playerRadio?.canalId ?? 0,
    playerStore.playerRadio?.metadata?.title ?? "",
    updateMetadata,
    updateAdvertising,
  );
}
function updateAdvertising(nextAdvertising: NextAdvertising): void {
  playerStore.playerRadioUpdateNextAdvertising(nextAdvertising);
}
function updateMetadata(
  metadata: MediaRadio|undefined,
  podcast: Podcast | undefined,
  history: Array<MediaRadio>,
): void {
  playerStore.playerMetadata(metadata, history); //TODO
  playerStore.playerRadioPodcast(podcast);
}
</script>
