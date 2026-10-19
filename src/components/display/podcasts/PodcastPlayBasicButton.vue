<template>
  <button
    class="btn play-button-box bg-primary"
    @click="clickBtn(podcast)"
  >
    <PlayIcon v-if="btnPlay" class="text-light" :title="t('Play')" />
    <PauseIcon v-else class="text-light" :title="t('Pause')" />
  </button>
</template>

<script setup lang="ts">
import PlayIcon from "vue-material-design-icons/Play.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import { computed } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";
import { saootiPlayer } from "@saooti/saooti-player";
import { useSaootiPlayer } from "@/components/composable/useSaootiPlayer";

//Props 
const props = defineProps<{
  podcast: Podcast;
}>();

//Composables
const { t } = useI18n();
const { playerStatus, podcastPlaying } = useSaootiPlayer();

//Computed
const currentPodcastPlaying = computed((): boolean =>
  props.podcast.podcastId === podcastPlaying.value
);

const btnPlay = computed(() => !currentPodcastPlaying.value || (currentPodcastPlaying.value && 'PAUSED' === playerStatus.value));

//Methods
function clickBtn(podcast: Podcast){
  if(btnPlay.value){
    play(podcast);
    return;
  }
  pause();
}
function play(podcast: Podcast): void {
  if (currentPodcastPlaying.value) {
    saootiPlayer.togglePlay();
  } else {
    saootiPlayer.playPodcast(podcast.podcastId);
  }
}
function pause(): void {
  saootiPlayer.stop();
}
</script>
<style lang="scss">
@use "../../../style/playButton";
</style>
