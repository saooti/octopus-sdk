import { describe, expect, it } from 'vitest';
import { useSeasonsManagement } from '@/components/composable/useSeasonsManagement';
import { emptyEmissionData, SeasonMode } from '@/stores/class/general/emission';
import { emptyPodcastData } from '@/stores/class/general/podcast';

const { areSeasonsEnabled, formatSeason } = useSeasonsManagement();

describe('useSeasonsManagement', () => {
    describe('areSeasonsEnabled', () => {
        it.each([
            SeasonMode.SEASON_WITH_PODCAST_NUMBERING,
            SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING,
        ])('returns true for %s', (seasonMode) => {
            expect(areSeasonsEnabled({ ...emptyEmissionData(), seasonMode })).toBe(true);
        });

        it('returns false for NO_SEASON', () => {
            expect(areSeasonsEnabled(emptyEmissionData())).toBe(false);
        });
    });

    describe('formatSeason', () => {
        it.each([
            { seasonMode: SeasonMode.NO_SEASON,                         seasonNumber: 1, seasonEpisodeNumber: 1, expected: null    },
            { seasonMode: SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING,  seasonNumber: 2, seasonEpisodeNumber: 1, expected: 'S2'    },
            { seasonMode: SeasonMode.SEASON_WITH_PODCAST_NUMBERING,     seasonNumber: 2, seasonEpisodeNumber: 5, expected: 'S2·E5' },
        ])('formats $seasonMode as $expected', ({ seasonMode, seasonNumber, seasonEpisodeNumber, expected }) => {
            const podcast = emptyPodcastData();
            podcast.seasonNumber = seasonNumber;
            podcast.seasonEpisodeNumber = seasonEpisodeNumber;
            podcast.emission.seasonMode = seasonMode;
            expect(formatSeason(podcast)).toBe(expected);
        });
    });
});
