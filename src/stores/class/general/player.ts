import { Media } from "./media";
import { Podcast } from "./podcast";

export interface Radio {
  canalId: number;
  url: string;
  metadata: MediaRadio;
  history: Array<MediaRadio>;
  nextAdvertising: NextAdvertising;
  isInit: boolean;
  podcast?: Podcast;
  sessionId?: string;
  dateSessionId?: string;
}
export interface MediaRadio {
  artist: string;
  mediaId?: number;
  podcastId: number;
  startDate: string;
  title: string;
  mediaDuration: number;
  playDuration: number;
}
export interface NextAdvertising {
  startDate?: string;
  tag?: string;
}

export interface MetadataRadio {
  channelId: number;
  currently: MediaRadio;
  previously: Array<MediaRadio>;
  nextAdvertising: NextAdvertising;
}

export interface Player {
  status: string; //STOPPED, LOADING, PLAYING, PAUSED
  podcast: Podcast | undefined;
  volume?: number; //From 0 to 1
  elapsed?: number; //From 0 to 1
  total?: number;
  media: Media | undefined;
  live: Podcast | undefined;
  radio: Radio | undefined;
  stop?: boolean;
  seekTime?: number;
  transcript?: {
    actual: number;
    actualText: string;
    value: Array<{ endTime: number; startTime: number; text: string }>;
  };
}
export interface CodeInsert {
  headerInsert: string | null;
}
export function emptyCodeInsert(): CodeInsert {
  return {
    headerInsert: null,
  };
}
