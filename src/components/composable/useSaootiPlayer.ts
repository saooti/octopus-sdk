import { saootiPlayer } from "@saooti/saooti-player";
import { computed } from "vue";

export const useSaootiPlayer = () => {
    const playerStatus = computed((): string => saootiPlayer.state.status);

    const podcastPlaying = computed((): number|undefined => saootiPlayer.state.podcast?.podcastId);
    const radioPlaying = computed((): number|undefined => saootiPlayer.state.radio?.canalId);

    const videoPlaying = computed((): boolean => saootiPlayer.state.isVideo);

    return {
        playerStatus,
        podcastPlaying,
        radioPlaying,
        videoPlaying
    }
}
