import { Emission, SeasonMode } from "../../stores/class/general/emission";

export const useSeasonsManagement = () => {
    function areSeasonsEnabled(emission: Emission): boolean {
        return [
            SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING,
            SeasonMode.SEASON_WITH_PODCAST_NUMBERING
        ].includes(emission.seasonMode);
    }

    return {
        areSeasonsEnabled
    }
}
