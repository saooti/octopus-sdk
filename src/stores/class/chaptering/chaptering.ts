export interface Chapter {
  startTime: string;
  title: string;
}

export interface ChapterPercent {
  startPercent: number;
  endPercent: number;
  title: string;
}

export type Chaptering = Array<Chapter>;
export type ChapteringPercent = Array<ChapterPercent>;