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
import { usePlayerStore } from "../../../stores/PlayerStore";
import { computed } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  podcast: { default: () => ({}), type: Object as () => Podcast },
})

//Composables
const { t } = useI18n();
const playerStore = usePlayerStore();

//Computed
const btnPlay = computed(() => playerStore.playerPodcast !== props.podcast || (playerStore.playerPodcast === props.podcast && 'PAUSED' === playerStore.playerStatus));


//Methods
function clickBtn(podcast: Podcast){
  if(btnPlay.value){
    play(podcast);
    return;
  }
  pause();
}
function play(podcast: Podcast): void {
  if (podcast === playerStore.playerPodcast) {
    playerStore.playerChangeStatus(false);
  } else {
    playerStore.playerPlay(podcast);
  }
}
function pause(): void {
  playerStore.playerChangeStatus(true);
}
</script>
<style lang="scss">
@use "../../../style/playButton";
</style>