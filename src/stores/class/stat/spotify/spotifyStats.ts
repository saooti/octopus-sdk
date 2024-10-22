export interface SpotifyStats {
  [aggType: string]: {
    name?: string;
    uri: string;
    startDate: string;
    endDate: string;
    counts: {
      total: string;
    };
    countryFacetedCounts: {
      [key: string]: {
        total: string;
      };
    };
  };
}

export function mockSpotify(aggregatorType: string): SpotifyStats {
  return {
    [aggregatorType]: {
      uri: "spotify:show:587HRsxbxYBDQ1cLZL0gU9",
      startDate: "2019-05-05",
      endDate: "2019-05-15",
      counts: {
        total: "123",
      },
      countryFacetedCounts: {
        CA: {
          total: "11",
        },
        FR: {
          total: "112",
        },
      },
    },
  };
}

export function emptySpotifyStats(
  spotifyId: string,
  start: string,
  end: string,
  aggregatorType: string,
): SpotifyStats {
  return {
    [aggregatorType]: {
      uri: spotifyId,
      startDate: start,
      endDate: end,
      counts: {
        total: "0",
      },
      countryFacetedCounts: {},
    },
  };
}
