import { Emission, emptyEmissionData } from "./emission";
import { Organisation } from "./organisation";
import { Participant } from "./participant";
import { Person } from "../user/person";
import { Video } from "./video";

/**
 * State of processing of the audio file
 */
export enum ProcessingStatus {
  Planned = "PLANNED",
  Processing = "PROCESSING",
  Ready = "READY",
  ReadyToRecord = "READY_TO_RECORD",
  Error = "ERROR",
  Cancelled = "CANCELED",
  All = "ALL"
}

/**
 * Data about a podcast/episode
 */
export interface Podcast {
  imageUrl?: string;
  animators?: Array<Participant>;
  annotations?: { [key: string]: string | number | boolean | undefined };
  audioStorageUrl: string;
  audioUrl: string;
  article?: string;
  availability: {
    date?: number | null;
    visibility?: boolean;
    immediate?: boolean;
  };
  comments?: string;
  conferenceId?: number;
  createdAt?: string;
  createdByUserId?: string;
  valid?: boolean;
  description?: string;
  downloadCount?: number;
  duration: number;
  email?: string;
  emission: Emission;
  guests?: Array<Participant>;
  monetisable?: string;
  organisation: Organisation;
  podcastId: number;
  /** The status of the processing of the audio file */
  processingStatus?: ProcessingStatus;
  processorId?: string;
  pubDate?: string;
  publisher?: Person;
  rubriqueIds?: Array<number>;
  rssEpisode?:string;
  score?: number;
  size?: number;
  /** An optional list of tags */
  tags?: Array<string>;
  /** An optional list of tags for OuestFrance */
  ofTags?: Array<string>;
  title: string;
  weekDownloadCount?: number;
  order?: number;
  video?: Video;
}

export function emptyPodcastData(): Podcast {
  return {
    podcastId: 0,
    audioUrl: "",
    audioStorageUrl: "",
    article: "",
    imageUrl: "",
    animators: [],
    guests: [],
    emission: emptyEmissionData(),
    title: "",
    description: undefined,
    tags: [],
    availability: {
      visibility: true,
      date: undefined,
    },
    monetisable: "UNDEFINED",
    organisation: {
      id: "",
      name: "",
      imageUrl: "",
    },
    pubDate: undefined,
    conferenceId: 0,
    duration: 0,
  };
}
