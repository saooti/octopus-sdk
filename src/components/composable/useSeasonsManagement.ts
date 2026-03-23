import { Podcast } from "@/stores/class/general/podcast";
import { Emission, SeasonMode } from "../../stores/class/general/emission";

/**
 * Composable to facilitate seasons operations
 */
export const useSeasonsManagement = () => {
    /**
     * Indicates that seasons are enabled on the given emission
     * @param emission The emission to check for seasons
     * @returns True if seasons are enabled, false otherwise
     */
    function areSeasonsEnabled(emission: Emission): boolean {
        return [
            SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING,
            SeasonMode.SEASON_WITH_PODCAST_NUMBERING
        ].includes(emission.seasonMode);
    }

    /**
     * Simple formatter to display season/episode of the given podcast
     * @param podcast The podcast to check
     * @returns A string describing the season/episode of the podcast or null
     *          if no seasons are defined
     */
    function formatSeason(podcast: Podcast): string|null {
        switch (podcast.emission.seasonMode) {
            case SeasonMode.NO_SEASON:
                return null;

            case SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING:
                return `S${podcast.seasonNumber}`;

            case SeasonMode.SEASON_WITH_PODCAST_NUMBERING:
                return `S${podcast.seasonNumber}·E${podcast.seasonEpisodeNumber}`;
        }
    }

    /**
     * Returns the highest season number for the given emission, or -Infinity if none
     * @param emission The emission to check
     */
    function getMaxSeason(emission: Emission | undefined): number {
        return Math.max(...(emission?.seasons ?? []));
    }

    return {
        areSeasonsEnabled,
        formatSeason,
        getMaxSeason,
    }
}
