//https://github.com/Podcastindex-org/podcast-namespace/blob/main/chapters/jsonChapters.md
export interface Chaptering {
  version: string;
  chapters: Array<Chapter>;
}

export interface Chapter{
  startTime: number;
  title: string;
  img?: string;
  url?:string
}

export interface ChapterPercent {
  startTime: number;
  startDisplay: string;
  startPercent: number;
  endPercent: number;
  title: string;
}


export type ChapteringPercent = Array<ChapterPercent>;