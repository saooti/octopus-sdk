import { Emission, emptyEmissionData } from "./emission";
import { Organisation } from "./organisation";
import { Participant } from "./participant";
import { Person } from "../user/person";
import { Video } from "./video";

/**
 * State of processing of the audio file
 */
export enum PodcastProcessingStatus {
  Planned = "PLANNED",
  Processing = "PROCESSING",
  Ready = "READY",
  ReadyToRecord = "READY_TO_RECORD",
  Error = "ERROR",
  Cancelled = "CANCELED",
  All = "ALL"
}

/** Type of episode */
export enum PodcastType {
  FULL = 'full',
  TRAILER = 'trailer',
  BONUS = 'bonus'
}

/** Describe the availability of the podcast */
export interface PodcastAvailability {
  date?: number | null;
  visibility?: boolean;
  immediate?: boolean;
}

/**
 * Data about a podcast/episode
 */
export interface Podcast {
  /** ID of the podcast */
  podcastId: number;
  /** Emission the podcast belongs to */
  emission: Emission;
  /** Organisation the podcast belongs to */
  organisation: Organisation;
  /** URL to the image */
  imageUrl?: string;
  /** URL to the audio file (for downloading) */
  audioUrl: string;
  /** URL to the audio file (file on bucket) */
  audioStorageUrl: string;
  /** Title of the podcast */
  title: string;
  /** The availability of the podcast */
  availability: PodcastAvailability;
  /** Description of the podcast */
  description?: string;
  /** Optional summary of the podcast */
  summary?: string;
  /** Publishing date */
  pubDate?: string;
  /** The status of the processing of the audio file */
  processingStatus?: PodcastProcessingStatus;
  /** An optional list of tags */
  tags?: Array<string>;
  /** An optional list of tags for OuestFrance */
  ofTags?: Array<string>;
  /** List of beneficiaries/rights holders */
  beneficiaries: Array<string>;
  /** Indicates that the episode has explicit content */
  explicit?: boolean;
  /** Type of episode */
  seasonEpisodeType: PodcastType;
  /** Number of season in which podcast belongs */
  seasonNumber?: number;
  /** Order of the episode in the season */
  seasonEpisodeNumber?: number;

  createdAt?: string;
  createdByUserId?: string;
  annotations?: { [key: string]: string | number | boolean | undefined };
  article?: string;
  comments?: string;
  conferenceId?: number;
  valid?: boolean;
  downloadCount?: number;
  weekDownloadCount?: number;
  duration: number;
  email?: string;
  monetisable?: string;

  animators?: Array<Participant>;
  guests?: Array<Participant>;
  processorId?: string;
  publisher?: Person;
  rubriqueIds?: Array<number>;
  rssEpisode?:string;
  score?: number;
  size?: number;
  order?: number;
  video?: Video;
}

/**
 * A podcast with incomplete data
 */
export interface SimplifiedPodcast extends
  Omit<Podcast, 'emission'|'organisation'|'animators'|'guests'|'ofTags'|'comments'|'email'|'processorId'|'publisher'|'order'|'video'> {

  /** The ID of the emission */
  emissionId: number;
  /** The ID of the organisation */
  organisationId: string;
}

/**
 * Convert a simplified podcast to a complete one
 * @param simplified The incomplete podcast
 * @param organisation The organisation the podcast belongs to
 * @param emission The emission the podcast belongs to
 */
export function simplifiedToFull(simplified: SimplifiedPodcast, organisation: Organisation, emission: Emission): Podcast {
  return {
    ...simplified,
    organisation,
    emission
  };
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
    beneficiaries: [],
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
    conferenceId: undefined,
    duration: 0,
  };
}
