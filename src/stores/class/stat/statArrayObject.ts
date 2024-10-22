export interface StatDevice {
  OTHER: StatCounters;
  DESKTOP: StatCounters;
  MOBILE: StatCounters;
  TABLET: StatCounters;
  TOTAL: StatCounters;
}
export interface InnerStatArrayObject {
  name: string;
  value: StatDevice;
}
export interface StatArrayObject {
  id?: string;
  origins: Array<InnerStatArrayObject>;
  originsLive?: Array<InnerStatArrayObject>;
  duration?: number;
  pubDate?: string;
  title: string;
}
export interface InnerStatDataArray {
  [key: string]: {
    name?: string;
    total: number;
    duration?: number;
    pubDate?: string;
    origins: {
      [key: string]: {
        [key: string]: StatCounters | string;
      };
    };
  };
}
export interface StatCounters {
  count: number;
  averageCompletion: number;
  count25to50percent: number;
  count50to75percent: number;
  countLess25percent: number;
  countMoreThan75percent: number;
}
export function emptyStatCounters(count?: number): StatCounters {
  return {
    count: count ?? 0,
    averageCompletion: 0,
    count25to50percent: 0,
    count50to75percent: 0,
    countLess25percent: 0,
    countMoreThan75percent: 0,
  };
}
export interface StatDataArray {
  emissionId?: InnerStatDataArray;
  podcastId?: InnerStatDataArray;
  total: number;
}
