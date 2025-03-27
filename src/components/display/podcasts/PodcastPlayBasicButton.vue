<template>
  <button
    class="btn play-button-box bg-primary"
    @click="clickBtn(podcast)"
  >
    <PlayIcon v-if="btnPlay" class="text-light" :title="$t('Play')" />
    <PauseIcon v-else class="text-light" :title="$t('Pause')" />
  </button>
</template>

<script lang="ts">
import PlayIcon from "vue-material-design-icons/Play.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { mapState, mapActions } from "pinia";
import { defineComponent } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
export default defineComponent({
  name: "PodcastPlayBasicButton",
  components: {
    PlayIcon,
    PauseIcon
  },
  props: {
    podcast: { default: () => ({}), type: Object as () => Podcast },
  },
  computed: {
    ...mapState(usePlayerStore, ["playerPodcast", "playerStatus"]),
    btnPlay(){
      return this.playerPodcast !== this.podcast || (this.playerPodcast === this.podcast && 'PAUSED' === this.playerStatus);
    }
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerPlay", "playerChangeStatus"]),
    clickBtn(podcast: Podcast){
      if(this.btnPlay){
        this.play(podcast);
        return;
      }
      this.pause();
    },
    play(podcast: Podcast): void {
      if (podcast === this.playerPodcast) {
        this.playerChangeStatus(false);
      } else {
        this.playerPlay(podcast);
      }
    },
    pause(): void {
      this.playerChangeStatus(true);
    },
  },
});
</script>
<style lang="scss">
@use "../../../style/playButton";
</style>