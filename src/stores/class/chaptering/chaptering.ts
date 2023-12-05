export interface Chaptering {
  [startTime: string] : string;
}

export interface ChapterPercent {
  startTime: string;
  startPercent: number;
  endPercent: number;
  title: string;
}

export type ChapteringPercent = Array<ChapterPercent>;